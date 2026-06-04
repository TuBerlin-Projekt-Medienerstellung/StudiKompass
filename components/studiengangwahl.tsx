import { createClient } from "@/lib/supabase/server";
import StudiengangForm from "./studiengangwahl-form"

export default async function Studiengangwahl() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    let officialDegrees: any[] = [];
    try {
        {/* Only fetch if the URL actually exists in your .env*/}
        if (process.env.moses_API_URL) {
            const degreeResponse = await fetch(
        `${process.env.moses_API_URL}/studiengang?pageSize=500`,
        {
            headers: process.env.moses_API_KEY
                ? { 'x-api-key': process.env.moses_API_KEY }  //used bearer before, email says form apikey required
                : {},
            next: { revalidate: 86400 } //still the same caching to reduce unwanted traffic and prevent slow flow
        }
    );

        if (degreeResponse.ok) {
        const firstPage = await degreeResponse.json();
        officialDegrees = firstPage.data ?? [];

        const totalPages = firstPage.totalPages ?? 1;

        for (let page = 2; page <= totalPages; page++) {
            const res = await fetch(
                `${process.env.moses_API_URL}/studiengang?pageSize=500&pageNumber=${page}`,
                {
                    headers: { 'x-api-key': process.env.Studiengaenge_API_KEY || "" },
                    next: { revalidate: 86400 }
                }
            );
            const pageData = await res.json();
            officialDegrees = [...officialDegrees, ...(pageData.data ?? [])];
        }
    } else {
                console.error("Fetch failed with status:", degreeResponse.status);
            }
        }
    } catch (e) {
        console.error("Fetch crashed:", e);
    }

  // Data for testing
    if (!Array.isArray(officialDegrees) || officialDegrees.length === 0) {
        officialDegrees = [
        { id: "1", name: "Medieninformatik"},
        { id: "2", name: "Informatik" },
        { id: "3", name: "Wirtschaftsinformatik" }
        ];
    }{/* Got this: Cannot read properties of undefined (reading 'toString')
        that's why I added somethings when the fetch returns nothing, which it will, since I dont have a key*/}

    {/* Studiengang choice*/}
    const { data: profile } = await supabase
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

        


