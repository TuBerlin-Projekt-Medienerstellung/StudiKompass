"use server";

import {createClient} from "@/lib/supabase/server";




//leeres Semester hinzufügen
export async function createSemester() {
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;


    const  { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("max_semester")
    .eq("id", user.id)
    .single();

    if (profileError) throw profileError;

    const nextSemester = (profile.max_semester ?? 0) + 1;
    
    const { data, error } = await supabase
    .from('profiles')
    .update({ max_semester: nextSemester})
    .eq("id", user.id)
    .select()
    .single();

    if (error) {
        console.error('Fehler beim Aktualisieren:', error)
        throw error
    }



  return data.max_semester;
}

//erstellt neue group in planner tabelle
export async function saveSemester() {
  const supabase = await createClient();

  const groupId = crypto.randomUUID();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { error } = await supabase
  .from("planner")
  .insert({
    group_id: groupId,  
    user_id: user.id,
    modul_id: null,     
  })
  .select()
  .single();

    if (error) throw error;
    
}

//erstellt neue Zeile in Tabelle Semester
export async function updateSemesterTable (semesterzahl: number){
    const supabase = await createClient();

    const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
  .from("planner")
  .insert({  
    name: semesterzahl+". Semester",
    semesterzahl: semesterzahl,
    user_id: user.id,   
  })
  .select()
  .single();
}



//leeres Semester löschen
export async function deleteSemester() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;


    const  { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("max_semester")
    .eq("id", user.id)
    .single();

    if (profileError) throw profileError;

    const { data, error } = await supabase
    .from('profiles')
    .update({ max_semester: profile.max_semester -1})
    .eq("id", user.id)
    .select()
    .single();

    if (error) {
        console.error('Fehler beim Löschen:', error)
        throw error
    }

    return data
}



//Holt STudiengangId weil Infos in Supabase mit StudiengangID gespeichert sind
export async function getUserStudiengangId() {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const {data: profile} = await supabase
        .from("profiles") //neue Tabelle zum speichern von Studiinfos?
        .select("studiengang_id")
        .eq("id", user.id)
        .single();

    return profile?.studiengang_id || null;
}

//Holt die anzahl der Versuche eines bestimmten Moduls
export async function getTries(modulId: number) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("module")
        .select("versuche")
        .eq("user_id", user.id)
        .eq("id", modulId)
        .maybeSingle();

    if (error) {
        console.error("Fehler beim Abrufen der Versuche:", error);
        return 0;
    }

    return data?.versuche ?? 0;
}

// Speichert die Versuche nur, wenn das Modul bereits existiert
export async function saveTries(modulId: number, counter: number) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Du bist nicht eingeloggt." };

    const { data, error } = await supabase
        .from("module")
        .update({ versuche: counter })
        .eq("user_id", user.id)
        .eq("id", modulId)
        .select();

    if (error) {
        console.error("Datenbank-Fehler beim Update:", error);
        return { success: false, error: "Datenbankfehler aufgetreten." };
    }

    if (!data || data.length === 0) {
        return { success: false, error: "Modul nicht in deiner Planung gefunden." };
    }

    return { success: true };
}

export async function fetchSupabase(Tabelle: string) {
    try {
        const supabase = await createClient();

        const {data, error} = await supabase
            .from(Tabelle)
            .select("*"); //brauch ich alles?

        if (error) {
            console.error(error);
            return null;
        }

        return data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export interface ModulBasis {
    id: number;
    name: string;
    lp: number;
    angebot: string;
    //link: ; -> Moseslink welcher Datentyp? 
}

async function ladeModulBasisAction(modul_id: number): Promise<ModulBasis[]> {
    const supabase = await createClient();
    try {
        const studiengangDaten = await fetchSupabase("modules?");//wie sind sie in Supabase gespeichert?
        const studiengang = studiengangDaten?.[0];
        if (!studiengang) return [];

        const {data, error} = await supabase
            .from("modules")
            .select("*")
            .eq("id", modul_id);

        if (error) {
            console.error(error);
            return [];
        }

        if (!data) {
            return [];
        }

        return data.map((m) => ({
            id: m.id,
            name: m.modulname,
            lp: m.leistungspunkte,
            angebot: m.angebot,
        }));

    } catch (e) {
        console.error(`Supabase Fehler für ${modul_id}:`, e);
        return [];
    }
}

//details der Module laden, wenn modulkartenmodal geöffnet wird
export async function ladeDetailedModulAction(modul_id: number) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const baseUrl = process.env.moses_API_URL;
    const headers: HeadersInit = process.env.moses_API_KEY
        ? {'x-api-key': process.env.moses_API_KEY}
        : {};


    let details = {
        lehrinhalte: "",
        lernergebnisse: "",
        voraussetzungen: "",
        lehrlernformen: "",
        pruefungsform: "",
        benotet: null as boolean | null,
        pruefungsBeschreibung: "",
        pruefungselemente: [] as string[],
        anmeldeformalitaetenDE: "",
        abgeschlossen: null as boolean | null,
    }

    try {
        if (baseUrl) {
            const [beschreibungResponse, pruefungResponse, abgeschlosseResponse] = await Promise.all([
                fetch(`${baseUrl}/bolognamodulbeschreibung?bolognamodulId=${modul_id}`, {
                    headers,
                    next: {revalidate: 86400}
                }),
                fetch(`${baseUrl}/bolognamodulpruefung?bolognamodulId=${modul_id}`, {
                    headers,
                    next: {revalidate: 86400}
                }),
                fetch(`${baseUrl}/abgeschlossen?bolognamodulId=${modul_id}`, {headers}),
            ]);

            const [beschreibungData, pruefungData, abgeschlossenData] = await Promise.all([
                beschreibungResponse.json(),
                pruefungResponse.json(),
                abgeschlosseResponse.json(),
            ]);

            type AbgeschlossenData = {
                abgeschlossen: boolean | null;
            };

            const abgeschlossen =
                abgeschlossenData?.data?.[0] as AbgeschlossenData;


            const beschreibung = beschreibungData?.data?.[0];
            const pruefung = pruefungData?.data?.[0];


                details = {
                    lehrinhalte: beschreibung?.lehrinhalteDE,
                    lernergebnisse: beschreibung?.lernergebnisseDE,
                    voraussetzungen: beschreibung?.lehrveranstaltungsvoraussetzungenDE,
                    lehrlernformen: beschreibung?.lehrlernformenDE,
                    pruefungsform: pruefung?.pruefungsform?.name,
                    benotet: pruefung?.benotet,
                    pruefungsBeschreibung: pruefung?.beschreibungDE,
                    pruefungselemente: pruefung?.pruefungselementList?.map((p: { name: string }) => p.name) ?? [],
                    anmeldeformalitaetenDE: pruefung?.anmeldeformalitaetenDE,
                    abgeschlossen: abgeschlossen?.abgeschlossen,
                }
        }
    } catch (e) {
        console.error("Ein Problem ist beim Fetch aufgetreten:", e)
    }

    return (details)
}


