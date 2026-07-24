import os
import asyncio
import httpx
# in ayncio instead of session (requests)-> with aiohttp.ClientSession() as session:
import json
import logging
from supabase import create_client, Client
from datetime import datetime, timezone
import re
from sentence_transformers import SentenceTransformer, util
from keybert import KeyBERT
#import concurrent.futures
'''Update: Upon further testing I found out that some degrees didnt had modules in the Basis search. 
So I looked into it and found that the id logic I have been using (max extract) didn't match up with the database reality.
More testing and logging revealed that there was absolutely no sequence or order to those ids, so here is my solution:

Basic-Search: User needs to add his Stupo_Id in settings -> Basic search then checks all Stupo_id names and filter whether there
is such a stupo-year, and if so returns all modules from that.. I'll have to see if I keep other max filters there

Extended-Search: Here I will have to actually check all Stupos and in the dictionary I will then add another field "year", 
so then the cards for the extended Modulesearch, if there are duplicates due to stupo, show the year they belong to.
-> this means the manager function will filter via name and year -> commented out

NEW: get version_info: see if module is outdated (keep it in, if older student still wants to use the app)'''
import uuid 
# logging for Docker stdout
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(funcName)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

# run_id = os.environ.get("GITHUB_RUN_ID", "local_run")
run_id = os.environ.get("GITHUB_RUN_ID", f"local_run_{uuid.uuid4().hex[:8]}")
process_history = []

from dotenv import load_dotenv
load_dotenv()

script_dir = os.path.dirname(os.path.abspath(__file__))

root_dir = os.path.dirname(script_dir)

env_path = os.path.join(root_dir, ".env.local") 
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)

base_url = os.getenv("MOSES_API_URL")
api_key = os.getenv("MOSES_API_KEY")
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
service_role = os.getenv("SERVICE_ROLE_KEY")

if not base_url:
    raise ValueError(f"CRITICAL: Could not find moses_API_URL! Checked path: {env_path}")
headers = { 
    "accept": "application/json",
    "x-api-key": api_key
    }
#I kept getting timeout bc of the amount of requests, so I switched from requests to sessions, to reduce TLS
# session = requests.Session()
# session.headers.update(headers)
# from requests.adapters import HTTPAdapter
# adapter = HTTPAdapter(pool_connections=5, pool_maxsize=5, max_retries=3)
# session.mount('https://', adapter)
# session.mount('http://', adapter)
timeout_config = httpx.Timeout(15.0, connect=30.0)

async def fetch_with_retry(client, endpoint, headers=None, params=None, retries=3):
    for attempt in range(retries):
        try:
            response = await client.get(
                endpoint, 
                headers=headers, 
                params=params, 
                timeout=timeout_config
            )
            response.raise_for_status()
            return response
            
        except (httpx.ConnectTimeout, httpx.ReadTimeout) as e:
            if attempt == retries - 1:
                error_msg = f"Timeout on {endpoint} after {retries} attempts."
                await send_status_admin(error_msg, "ERROR")
                raise e
                
            logging.warning(f"Timeout on {endpoint}. Retrying {attempt + 1}/{retries} in {2 ** attempt}s...")
            await asyncio.sleep(2 ** attempt) 
            
        except httpx.HTTPStatusError as e:

            if e.response.status_code in [429, 500, 502, 503, 504] and attempt < retries - 1:
                logging.warning(f"Server error {e.response.status_code} on {endpoint}. Retrying in {2 ** attempt}s...")
                await asyncio.sleep(2 ** attempt)
            elif e.response.status_code == 404:
                logging.warning(f"Ignored 404 Not Found on {endpoint}")
                return httpx.Response(404, json={"data": []}, request=e.request)
            else:
                error_msg = f"HTTP Error {e.response.status_code} on {endpoint}"
                await send_status_admin(error_msg, "ERROR")
                raise e
                
        except Exception as e:
            await send_status_admin(f"Unexpected request failure on {endpoint}: {e}", "ERROR")
            raise e
        
# retry_strategy = Retry(
#         total=5, 
#         backoff_factor=1.0,
#         status_forcelist=[429, 500, 502, 503, 504] )
#    transport = RetryTransport(retry=retry_strategy)

    #^implement this: https://will-ockmore.github.io/httpx-retries/
