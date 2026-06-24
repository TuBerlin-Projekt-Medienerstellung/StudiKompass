"use server";
import { createClient } from "@/lib/supabase/server";
import { UUID } from "crypto";

export async function getUserStudiengangId() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles") // oder wie deine Tabelle heißt
        .select("studiengang_id")
        .eq("id", user.id)
        .single();

    return profile?.studiengang_id || null;
}


async function fetchMoses(path: string) {
    try {
        const res = await fetch(`${process.env.moses_API_URL}${path}`, { 
            headers: { 
                "accept": "application/json",
                "x-api-key": process.env.moses_API_KEY || ""
            },
            next: { revalidate: 86400 } 
        });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error(`MOSES Fehler für ${path}:`, e);
        return null;
    }
}

// Rekursive Funktion für Kategorien (Pflicht/Wahlpflicht)
async function getBereichPfad(bereichId: number): Promise<string[]> {
    const data = await fetchMoses(`/studiengangsbereich/${bereichId}`);
    const bereich = data?.data?.[0];
    if (!bereich) return [];
    if (bereich.parent?.id) {
        const elternPfad = await getBereichPfad(bereich.parent.id); 
        return [...elternPfad, bereich.name];
    }
    return [bereich.name];
}

export interface ModulBasis {
    id: number;
    name: string;
    lp: number;
    bereichPfad: string[]; 
}

export async function ladeModulBasisAction(studiengangId: number): Promise<ModulBasis[]> {
    const studiengangDaten = await fetchMoses(`/studiengang/${studiengangId}`);
    const studiengang = studiengangDaten?.data?.[0];
    if (!studiengang) return [];

    const neuesteStupo = studiengang.stupoList.reduce((max: any, s: any) =>
        s.id > max.id ? s : max
    );

    const abbildungListeDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
    const abbildungRef = abbildungListeDaten?.data?.[0];
    if (!abbildungRef) return [];

    const abbildungDetailDaten = await fetchMoses(`/studiengangsabbildung/${abbildungRef.id}`);
    const abbildungDetail = abbildungDetailDaten?.data?.[0];
    if (!abbildungDetail) return [];

    const modullisteIds: { id: number }[] = abbildungDetail.modullisteList ?? [];
    if (modullisteIds.length === 0) return [];

    const neuesteModullisteId = modullisteIds.reduce(
        (max, ml) => ml.id > max.id ? ml : max
    ).id;

    const modullisteDaten = await fetchMoses(`/modulliste/${neuesteModullisteId}`);
    const aktuelleModulliste = modullisteDaten?.data?.[0];
    if (!aktuelleModulliste) return [];

    const zuordnungen = aktuelleModulliste.studiengangszuordnungList ?? [];
    if (zuordnungen.length === 0) return [];

    const BATCH_SIZE = 30;
    const moduleRoh: ModulBasis[] = [];

    for (let i = 0; i < zuordnungen.length; i += BATCH_SIZE) {
        const batch = zuordnungen.slice(i, i + BATCH_SIZE);
        const batchErgebnisse = await Promise.all(
            batch.map(async (z: any) => {
                try {
                    const zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${z.id}`);
                    const zuordnung = zuordnungRaw?.data?.[0];
                    if (!zuordnung) return null;

                    const bereichPfad = zuordnung?.studiengangsbereich?.id
                        ? await getBereichPfad(zuordnung.studiengangsbereich.id)
                        : [];
                    const actualModulId = zuordnung?.bolognamodul?.id || 
                          zuordnung?.bolognamodulVersion?.bolognamodul?.id || 
                          z.id;
                    return {
                        id: actualModulId,
                        name: zuordnung?.name,
                        lp: zuordnung?.modullp,
                        bereichPfad
                    } as ModulBasis;
                } catch {
                    return null;
                }
            })
        );
        moduleRoh.push(...batchErgebnisse.filter(Boolean) as ModulBasis[]);
    }

    return moduleRoh;
 }

// Verlagerung der detailedmodules Komponente, da client komponenten keine server action/Komponente wrappen/einbetten oder aufrufen können..

export async function ladeDetailedModulAction(modul_id: number) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const baseUrl = process.env.moses_API_URL;
    const headers: HeadersInit = process.env.moses_API_KEY
        ? { 'x-api-key': process.env.moses_API_KEY }
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
    }

    try {
        if (baseUrl) {
            const [beschreibungResponse, pruefungResponse] = await Promise.all([
                fetch(`${baseUrl}/bolognamodulbeschreibung?bolognamodulId=${modul_id}`, { headers, next: { revalidate: 86400 } }),
                fetch(`${baseUrl}/bolognamodulpruefung?bolognamodulId=${modul_id}`,     { headers, next: { revalidate: 86400 } }),
            ]);

            const [beschreibungData, pruefungData] = await Promise.all([
                beschreibungResponse.json(),
                pruefungResponse.json(),
            ]);

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
                pruefungselemente: pruefung?.pruefungselementList?.map((p: {name:string}) => p.name) ?? [],
                anmeldeformalitaetenDE: pruefung?.anmeldeformalitaetenDE,
            }
        }
    } catch (e) {
        console.error("Ein Problem ist beim Fetch aufgetreten:", e)
    }

    return (details)
}

//Custom Modul in Supabase speichern:
//Wird immer in current Semester hinzugefügt

export async function getCurrentSemester(){
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
    .from('profiles')
    .select("current_semester")
    .eq("id", user.id)
    .select()
    .single();

    if (error) {
        console.error('Fehler beim Aktualisieren:', error)
        throw error
    }



    return data.current_semester;
}

export async function createCustomModul(modulname: string,
                                        bereichspfad: string,
                                        ects: number,
                                        turnus: string,
                                        beschreibung: string,
                                        pruefungsform: string,
                                        benotet: boolean | null,) {
    
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const modul_id = crypto.randomUUID();
    const { data, error } = await supabase
    .from('module')
    .insert({id:modul_id,
            name: modulname,
            turnus: turnus,
            bereichpfad: bereichspfad,
            ects: ects,
            lernergebnisse: beschreibung,
            pruefungsform: pruefungsform,
            benotet: benotet,
            voraussetzungen: null,
            moseslink: null,
            note: null,
            gewichtung: null,
            versuche: 1,
            arbeitsaufwand: 0,
            user_id: user.id,
    })
    .select()
    .single();

    if (error) {
        console.log(error.code);
        console.log(error.message);
        console.log(error.details);
        console.log(error.hint);
        console.error('Fehler beim Aktualisieren:', error)
        throw error
    }

    return data.id;
}

export async function addCustomModultoPlanner() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const modul_id = crypto.randomUUID();
    const groupId = crypto.randomUUID();

    const { data, error } = await supabase
    .from("planner")
    .insert({
        group_id: groupId,   //Woher nehme ich die GroupID?
        user_id: user.id,
        modul_id: modul_id,     
    })
    .select()
    .single();

        if (error) throw error;
    }