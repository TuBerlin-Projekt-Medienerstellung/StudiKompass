import {createClient} from "@/lib/supabase/server";
import StudiengangForm from "./studiengangwahl-form"

export default async function Studiengangwahl() {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;
    const apiUrl = process.env.moses_API_URL;
    const apiKey = process.env.moses_API_KEY || ""; 
    let officialDegrees: any[] = [];
    if (apiUrl) { 
        try { 
            const baseHeaders: Record<string, string> = {};
            if (process.env.moses_API_KEY) { 
                baseHeaders['x-api-key'] = process.env.moses_API_KEY;
            } 
             
            const degreeResponse = await fetch(`${apiUrl}/studiengang?pageSize=500`, { 
                headers: baseHeaders,
                next: {revalidate: 86400}
            }); 

            if (degreeResponse.ok) {
                const firstPage = await degreeResponse.json(); 
                officialDegrees = firstPage.data ?? []; 
                const totalPages = firstPage.totalPages ?? 1; 

                if (totalPages > 1) { 
                    const fetchPromises = []; 
                    for (let page = 2; page <= totalPages; page++) { 
                        fetchPromises.push(
                            fetch(`${apiUrl}/studiengang?pageSize=500&pageNumber=${page}`, { 
                                headers: baseHeaders, 
                                next: {revalidate: 86400}
                            }).then(res => res.json()) 
                        ); 
                    } 
                    const pagesData = await Promise.all(fetchPromises); 
                    pagesData.forEach(pageData => { 
                        officialDegrees.push(...(pageData.data ?? [])); 
                    }); 
                }
            } else { 
                console.error("Fetch failed with status:", degreeResponse.status);
            } 
        } catch (e) { 
            console.error("Fetch crashed:", e); 
        }
    } 
  // Data for testing
    if (!Array.isArray(officialDegrees) || officialDegrees.length === 0) {
        officialDegrees = [ 
        { id: "1", name: "Medieninformatik"}, 
        { id: "2", name: "Informatik" }, 
        { id: "3", name: "Wirtschaftsinformatik" }
        ];
    }{/* Got this: Cannot read properties of undefined (reading 'toString') 
        that's why I added something when the fetch returns nothing, which it will, since I dont have a key*/} 

    const {data: profile} = await supabase 
        .from("profiles") 
        .select("studiengang") 
        .eq("id", user.id) 
        .single(); 

    return ( 
         <StudiengangForm 
            degrees={officialDegrees} 
            current={profile?.studiengang ?? ""} 
                />    
            )
        }        
//keep mine