def get_stupo_year(stupo_name):
    match = re.search(r'- StuPO\s*(.*)', stupo_name, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    elif "Allg. PO der TU" in stupo_name:
        return "Allg. PO der TU"
    return "Undefined  stupo"

#logic for a single page out here so the ThreadPool can use it
async def fetch_deg_page(client: httpx.AsyncClient, page: int, sem: asyncio.Semaphore):
    #Fetches a single page of degrees and extracts id, name, max_stupo_id
    endpoint = f"{base_url}/studiengang"
    async with sem:
        try:
            response = await fetch_with_retry(
                client,
                endpoint, 
                params={"pageSize": 500, "pageNumber": page, "fields": "id,name,stupoList"},
            )
            response.raise_for_status()
            
            data = response.json()
            result = data.get("data") or []
            cache = []
            
            for x in result:
                stupo_list = x.get("stupoList", [])
                deg_name = x.get("name")
                deg_id = x.get("id")

                for stupo in stupo_list:
                    stupo_id = stupo.get("id")
                    stupo_year = get_stupo_year(stupo.get("name", ""))
                    cache.append((deg_id, deg_name, stupo_id, stupo_year))
                
            return cache, data.get("totalPages", 1)
        except Exception as e:
            print(f"Failed degree page {page}: {e}")
            return [], 1
        
    '''error handling rn is just so I have the structure, however ThreadPoolExecutor needs 
    more error handling as all threads are joined before the executor can exit, meaning errorcodes should be able to stop process.
    Also this is the reason I need two functions'''

async def fetch_all_degs(client, sem):    
        # params need to be for one page
        first_page, total_pages = await fetch_deg_page(client, 1, sem)
        studiengaenge = first_page

        if total_pages > 1:
            tasks = [fetch_deg_page(client, p, sem) for p in range(2, total_pages + 1)]
            results = await asyncio.gather(*tasks)
            for page_data, _ in results:
                studiengaenge.extend(page_data)

        return studiengaenge
    
async def fetch_single(client, endpoint, params, only_id, deduplicate, sem):
    #get params from endpoint
    #if only_id == True -> get only the id
    #else get the whole parameter (list)/ dict
    async with sem:
        try:
            response = await fetch_with_retry(client, endpoint)
            data_arr = response.json().get("data") or [{}]
            res = data_arr[0].get(params)
    
            if not res:
                return res
            if deduplicate and isinstance(res, list):
            # If the response is a LIST of dictionaries (like bolognamodulVersionList)
                ids= {}
                for item in res:
                    if isinstance(item, dict) and deduplicate in item and "id" in item:
                        key_value = item.get(deduplicate) 
                        
                        # max_id again
                        if key_value not in ids or item.get("id") > ids[key_value]:
                            ids[key_value] = item.get("id")
                return list(ids.values())
                            
            if not only_id:
                return res

            if isinstance(res, list):
                return [item.get("id") if isinstance(item, dict) else item for item in res]
            
            if isinstance(res, dict):
                return res.get("id")
                
            return res
        except Exception as e:
            print(f"Fetch failed: {e}")
            return None
        
    # ->/studiengang-> stupo_id-> get fields from reference in /studiengangabbildung -> if modulliste exists: isBologna stays false -> /studiengangzuordnung->Module
    # if isBologna is true: -> /bolognamodulliste -> get group ids-> /bolognamodullistengruppe -> /bolognamodullistenzuordnung/{id}
async def fetch_is_Bologna(client, deg_info, sem):
    list_modules=[]
    isBologna= False
    deg_id, deg_name, stupo_id, stupo_year = deg_info
    async with sem:
        try:
            # response = requests.get(f"{base_url}/studiengangsabbildung/{my_list[2]}", headers=headers, params={"fields":"stupo"})
            response1 = await fetch_with_retry(client, f"{base_url}/studiengangsabbildung", headers=headers, params={"stupoId": stupo_id})
            if response1.status_code == 200:
                data_list = response1.json().get("data") or []
                if not data_list:
                    return None, False
                matching_ref = data_list[0].get("id")
                # matching_ref =next((item for item in res if item == my_list[2]), None)
                # if not (matching_ref):
                #     return None, False
                
                fetch_res = await fetch_with_retry(client, f"{base_url}/studiengangsabbildung/{matching_ref}", headers=headers, params= {"fields": "modullisteList,bolognamodullisteList"})
                if fetch_res.status_code == 200:
                    res_data = fetch_res.json().get("data") or [{}]
                    data= res_data[0]
                    modulliste = data.get("modullisteList") or []
                    bologna_liste = data.get("bolognamodullisteList") or []

                    if len(modulliste) == 0:
                        isBologna = True
                        list_modules = bologna_liste
                    else:
                        isBologna = False
                        list_modules = modulliste

                    if len(list_modules) == 0:
                        return None, False
                    max_id = max((s.get("id",0) for s in list_modules), default=None) 
                    return max_id, isBologna

            else:
                return None, False
       
        except Exception as e:
            await send_status_admin(f"Bologna evaluation crashed for degree id {deg_id}: {e}", "ERROR")
            print(f"Fetch crashed due to: {e}")
            return None, False
    
#A1 Get max_id from groups
async def fetch_a_groups(client, deg_info, max_id, sem):
    #-> /bolognamodulliste/{id} -> Returns Group_id
    try:
        group_id = await fetch_single(client, f"{base_url}/bolognamodulliste/{max_id}", "bolognamodulListengruppeList", True, "name", sem)
        #I move the de-duplication logic into single fetch since I used it so much.. for better readability and less spaghetti
        return deg_info, group_id or []
    except Exception as e:
        logging.error(f"Group fetch failed: {e}", "ERROR")
        return deg_info, []

#A2 Get Zuordnung_id
async def fetch_a_zuordnungen(client, deg_info, group_id, sem):
    #-> /bolognamodullistengruppe/{id} -> Returns Zuordnung_id
    try:
        zuordnungs_id = await fetch_single(client, f"{base_url}/bolognamodullistengruppe/{group_id}", "bolognamodulListenzuordnungList", True, None, sem)
        return deg_info, zuordnungs_id or []
    except Exception as e:
        if isinstance(e, httpx.ConnectTimeout):
            logging.error(f"Httpx ConnectTimeout Error in fetch_a_zuordnungen: {e}")
            logging.error(f"Group fetch failed: {e}", "ERROR")
            return deg_info, []

#A3 Get Version_id
async def fetch_a_version(client, deg_info, zuordnung_id, sem):
    #-> /bolognamodullistenzuordnung/{id} -> Returns Version_id
    try:
        vers_id = await fetch_single(client, f"{base_url}/bolognamodullistenzuordnung/{zuordnung_id}", "bolognamodulVersion", True, None, sem)
        if isinstance(vers_id, list) and len(vers_id) > 0:
            return deg_info, vers_id[0] or None
        return deg_info, vers_id if vers_id else None
    except Exception as e:
        logging.error(f"Group fetch failed: {e}", "ERROR") 
        return deg_info, None

#B1 ->/modulliste/{max_id} similar to A1
async def fetch_b_zuordnungen(client, deg_info, max_id, sem):
    try:
        zuordnungs_id = await fetch_single(client, f"{base_url}/modulliste/{max_id}", "studiengangszuordnungList", True, "name", sem)
        return deg_info, zuordnungs_id or []
    except Exception as e:
        logging.error(f"Group fetch failed: {e}", "ERROR")
        return deg_info, []
#B2
async def fetch_b_version(client, deg_info, zuordnung_id, sem):
    try:
        vers_id = await fetch_single(client, f"{base_url}/studiengangszuordnung/{zuordnung_id}", "bolognamodulVersion", True, None, sem)
        if isinstance(vers_id, list) and len(vers_id) > 0:
            return deg_info, vers_id[0] or None
        return deg_info, vers_id if vers_id else None
    
    except Exception as e:
        logging.error(f"Group fetch failed: {e}", "ERROR")
        return deg_info, []
#C aka for both paths
async def fetch_module_id(client, deg_info, vers_id, sem):
    if not vers_id:
        return deg_info, []
    try:
        module_id = await fetch_single(client, f"{base_url}/bolognamodulversion/{vers_id}", "bolognamodul", True, "name", sem)
        return deg_info, module_id or []
    except Exception as e:
        logging.error(f"Group fetch failed: {e}", "ERROR")
        return deg_info, []
         
# ->/studiengang-> stupo_id-> get fields from reference in /studiengangsabbildung -> if modulliste exists: isBologna stays false -> /studiengangzuordnung->Module
# if isBologna is true: -> /bolognamodulliste -> get group ids-> /bolognamodullistengruppe -> /bolognamodullistenzuordnung/{id} -> /bolognamodulversion/{id}
async def fetch_all_modules(client, deg_list, sem):
    #this function should become the bologna path manager.. aka if bologna I choose group A if not then group B
    #At the very end the fetch for module id with the bolognamodulversion is neutral and is done regardless of whatever path was taken before
    #I obv also need delete this whole thing to become basic if else.. I will define the rest of the async helper functions and call them here
    bologna_tasks = [fetch_is_Bologna(client, deg, sem) for deg in deg_list]
    bologna_results = await asyncio.gather(*bologna_tasks)
    a_path, b_path= [],[]

    for deg_info, (max_id, isBologna) in zip(deg_list, bologna_results):
        if not max_id:
            continue
        if (isBologna):
            a_path.append((deg_info, max_id))
        else:
            b_path.append((deg_info, max_id))

    all_modules=[]
    cache = []
    if a_path:
        a1_tasks = [fetch_a_groups(client, deg_info, max_id, sem) for deg_info, max_id in a_path]
        a1_results = await asyncio.gather(*a1_tasks, return_exceptions=True)
        await send_status_admin(f"Finished fetching A1-path modules ({len(a_path)}).", "PROCESSING")
        # a2_tasks = [fetch_a_zuordnungen(client, deg_info, group_id, sem) for deg_info, group_id in a1_results]
        #Moses provides a list of ids (due to my single fetch) so I gotta unpack it first
        a2_tasks = []

        for result in a1_results:
            if isinstance(result, Exception):
                logging.error(f"A task failed: {result}")
                continue
            deg_info, group_ids = result
            if isinstance(group_ids, list):
                for g_id in group_ids:
                    a2_tasks.append(fetch_a_zuordnungen(client, deg_info, g_id, sem))
        a2_results = await asyncio.gather(*a2_tasks, return_exceptions=True)
        await send_status_admin(f"Finished fetching A2-path modules.", "PROCESSING")
        # a3_tasks = [fetch_a_version(client, deg_info, zuordnung_id, sem) for deg_info, zuordnung_id in a2_results]
        a3_tasks = []
        for result in a2_results:
            if isinstance(result, Exception):
                logging.error(f"A task failed: {result}")
                continue
            deg_info, zuordnungs_ids = result
            if isinstance(zuordnungs_ids, list):
                for z_id in zuordnungs_ids:
                    a3_tasks.append(fetch_a_version(client, deg_info, z_id, sem))
            elif isinstance(zuordnungs_ids, int):
                a3_tasks.append(fetch_a_version(client, deg_info, zuordnungs_ids, sem))
        a3_results = await asyncio.gather(*a3_tasks, return_exceptions=True)
        for res in a3_results:
            if isinstance(res, Exception):
                logging.error(f"Task failed in a3: {res}")
                continue
            cache.append(res)

        await send_status_admin(f"Finished fetching A-path modules.", "PROCESSING")
    if b_path:
        b1_tasks = [fetch_b_zuordnungen(client,deg_info, max_id, sem) for deg_info, max_id in b_path]
        b1_results = await asyncio.gather(*b1_tasks, return_exceptions=True)
        await send_status_admin(f"Finished fetching B1-path modules ({len(b_path)}).", "PROCESSING")
        # b2_tasks = [fetch_a_version(client, deg_info, zuordnung_id, sem) for deg_info, zuordnung_id in b1_results]
        b2_tasks = []
        # for deg_info, zuordnungs_ids in b1_results:
        for result in b1_results:
            if isinstance(result, Exception):
                logging.error(f"A task failed: {result}")
                continue
            deg_info, zuordnungs_ids = result
            if isinstance(zuordnungs_ids, list):
                for z_id in zuordnungs_ids:
                    b2_tasks.append(fetch_a_version(client, deg_info, z_id, sem))
            elif isinstance(zuordnungs_ids, int):
                b2_tasks.append(fetch_a_version(client, deg_info, zuordnungs_ids, sem))
        b2_results = await asyncio.gather(*b2_tasks, return_exceptions=True)
        for res in b2_results:
            if isinstance(res, Exception):
                logging.error(f"Task failed in b2: {res}")
                continue
            cache.append(res)
        await send_status_admin(f"Finished fetching B-path modules.", "PROCESSING")


    c_tasks = [fetch_module_id(client, deg_info, vers_id, sem) for deg_info, vers_id in cache]
    c_results= await asyncio.gather(*c_tasks, return_exceptions=True)
    # all_modules.extend(c_results)
    for res in c_results:
        if isinstance(res, Exception):
            logging.error(f"Task failed in c_results: {res}")
            continue
        all_modules.append(res)
    await send_status_admin(f"Finished fetching Part C: fetch_module_id().", "PROCESSING")
    return all_modules

def clean(text):
    if not text:
        return ""
    text = text.replace('\r\n', ' ').replace('\n', ' ').replace('\t', ' ')
    return re.sub(r'\s+', ' ', text).strip()

async def module_manager():
    #Imma keep the same logic as I defined in the synchronous version, because it supports dictionary logic, while staying clean and readable
    #However I made the singl fetch async too bc otherwise it could interfere with the awaited value in the loop, it needs to be able to drop a tak until it's ready
    my_dict= {}
    process_status = 0
    sem = asyncio.Semaphore(20)
    limits = httpx.Limits(max_connections=50, max_keepalive_connections=10)
    await send_status_admin("Initializing runtime client and structural pipeline.", "PROCESSING")
    async with httpx.AsyncClient(headers=headers, limits=limits) as client:
    
        list_studiengaenge = await fetch_all_degs(client, sem)
        await send_status_admin(f"fetch_all_degs completed:: {len(list_studiengaenge)} degrees", "PROCESSING")
    
        list_modules = await fetch_all_modules(client, list_studiengaenge, sem)
        await send_status_admin(f"fetch_all_modules completed:: {len(list_modules)} modules with duplicates", "PROCESSING")

        if len(list_modules) == 0:
            await send_status_admin(f"No Modules found? Process status: {process_status}", "WARNING")
        for x,module_id in list_modules:
            if not module_id:
                continue
            x_id, x_name, stupo_id, stupo_year = x 
            try:
                process_status = 1
                if not module_id in my_dict:
                    #fetch Lehrinhalt of that module with id  /bolognamodulbeschreibung/{id} (id from modulversion endpoint)
                    multiname = await fetch_single(client, f"{base_url}/bolognamodul/{module_id}","multiname" ,False, None, sem) or {}
                    de_name = multiname.get("de", "")
                    en_name = multiname.get("en", "")

                    v_res = await fetch_single(client, f"{base_url}/bolognamodul/{module_id}", "bolognamodulVersionList", True, None, sem)
                    if isinstance(v_res, list) and len(v_res) > 0:
                        version_id = max(v_res)
                    elif isinstance(v_res, int):
                        version_id = v_res
                    else:
                        version_id = None
                    description_id = None
                    if version_id:
                        #module will have semesterBis -> outdated module versions visable
                        semesterBis = await fetch_single(client, f"{base_url}/bolognamodulversion/{version_id}","semesterBis" ,False, None, sem)
                        version_info = "bis " + semesterBis.get("name") if isinstance(semesterBis, dict) else "Active" 
                        desc_res = await fetch_single(client, f"{base_url}/bolognamodulversion/{version_id}","bolognamodulBeschreibung" ,True, None, sem)
                        if isinstance(desc_res, list) and len(desc_res) > 0:
                            description_id = max(desc_res)
                        elif isinstance(desc_res, int):
                            description_id = desc_res
                    Lehrinhalt = ""
                    if description_id:
                        raw_lehrinhalt = await fetch_single(client, f"{base_url}/bolognamodulbeschreibung/{description_id}","lehrinhalteDE", False, None, sem) or ""
                        Lehrinhalt = clean(raw_lehrinhalt)
                    #dict= {id: {/*"id":module_id,*/ "de_name":de_name, "en_name":en_name, "studiengänge":[], "lehrinhalt": Lehrinhalt, "words:[]"}, ...}
                    #append module to my_dict
                    my_dict[module_id] = {
                        "de_name": de_name,
                        "en_name": en_name,
                        "version": version_info,
                        "studiengänge": [], 
                        "lehrinhalt": Lehrinhalt,
                        "words": []
                    }
                    
                if module_id in my_dict:
                    deg_entry = {
                        "name": x_name,
                        "stupo": stupo_year
                    }
                    #add x (now also the stupo_year..) to list of degs that have that modules in my_dict
                    if deg_entry not in my_dict[module_id]["studiengänge"]:
                        my_dict[module_id]["studiengänge"].append(deg_entry)
                    
                process_status = 3
            except Exception as e:
                #add some more differentiated errorhandling later
                #update process_status
                process_status = 2
                logging.error(f"Failed compiling module {module_id}: {e}")
        else:
            await send_status_admin("Pipeline closed with warning/partial compilation states.", "WARNING")
        await send_status_admin(f"Successfully compiled dictionary with {len(my_dict)} records.", "SUCCESS")
        
        return my_dict, process_status




#what if we use Threadpool for this and for the fetching we use asyncio?
#start of transformers: chunking->vibe vectors ->vector mean -> compare vector mean to all candidate words in text (unique)
model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
kw_model = KeyBERT(model=model)
def find_internal_candidates(my_dict):
    #use model sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
    #https://www.sbert.net/docs/sentence_transformer/pretrained_models.html#multilingual-models
    #model.encode(text), util.cos_sim(v1, v2)
    #kw_model.extract_keywords(text), keyphrase_ngram_range, use_mmr=True
    disciplines = sparql_candidates()
    if not disciplines:
        logging.warning("No disciplines loaded. Skipping external candidate match.")
        return

    logging.info(f"Pre-encoding {len(disciplines)} discipline vectors...")
    # encoding all disciplines in one matrix at once to represent the disciplines as one matrix instead of many smaller vectors
    discipline_embeddings = model.encode(disciplines, convert_to_tensor=True)
    for module_id, data in my_dict.items():
        candidate_list= []
        text = data.get("lehrinhalt", "")
        if not text:
            continue
        keywords = kw_model.extract_keywords(text, keyphrase_ngram_range=(1, 2), stop_words=None, use_mmr=True, diversity=0.7)
        candidate_list.extend([kw[0] for kw in keywords])
        vibe_vector_text = model.encode(text)
        vibe_vector = (vibe_vector_text + model.encode(data.get("de_name", "")))/2.0 #or mean in np
        cos_scores = util.cos_sim(vibe_vector, discipline_embeddings)[0]
        import torch
        top_results = torch.topk(cos_scores, k=3)
        external_keywords = []
        for score, idx in zip(top_results.values, top_results.indices):
            if score > 0.4: 
                external_keywords.append(disciplines[int(idx)])
                
        #abt 6 words per module
        combined_words = list(set(candidate_list[:3] + external_keywords))
        
        # Save it perfectly into your module data structure
        data["words"] = combined_words[:6]
    return my_dict
#mean vector compared to svg file 
def sparql_candidates():
    #https://query.wikidata.org/sparql
    #https://www.wikidata.org/wiki/Wikidata:SPARQL_tutorial
    #    query = """
    # SELECT ?disciplineLabel WHERE {
    #   ?discipline wdt:P31/wdt:P279* wd:Q11862829.
    #   SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
    # }
    # """
    # data = response.json()
    # candidates = []
    # for item in data.get("results", {}).get("bindings", []):
    #     label = item.get("disciplineLabel", {}).get("value")
    #     if label and not label.startswith("Q"):
    #         candidates.append(label)
    #best to have a hardcoded file, since smth could go wrong during fetch process and the expected data shouldn't really change

    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, "academic_disciplines.json")
    #in non local testing this wont really matter since in a docker its one folder, but this is more versatile 
    try:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                candidates = json.load(f)
            logging.info(f"Loaded {len(candidates)} hardcoded candidate fields from local file.")
            return candidates
        else:
            logging.warning("academic_disciplines.json missing! Falling back to empty candidates pool.")
            return []
    except Exception as e:
        logging.error(f"Failed to read local disciplines file: {e}")
        return []
    pass




