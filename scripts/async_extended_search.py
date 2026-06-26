import os
import asyncio
import aiohttp
# in ayncio instead of session (requests)-> with aiohttp.ClientSession() as session:
import json
import time
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

if not base_url:
    raise ValueError(f"CRITICAL: Could not find moses_API_URL! Checked path: {env_path}")
headers = { 
    "accept": "application/json",
    "x-api-key": api_key
    }
#I kept getting timeout bc of the amount of requests, so I switched from requests to sessions, to reduce TLS
session = requests.Session()
session.headers.update(headers)
from requests.adapters import HTTPAdapter
adapter = HTTPAdapter(pool_connections=5, pool_maxsize=5, max_retries=3)
session.mount('https://', adapter)
session.mount('http://', adapter)

#logic for a single page out here so the ThreadPool can use it
my_dict = {}
def fetch_single_page(page, endpoint, headers):
    try:
        response = session.get(
            endpoint, 
            headers=headers, 
            params={"pageSize": 500, "pageNumber": page, "fields": "id,name, stupoList"}
        )
        if response.status_code == 200:

            result = response.json().get("data") or []
            cache=[]
            for x in result:
                stupo_list = x.get("stupoList",[])
                max_id = max((s.get("id", 0) for s in stupo_list), default=None)
                cache.append([
                    x.get("id"),
                    x.get("name"),
                    max_id
                ])
            return cache
        else:
            print(f"Failed on page {page} - Status code: {response.status_code}")
            return []
    except Exception as e:
        print(f"Page {page} crashed: {e}")
        return []
    '''error handling rn is just so I have the structure, however ThreadPoolExecutor needs 
    more error handling as all threads are joined before the executor can exit, meaning errorcodes should be able to stop process.
    Also this is the reason I need two functions'''
def fetch_all_degs():

    #baseurl
    endpoint = f"{base_url}/studiengang"
    studiengaenge = []
    
    try: 
        # params need to be for one page
        response = session.get(endpoint, headers=headers, params={"pageSize": 500, "pageNumber": 1, "fields": "id,name,stupoList"})
        
        if response.status_code == 200:
            first_page = response.json()
            
            for item in first_page.get("data") or []:
                stupo_list = item.get("stupoList") or []
                max_id = max((s.get("id", 0) for s in stupo_list), default=None)
                studiengaenge.append([
                    item.get("id"),
                    item.get("name"),
                    max_id
                ])
            
            total_pages = first_page.get("totalPages", 1)
            
            if total_pages > 1:
                pages_to_fetch = range(2, total_pages + 1)
                
                with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                    # Point the executor to our helper function at the top of the file
                    #https://docs.python.org/3/library/concurrent.futures.html#concurrent.futures.ThreadPoolExecutor
                    futures_map = {
                        executor.submit(fetch_single_page, page, endpoint, headers): page
                        for page in pages_to_fetch
                    }
                    
                    # Wait for all the parallel requests to finish basically like await and promise all
                    for future in concurrent.futures.as_completed(futures_map):
                        page_data = future.result() 
                        studiengaenge.extend(page_data)
                        
    except Exception as e:
        #will need to add more error handling 
        return print(f"Fetch crashed due to: {e}")
        
    finally: 
        return studiengaenge
    
#prolly need to make another single fetch function bc I wanna use Threadpooler again
def fetch_single(endpoint, params, only_id):
    time.sleep(0.1)
    #get params from endpoint
    #if only_id == True -> get only the id
    #else get the whole parameter (list)/ dict
    response = session.get(endpoint, headers=headers).json()
    data_arr = response.get("data") or [{}]
    res = data_arr[0].get(params)
    
    if not only_id or not res:
        return res
    # If the response is a LIST of dictionaries (like bolognamodulVersionList)
    if isinstance(res, list):
        return [item.get("id") for item in res if isinstance(item, dict) and "id" in item]

    if isinstance(res, dict):
        return res.get("id")
        
    return res

    # ->/studiengang-> stupo_id-> get fields from reference in /studiengangabbildung -> if modulliste exists: isBologna stays false -> /studiengangzuordnung->Module
    # if isBologna is true: -> /bolognamodulliste -> get group ids-> /bolognamodullistengruppe -> /bolognamodullistenzuordnung/{id}
