import os
import asyncio
import httpx
# in ayncio instead of session (requests)-> with aiohttp.ClientSession() as session:
import json
import logging
from supabase import create_client, Client
import concurrent.futures

#this whole file is just a tester file where I aim to convert it to async from the existing working file
#first testing the fetch with .env file to isolate possible problems
from dotenv import load_dotenv
load_dotenv()

script_dir = os.path.dirname(os.path.abspath(__file__))

root_dir = os.path.dirname(script_dir)

env_path = os.path.join(root_dir, ".env.local") 
load_dotenv(dotenv_path=env_path)

base_url = os.getenv("moses_API_URL")
api_key = os.getenv("moses_API_KEY")
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

#logic for a single page out here so the ThreadPool can use it
async def fetch_deg_page(client: httpx.AsyncClient, page: int, sem: asyncio.Semaphore):
    #Fetches a single page of degrees and extracts id, name, max_stupo_id
    endpoint = f"{base_url}/studiengang"
    async with sem:
        try:
            response = await client.get(
                endpoint, 
                params={"pageSize": 500, "pageNumber": page, "fields": "id,name,stupoList"},
                timeout=15.0
            )
            response.raise_for_status()
            
            data = response.json()
            result = data.get("data") or []
            cache = []
            
            for x in result:
                stupo_list = x.get("stupoList", [])
                max_id = max((s.get("id", 0) for s in stupo_list), default=None)
                cache.append((x.get("id"), x.get("name"), max_id))
                
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
            response = await client.get(endpoint, timeout=15.0)
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
    deg_id, deg_name, stupo_id = deg_info
    async with sem:
        try:
            # response = requests.get(f"{base_url}/studiengangsabbildung/{my_list[2]}", headers=headers, params={"fields":"stupo"})
            response1 = await client.get(f"{base_url}/studiengangsabbildung", headers=headers, params={"stupoId": stupo_id}, timeout=15.0)
            if response1.status_code == 200:
                data_list = response1.json().get("data") or []
                if not data_list:
                    return None, False
                matching_ref = data_list[0].get("id")
                # matching_ref =next((item for item in res if item == my_list[2]), None)
                # if not (matching_ref):
                #     return None, False
                
                fetch_res = await client.get(f"{base_url}/studiengangsabbildung/{matching_ref}", headers=headers, params= {"fields": "modullisteList,bolognamodullisteList"}, timeout=15.0)
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
            send_status_admin()
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
        print(f"{e}")
        return deg_info, []

#A2 Get Zuordnung_id
async def fetch_a_zuordnungen(client, deg_info, group_id, sem):
    #-> /bolognamodullistengruppe/{id} -> Returns Zuordnung_id
    try:
        zuordnungs_id = await fetch_single(client, f"{base_url}/bolognamodullistengruppe/{group_id}", "bolognamodulListenzuordnungList", True, None, sem)
        return deg_info, zuordnungs_id or []
    except Exception as e:
        if (e == httpx.ConnectTimeout):
           send_status_admin("Httpx ConnectTimeout Error in fetch_a_zuordnungen: {e}")
        print(f"{e}")
        return deg_info, []

#A3 Get Version_id
async def fetch_a_version(client, deg_info, zuordnung_id, sem):
    #-> /bolognamodullistenzuordnung/{id} -> Returns Version_id
    try:
        vers_id = await fetch_single(client, f"{base_url}/bolognamodullistenzuordnung/{zuordnung_id}", "bolognamodulVersion", True, None, sem)
        if isinstance(vers_id, list) and len(vers_id) > 0:
            return deg_info, vers_id[0] or None
        return deg_info, vers_id or []
    except Exception as e:
            print(f"{e}")  
            return deg_info, None

#B1 ->/modulliste/{max_id} similar to A1
async def fetch_b_zuordnungen(client, deg_info, max_id, sem):
    try:
        zuordnungs_id = await fetch_single(client, f"{base_url}/modulliste/{max_id}", "studiengangszuordnungList", True, "name", sem)
        return deg_info, zuordnungs_id or []
    except Exception as e:
        print(f"{e}")
        return deg_info, []