#dict to json -> supabase bucket
async def to_json(my_dict, bucket, file_name):
    try: 
        # dict needs to be flat for fuse.js
        formatted_list = []
        for module_id, data in my_dict.items():
            module_item = {
                "id": str(module_id),
                "de_name": data.get("de_name", ""),
                "en_name": data.get("en_name", ""),
                "version": data.get("version"),
                #"studiengänge": data.get("studiengänge", []), 
                # the newest update revealed that using stupo year as range isn't reliable (so frontend doesnt need it currently)
                # instead I will use semesterBis from /bolognamodulversion/{id} 
                # js in case if there is a need Imma js uncomment
                #"lehrinhalt": data.get("lehrinhalt", ""), 
                #technically the frontend doesnt need this and the file grew exponentially since the stupo addition so I gotta optimise
                "words": data.get("words", []) 
            }
            formatted_list.append(module_item)

        # stringify array
        json_string = json.dumps(formatted_list, ensure_ascii=False, indent=4)
        json_bytes = json_string.encode("utf-8")
        supabase: Client = create_client(supabase_url, service_role)
        await asyncio.to_thread(
            supabase.storage.from_(bucket).upload,
            file_name,
            json_bytes,
            file_options={"content-type": "application/json", "x-upsert": "true"}
        )
        await send_status_admin(f"Successfully uploaded {file_name} to Supabase bucket {bucket}")
    except Exception as e:
        await send_status_admin(f"CRITICAL: Failed to upload to Supabase: {e}", "ERROR")