def fetch_is_Bologna(my_list):
    list_modules=[]
    isBologna= False
    try:
        # response = requests.get(f"{base_url}/studiengangsabbildung/{my_list[2]}", headers=headers, params={"fields":"stupo"})
        response = session.get(f"{base_url}/studiengangsabbildung", headers=headers, params={"stupoId": my_list[2]})
        if response.status_code == 200:
            data_list = response.json().get("data") or []
            if not data_list:
                return None, False
            matching_ref = data_list[0].get("id")
            # matching_ref =next((item for item in res if item == my_list[2]), None)
            # if not (matching_ref):
            #     return None, False
            try:
                fetch_res = session.get(f"{base_url}/studiengangsabbildung/{matching_ref}", headers=headers, params= {"fields": "modullisteList,bolognamodullisteList"})
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
            except Exception as e:
                print(f"Fetch crashed due to: {e}")
                return None, False
        else:
            return None, False
       
    except Exception as e:
        send_status_admin()
        print(f"Fetch crashed due to: {e}")
        return None, False
         
# ->/studiengang-> stupo_id-> get fields from reference in /studiengangsabbildung -> if modulliste exists: isBologna stays false -> /studiengangzuordnung->Module
# if isBologna is true: -> /bolognamodulliste -> get group ids-> /bolognamodullistengruppe -> /bolognamodullistenzuordnung/{id} -> /bolognamodulversion/{id}
def fetch_all_modules(deg_list):
    all_modules= []
    for x in deg_list:
        max_id, isBologna = fetch_is_Bologna(x)
        if max_id is None:
            continue
        if (isBologna):
            try:
                with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                    #fetch bolognamodulListengruppeList from /bolognamodulliste/{max_id}
                    #also unsure abt field: bolognamodulListengruppeList
                    len_list_groups = session.get(f"{base_url}/bolognamodulliste/{max_id}",headers=headers, params= "data")
                    #if name is duplicate choose the greater id

                    data_arr = len_list_groups.json().get("data") or [{}]
                    len_list_group = data_arr[0].get("bolognamodulListengruppeList") or []
                    ids={}
                    for item in len_list_group:
                        name = item.get("name")
                        if name not in ids or item.get("id")>ids[name]:
                            ids[name]=item.get("id")
                    #list_groups = len_list_group.get("id")

                    #for every group_id fetch bolognamodulListenzuordnungList from /bolognamodullistengruppe/{id}
                    futures_map = {
                        executor.submit(fetch_single, params="bolognamodulListenzuordnungList", only_id= False, endpoint= f"{base_url}/bolognamodullistengruppe/{el}"): el
                        for el in list(ids.values())
                    }#unsure if field:bolognamodulListenzuordnungList exists, or if it is just 1 dim in data
                    for future in concurrent.futures.as_completed(futures_map):
                        result_list = future.result() or []
                        for zuordnungs_id in result_list:
                            #fetch bolognamodulVersion for every bolognamodulListenzuordnungList_id from /bolognamodullistenzuordnung/{id}
                            future_map ={
                                executor.submit(fetch_single, params="bolognamodulVersion", only_id= True, endpoint= f"{base_url}/bolognamodullistenzuordnung/{zuordnungs_id}")
                            }  
                            for futurex in concurrent.futures.as_completed(future_map):
                                result_id = futurex.result()
                                if isinstance(result_id, list) and len(result_id) > 0:
                                    result_id = result_id[0]
                                if not result_id:
                                    continue
                                module_field= session.get(f"{base_url}/bolognamodulversion/{result_id}",headers=headers)
                                m_data_arr = module_field.json().get("data") or [{}]
                                module_id = m_data_arr[0].get("bolognamodul", {}).get("id")
                                all_modules.append((x,module_id))
                            #fetch bolognamodul_id from /bolognamodulversion/{id}

            except Exception as e:
                send_status_admin()
                print(f"Fetch crashed due to: {e}")
                continue
        elif not isBologna:
            try:
                with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                    bologna_list_groups = session.get(f"{base_url}/modulliste/{max_id}",headers=headers, params= {"fields":"studiengangszuordnungList"})
                    data_arr = bologna_list_groups.json().get("data") or [{}]
                    bologna_list_group = data_arr[0].get("studiengangszuordnungList") or []
                    #if name is duplicate choose the greater id
                    ids={}
                    for item in bologna_list_group:
                        name = item.get("name")
                        if name not in ids or item.get("id")>ids[name]:
                            ids[name]=item.get("id")
                    futures_map = {
                        executor.submit(fetch_single, params="bolognamodulVersion", only_id=True, endpoint= f"{base_url}/studiengangszuordnung/{el}"): el
                        for el in ids.values()
                    }
                    #/modulliste->studiengangszuordnungList-> /studiengangszuordnung/{id}-> bolognamodulVersion -> /bolognamodulversion/{id}-> bolognamodul_id
                    for future in concurrent.futures.as_completed(futures_map):
                        res_id = future.result()
                        if isinstance(res_id, list) and len(res_id) > 0:
                            res_id = res_id[0]
                        if not res_id:
                            continue
                        next_map={
                            executor.submit(fetch_single, params="bolognamodul", only_id= True, endpoint= f"{base_url}/bolognamodulversion/{res_id}") 
                        }
                        for next in concurrent.futures.as_completed(next_map):
                            final_res_id = next.result()
                            
                            # data is not 1dim needs unpacking if list
                            if isinstance(final_res_id, list) and len(final_res_id) > 0:
                                final_res_id = final_res_id[0]
                            if not final_res_id:
                                continue
                                
                            all_modules.append((x, final_res_id))
    
            except Exception as e:
                send_status_admin()
                print(f"Fetch crashed due to: {e}")
                continue
                 
    return all_modules    
    