#B2
async def fetch_b_version(client, deg_info, zuordnung_id, sem):
    try:
        vers_id = await fetch_single(client, f"{base_url}/studiengangszuordnung/{zuordnung_id}", "bolognamodulVersion", True, None, sem)
        if isinstance(vers_id, list) and len(vers_id) > 0:
            return deg_info, vers_id[0] or None
        return deg_info, vers_id or []
    
    except Exception as e:
        print(f"{e}")
        return deg_info, []
#C aka for both paths
async def fetch_module_id(client, deg_info, vers_id, sem):
    try:
        module_id = await fetch_single(client, f"{base_url}/bolognamodulversion/{vers_id}", "bolognamodul", True, "name", sem)
        return deg_info, module_id or []
    except Exception as e:
        print(f"{e}")
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
        print(f"DEBUG: Found {len(a_path)} Bologna degrees and {len(b_path)} Standard degrees.")
        if (isBologna):
            a_path.append((deg_info, max_id))
        else:
            b_path.append((deg_info, max_id))

    all_modules=[]
    cache = []
    if a_path:
        a1_tasks = [fetch_a_groups(client, deg_info, max_id, sem) for deg_info, max_id in a_path]
        a1_results = await asyncio.gather(*a1_tasks, return_exceptions=True)
        print(f"DEBUG: a1_results count: {len(a1_results)}")
        print(a1_results[0])

        # a2_tasks = [fetch_a_zuordnungen(client, deg_info, group_id, sem) for deg_info, group_id in a1_results]
        #Moses provides a list of ids (due to my single fetch) so I gotta unpack it first
        a2_tasks = []
        for deg_info, group_ids in a1_results:
            if isinstance(group_ids, list):
                for g_id in group_ids:
                    a2_tasks.append(fetch_a_zuordnungen(client, deg_info, g_id, sem))
        a2_results = await asyncio.gather(*a2_tasks, return_exceptions=True)
        print(f"DEBUG: a2_results count: {len(a2_results)}")
        print(a2_results[0])

        # a3_tasks = [fetch_a_version(client, deg_info, zuordnung_id, sem) for deg_info, zuordnung_id in a2_results]
        a3_tasks = []
        for deg_info, zuordnungs_ids in a2_results:
            if isinstance(zuordnungs_ids, list):
                for z_id in zuordnungs_ids:
                    a3_tasks.append(fetch_a_version(client, deg_info, z_id, sem))
            elif isinstance(zuordnungs_ids, int):
                a3_tasks.append(fetch_a_version(client, deg_info, zuordnungs_ids, sem))
        a3_results = await asyncio.gather(*a3_tasks, return_exceptions=True)
        print(f"DEBUG: a3_results count: {len(a3_results)}")
        cache.extend(a3_results)
    if b_path:
        b1_tasks = [fetch_b_zuordnungen(client,deg_info, max_id, sem) for deg_info, max_id in b_path]
        b1_results = await asyncio.gather(*b1_tasks, return_exceptions=True)
        print(f"DEBUG: b1_results count: {len(b1_results)}")
        print(b1_results[0])

        # b2_tasks = [fetch_a_version(client, deg_info, zuordnung_id, sem) for deg_info, zuordnung_id in b1_results]
        b2_tasks = []
        for deg_info, zuordnungs_ids in b1_results:
            if isinstance(zuordnungs_ids, list):
                for z_id in zuordnungs_ids:
                    b2_tasks.append(fetch_a_version(client, deg_info, z_id, sem))
            elif isinstance(zuordnungs_ids, int):
                b2_tasks.append(fetch_a_version(client, deg_info, zuordnungs_ids, sem))
        b2_results = await asyncio.gather(*b2_tasks, return_exceptions=True)
        cache.extend(b2_results)
        print(f"DEBUG: b2_results count: {len(b2_results)}")

    c_tasks = [fetch_module_id(client, deg_info, vers_id, sem) for deg_info, vers_id in cache]
    c_results= await asyncio.gather(*c_tasks, return_exceptions=True)
    print(f"DEBUG: c_results count: {len(c_results)}")
    all_modules.extend(c_results)
    print(all_modules[0])
    return all_modules
    

