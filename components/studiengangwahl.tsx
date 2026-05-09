import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function Studiengangwahl() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    let officialDegrees = [];
    try {
    {/* Only fetch if the URL actually exists in your .env*/}
        if (process.env.DEGREE_API_URL) {
            const degreeResponse = await fetch(process.env.DEGREE_API_URL, {
            headers: { 'Authorization': `Bearer ${process.env.DEGREE_API_KEY}` },
            next: { revalidate: 86400 } // 24h cache in nearby node (in seconds) ->no refetch
        });
        if (degreeResponse.ok) {
        officialDegrees = await degreeResponse.json(); {/*Server side fetch -> no cors problem? */}
    {/*Dunno what JSON returns..maybe I should have waited with this: [{ "id": "random_num", "name": "deg_name" }, ...]*/}
        }
        }
    }catch (e) {
        console.error("API spec failed, using fallbacks:", e);
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

        // selecting the degree, however bc this is based on speculation, we will leave it as is for now..
    const updateProfile = async (formData: FormData) => {
        "use server";
        const selection = formData.get("studiengang") as string;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await supabase.from("profiles").update({ studiengang: selection }).eq("id", user.id);
            revalidatePath("/protected/settings");
            }
        };

    return (
        <div className="w-full">
            <section className="w-full max-w-4xl space-y-8">
                <div className="bg-zinc-200 dark:bg-zinc-900 border border-zinc-600 dark:border-zinc-800 p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
                    
                    <form action={updateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-zinc-400 mb-2">
                                Studiengangwahl
                            </label>
                            <select 
                                name="studiengang"
                                defaultValue={profile?.studiengang || ""}
                                className="w-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-700 text-black dark:text-white rounded-lg px-4 py-2 outline-none"
                            >
                                <option value="">-- Wähle deinen Studiengang aus --</option>
                                {officialDegrees.map((deg, index) => (
                                    <option key={deg?.id?.toString() || index} value={deg?.name || ""}>
                                        {deg?.name || "Unbekannter Studiengang"}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button type="submit" className="bg-zinc-400 hover:bg-zinc-200 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-6 py-2 rounded-lg font-bold transition-all">
                            Studiengang speichern
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}