def module_manager():
    process_status = 0
    list_studiengaenge = fetch_all_degs()
    print(f"Fetched {len(list_studiengaenge)} total degrees.")
    
    list_studiengaenge = list_studiengaenge[: ]
    print(f"Testing pipeline with {len(list_studiengaenge)} degrees...")

    list_modules = fetch_all_modules(list_studiengaenge)
    print(f"Found {len(list_modules)} module associations to process...")
    for x,module_id in list_modules:
        if not module_id:
            continue
        x_name = x[1]
        try:
            process_status = 1
            # my_dict_list=[{"id":mod_id, **details} for mod_id, details in my_dict.items()]
            if not module_id in my_dict:
                #fetch Lehrinhalt of that module with id  /bolognamodulbeschreibung/{id} (id from modulversion endpoint)
                multiname = fetch_single(f"{base_url}/bolognamodul/{module_id}","multiname" ,False) or {}
                de_name = multiname.get("de", "")
                en_name = multiname.get("en", "")
                #add [] and {} literally everywhere so it doesnt return None and crash omfg
                # version_id = max(fetch_single(f"{base_url}/bolognamodul/{module_id}","bolognamodulVersionList" ,True)) or []
                # description_id = max(fetch_single(f"{base_url}/bolognamodulversion/{version_id}","bolognamodulBeschreibung" ,True))
                v_res = fetch_single(f"{base_url}/bolognamodul/{module_id}","bolognamodulVersionList" ,True)
                if isinstance(v_res, list) and len(v_res) > 0:
                    version_id = max(v_res)
                elif isinstance(v_res, int):
                    version_id = v_res
                else:
                    version_id = None
                description_id = None
                if version_id:
                    desc_res = fetch_single(f"{base_url}/bolognamodulversion/{version_id}","bolognamodulBeschreibung" ,True)
                    if isinstance(desc_res, list) and len(desc_res) > 0:
                        description_id = max(desc_res)
                    elif isinstance(desc_res, int):
                        description_id = desc_res
                Lehrinhalt = ""
                if description_id:
                    Lehrinhalt = fetch_single(f"{base_url}/bolognamodulbeschreibung/{description_id}","lehrinhalteDE", False) or ""
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

def send_status_admin():
    #return process details, error codes/success message after json code gets placed in a bucket
    #create extra log? or maybe a supabase table?
    pass

#For testing the fetch/sorting logic and Threading
if __name__ == "__main__":
    print("starting dict fetch test")
    final_dict, status = module_manager()
    print(f"\nProcess Finished with Status: {status}")
    print(json.dumps(final_dict, indent=4, ensure_ascii=False))


    '''
    
starting dict fetch test
Fetched 220 total degrees.
Testing pipeline with 220 degrees...
Fetch crashed due to: ('Connection aborted.', ConnectionResetError(104, 'Connection reset by peer'))
Found 2198 module associations to process...
An Error occured: HTTPSConnectionPool(host='demo.moses.tu-berlin.de', port=443): 
Max retries exceeded with url: /moses/api/v2/bolognamodul/193 
(Caused by ConnectTimeoutError(<HTTPSConnection(host='demo.moses.tu-berlin.de', port=443) at 0x7f049bb24dc0>, 
'Connection to demo.moses.tu-berlin.de timed out. (connect timeout=None)'))
    '''