#js needa get the logs for UX and 
def logs_sb_sync(report_entry):
    try:
        supabase: Client = create_client(supabase_url, service_role)
        supabase.table("logs").upsert(report_entry, on_conflict="github_run_id").execute()
    except Exception as e:
        logging.error(f"CRITICAL: Failed to upload to Supabase: {e}")

# new async wrapper for the event loop
async def send_status_admin(message, level="INFO"):
    if level in ["ERROR", "CRITICAL"]:
        logging.error(message)
    elif level == "WARNING":
        logging.warning(message)
    else:
        logging.info(message)
        
    current_time = datetime.now(timezone.utc).isoformat()
    process_history.append({
        "timestamp": current_time,
        "level": level, 
        "message": message
    })
    
    report_entry = {
        "github_run_id": run_id,    
        "current_status": level,   
        "latest_message": message,  
        "history": process_history,
        "updated_at": current_time
    }
    #technically I could remove to_thread bc it shouldn't be interfering with any process ..
    #but imma leave it incase transformers has that issue
    await asyncio.to_thread(logs_sb_sync, report_entry)

#For testing the fetch/sorting logic and Threading
# if __name__ == "__main__":
#     print("starting dict fetch test")
#     final_dict, status = asyncio.run(module_manager())
#     print(f"\nProcess Finished with Status: {status}")
#     print(json.dumps(final_dict, indent=4, ensure_ascii=False))

async def main():
        my_dict, status = await module_manager()
        print(f"\nProcess Finished with Status: {status}")
        await send_status_admin("Starting ML keyword extraction with sentence_transformers", "PROCESSING")
        final_dict = await asyncio.to_thread(find_internal_candidates, my_dict)#another thread for comcurrency
        
        if final_dict:
            await send_status_admin(f"Successfully updated dictionary with transformers", "SUCCESS")
            await send_status_admin(f"Uploading to Supabase...", "PROCESSING")
            await to_json(final_dict, "module-data", "modules_dictionary.json")
            await send_status_admin(f"Upload complete.", "SUCCESS")
        else:
            #print("Dictionary was empty, skipping upload.")
            await send_status_admin(f"Dictionary was empty, skipping upload.", "ERROR")

asyncio.run(main())