async def module_manager():
    #Imma keep the same logic as I defined in the synchronous version, because it supports dictionary logic, while staying clean and readable
    #However I made the singl fetch async too bc otherwise it could interfere with the awaited value in the loop, it needs to be able to drop a tak until it's ready
    my_dict= {}
    process_status = 0
    sem = asyncio.Semaphore(20)
    limits = httpx.Limits(max_connections=50, max_keepalive_connections=10)
    async with httpx.AsyncClient(headers=headers, limits=limits) as client:
    
        # 2. Your async pipelines go here...
        list_studiengaenge = await fetch_all_degs(client, sem)
        print(f"Fetched {len(list_studiengaenge)} total degrees.")
        
        list_modules = await fetch_all_modules(client, list_studiengaenge, sem)
        print(f"DEBUG: list_modules count: {len(list_modules)}")
        if len(list_modules) > 0:
            print(f"DEBUG: Sample result: {list_modules[0]}")
    for x,module_id in list_modules:
        if not module_id:
            continue
        x_name = x[1]
        try:
            process_status = 1
            # my_dict_list=[{"id":mod_id, **details} for mod_id, details in my_dict.items()]
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
                    desc_res = await fetch_single(client, f"{base_url}/bolognamodulversion/{version_id}","bolognamodulBeschreibung" ,True, None, sem)
                    if isinstance(desc_res, list) and len(desc_res) > 0:
                        description_id = max(desc_res)
                    elif isinstance(desc_res, int):
                        description_id = desc_res
                Lehrinhalt = ""
                if description_id:
                    Lehrinhalt = await fetch_single(client, f"{base_url}/bolognamodulbeschreibung/{description_id}","lehrinhalteDE", False, None, sem) or ""
                #dict= {id: {/*"id":module_id,*/ "de_name":de_name, "en_name":en_name, "studiengänge":[], "lehrinhalt": Lehrinhalt, "words:[]"}, ...}
                #append module to my_dict
                my_dict[module_id] = {
                    "de_name": de_name,
                    "en_name": en_name,
                    "studiengänge": [], 
                    "lehrinhalt": Lehrinhalt,
                    "words": []
                }
                
            if module_id in my_dict:
                if x_name not in my_dict[module_id]["studiengänge"]:
                #add x to list of degs that have that modules in my_dict
                    my_dict[module_id]["studiengänge"].append(x_name)
                
            process_status = 3
            print(f"Processed module: {de_name}...", end="\r")
        except Exception as e:
            #add some more differentiated errorhandling later
            #update process_status
            print(f"An Error occured: {e}")
            process_status = 2
    return my_dict, process_status



#what if we use Threadpool for this and for the fetching we use asyncio?
#start of transformers: chunking->vibe vectors ->vector mean -> compare vector mean to all candidate words in text (unique)
def find_internal_candidates():
    pass
#mean vector compared to svg file 
def sparql_candidates():
    pass
#dict to json -> supabase bucket
def to_json():
    pass

def send_status_admin(message, level):
    #return process details, error codes/success message after json code gets placed in a bucket
    #create extra log? or maybe a supabase table?
    supabase: Client = create_client(supabase_url, service_role)
    log_entry={
        "message": message,
        "level": level,
        "metadata": {"github_run_id": os.environ.get("GITHUB_RUN_ID")}
    }
    response = supabase.table("logs".insert(log_entry)).execute()
    print(f"You logged this: {response}")
    pass

#For testing the fetch/sorting logic and Threading
if __name__ == "__main__":
    print("starting dict fetch test")
    final_dict, status = asyncio.run(module_manager())
    print(f"\nProcess Finished with Status: {status}")
    print(json.dumps(final_dict, indent=4, ensure_ascii=False))

