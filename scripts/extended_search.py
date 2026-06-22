import os
import requests
from requests.exceptions import RequestException
import concurrent.futures

#first testing the fetch with .env file to isolate possible problems
from dotenv import load_dotenv

# first testing the fetch with .env file to isolate possible problems
load_dotenv()

#logic for a single page out here so the ThreadPool can use it
my_dict = {}
def fetch_single_page(page, endpoint, headers):
    try:
        response = requests.get(
            endpoint, 
            headers=headers, 
            params={"pageSize": 500, "pageNumber": page, "fields": "id,name"}
        )
        if response.status_code == 200:
            return response.json().get("data", [])
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
    base_url = os.getenv("moses_API_URL")
    api_key = os.getenv("moses_API_KEY")
    
    headers = { 
        "accept": "application/json",
        "x-api-key": api_key
    }
    
    #baseurl
    endpoint = f"{base_url}/studiengang"
    studiengaenge = []
    
    try: 
        # Fixed the params to explicitly ask for page 1
        response = requests.get(endpoint, headers=headers, params={"pageSize": 500, "pageNumber": 1, "fields": "id,name"})
        
        if response.status_code == 200:
            first_page = response.json()
            
            # Fixed .extends() to .extend()
            studiengaenge.extend(first_page.get("data", []))
            
            total_pages = first_page.get("totalPages", 1)
            
            if total_pages > 1:
                # Fixed the tuple to a proper range()
                pages_to_fetch = range(2, total_pages + 1)
                
                with concurrent.futures.ThreadPoolExecutor() as executor:
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
        print(f"Fetch crashed due to: {e}")
        
    finally: 
        return studiengaenge

def fetch_all_modules(id):
    pass

def module_manager():
    process_status = 0
    list_studiengaenge = fetch_all_degs()
    for x in list_studiengaenge:
        list_modules = fetch_all_modules(id)
        for module_id in list_modules:
            try:
                process_status = 1
                if not module_id in my_dict:
                    #fetch Lehrinhalt of that module with id
                    #append module to my_dict
                    pass
                if module_id in my_dict:
                    #add x to list of degs that have that modules in my_dict
                    pass
                process_status = 3
            except Exception as e:
                #add some more differentiated errorhandling later
                #update process_status
                process_status = 2
    return my_dict, process_status

def find_internal_candidates():
    pass

def sparql_candidates():
    pass

def to_json():
    pass

