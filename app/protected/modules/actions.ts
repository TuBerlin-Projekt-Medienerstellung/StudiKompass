"use server";

import {createClient} from "@/lib/supabase/server";
import {UUID} from "crypto";

export async function getUserStudiengangId() {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const {data: profile} = await supabase
        .from("profiles")
        .select("studiengang_id")
        .eq("id", user.id)
        .single();

    return profile?.studiengang_id || null;
}

export async function fetchMoses(path: string) {
    try {
        const res = await fetch(`${process.env.moses_API_URL}${path}`, {
            headers: {
                "accept": "application/json",
                "x-api-key": process.env.moses_API_KEY || ""
            },
            next: {revalidate: 86400}
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

// Minimaler Typ für MOSES-Referenzen, die nur eine id tragen.
// (Die vollen MOSES-Antwortobjekte bleiben bewusst untypisiert)
interface MosesRef {
    id: number;
    name?: string;
}

export interface ModulBasis {
    id: ModuleId;
    name: string;
    lp: number;
    bereichPfad: string[];
    semester: string;
    turnus?: string;
}

// Baut die MOSES-Modul-URL.
// Fehlt die Version, öffnet auf MOSES automatisch die aktuellste Version des Moduls.
function baueMosesLink(nummer: number | string, version?: number | string | null): string {
    const basis = `https://moseskonto.tu-berlin.de/moses/modultransfersystem/bolognamodule/beschreibung/anzeigen.html?nummer=${nummer}`;
    return version != null ? `${basis}&version=${version}` : basis;
}

export async function ladeModulBasisAction(studiengangId: number): Promise<ModulBasis[]> {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    let user_stupo: string | null = null;
    
    if (user) {
        const {data: profile} = await supabase
            .from("profiles")
            .select("stupo_year")
            .eq("id", user.id)
            .single();
        user_stupo = profile?.stupo_year || null;
    }
    const studiengangDaten = await fetchMoses(`/studiengang/${studiengangId}`);
    const studiengang = studiengangDaten?.data?.[0];
    if (!studiengang) return [];
    console.log("StudiengangId", studiengangId);
    console.log("Studiengang Data", studiengang);

    const stupoList: MosesRef[] = studiengang.stupoList ?? [];
    if (stupoList.length === 0) return [];
    let neuesteStupo = null;
    if (user_stupo) {
        neuesteStupo = stupoList.find(s => s.name?.includes(user_stupo));}
    if (!neuesteStupo) {
        neuesteStupo = stupoList.reduce((max, s) => s.id > max.id ? s : max);}
    //const neuesteStupo = { id: 24652 }; 
    // 24544 (2015), 24653: empty, 24652:empty, 37: empty, 6161:full (2013), 16501:full (2014)
    //this means the code should filter via the year in the stupo name
    //should the user have to tell us his Stupo? This also means other filters including other scripts have to have a different mechanism rather than max-search
    console.log("Stupo id", neuesteStupo);
    const abbildungListeDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
    const abbildungRef = abbildungListeDaten?.data?.[0];
    if (!abbildungRef) return [];
    console.log("abbildungRef for Studiengangabbildung", abbildungRef);

    const abbildungDetailDaten = await fetchMoses(`/studiengangsabbildung/${abbildungRef.id}`);
    const abbildungDetail = abbildungDetailDaten?.data?.[0];
    if (!abbildungDetail) return [];
    console.log("studiengangsabbildung Data", abbildungDetail);

    let modullisteIds: MosesRef[] = abbildungDetail.modullisteList ?? [];
    let isBologna = false;

    if (modullisteIds.length === 0) {
        modullisteIds = abbildungDetail.bolognamodullisteList ?? [];
        isBologna = true;
    }

    if (modullisteIds.length === 0) return [];

    const neuesteModullisteId = modullisteIds.reduce((max, ml) => ml.id > max.id ? ml : max).id;

    // Nicht-Bologna-Pfad
    if (!isBologna) {
        const modullisteDaten = await fetchMoses(`/modulliste/${neuesteModullisteId}`);
        const aktuelleModulliste = modullisteDaten?.data?.[0];
        if (!aktuelleModulliste) return [];
        console.log("aktuelleModulliste Data", aktuelleModulliste);


        const zuordnungen: MosesRef[] = aktuelleModulliste.studiengangszuordnungList ?? [];
        if (zuordnungen.length === 0) return [];

        const uniquezuordnungen = new Map<string, MosesRef>();
        for (const z of zuordnungen) {
            const moduleName = z.name || z.id.toString();
            const existing = uniquezuordnungen.get(moduleName);
            if (!existing || z.id > existing.id) {
                uniquezuordnungen.set(moduleName, z);
            }
        }

        const filteredzuordnungen = Array.from(uniquezuordnungen.values());

        const BATCH_SIZE = 30;
        const moduleRoh: ModulBasis[] = [];

        for (let i = 0; i < filteredzuordnungen.length; i += BATCH_SIZE) {
            const batch = filteredzuordnungen.slice(i, i + BATCH_SIZE);
            const batchErgebnisse = await Promise.all(
                batch.map(async (z) => {
                    try {
                        const zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${z.id}`);
                        const zuordnung = zuordnungRaw?.data?.[0];
                        if (!zuordnung) return null;

                        const bereichPfad = zuordnung?.studiengangsbereich?.id
                            ? await getBereichPfad(zuordnung.studiengangsbereich.id)
                            : [];

                        const actualModulId =
                            zuordnung?.bolognamodul?.id ||
                            zuordnung?.bolognamodulVersion?.bolognamodul?.id ||
                            z.id;

                        return {
                            id: { type: "moses", value: actualModulId },
                            name: zuordnung?.name ?? "",                      
                            lp: zuordnung?.modullp ?? 0,                       
                            bereichPfad,
                            semester: zuordnung?.makroturnus?.name ?? "",
                        } as ModulBasis;
                    } catch {
                        return null;
                    }
                })
            );

            moduleRoh.push(...(batchErgebnisse.filter(Boolean) as ModulBasis[]));
        }
        console.log("moduleRoh Data", moduleRoh);

        return moduleRoh;
    }

    // Bologna-Pfad
    const bolognaDaten = await fetchMoses(`/bolognamodulliste/${neuesteModullisteId}`);
    const aktuelleBolognaListe = bolognaDaten?.data?.[0];
    if (!aktuelleBolognaListe) return [];

    console.log("Aktuelle Bolognamodulliste: ", aktuelleBolognaListe);

    const gruppenRefs: MosesRef[] = aktuelleBolognaListe.bolognamodulListengruppeList ?? [];
    if (gruppenRefs.length === 0) return [];

    const uniquegroups = new Map<string, MosesRef>();
    for (const x of gruppenRefs) {
        const moduleName = x.name || x.id.toString();
        const existing = uniquegroups.get(moduleName);
        if (!existing || x.id > existing.id) {
            uniquegroups.set(moduleName, x);
        }
    }

    const filteredgroups = Array.from(uniquegroups.values());

    const gruppenErgebnisse = await Promise.all(
        filteredgroups.map(async (gruppe) => {
            try {
                const gruppenRaw = await fetchMoses(`/bolognamodullistengruppe/${gruppe.id}`);
                const gruppeDetail = gruppenRaw?.data?.[0];
                return gruppeDetail?.bolognamodulListenzuordnungList ?? [];
            } catch {
                return [];
            }
        })
    );

    const alleBolognaZuordnungen: MosesRef[] = gruppenErgebnisse.flat();
    if (alleBolognaZuordnungen.length === 0) return [];

    const uniqueBolognaMap = new Map<string, MosesRef>();
    for (const z of alleBolognaZuordnungen) {
        const moduleName = z.name || z.id.toString();
        const existing = uniqueBolognaMap.get(moduleName);
        if (!existing || z.id > existing.id) {
            uniqueBolognaMap.set(moduleName, z);
        }
    }

    const filteredbolognazuordnungen = Array.from(uniqueBolognaMap.values());

    const BATCH_SIZE = 30;
    const moduleRoh: ModulBasis[] = [];

    for (let i = 0; i < filteredbolognazuordnungen.length; i += BATCH_SIZE) {
        const batch = filteredbolognazuordnungen.slice(i, i + BATCH_SIZE);
        const batchErgebnisse = await Promise.all(
            batch.map(async (z) => {
                try {
                    const zuordnungRaw = await fetchMoses(`/bolognamodullistenzuordnung/${z.id}`);
                    const zuordnung = zuordnungRaw?.data?.[0];
                    if (!zuordnung) return null;

                    const actualModulId =
                        zuordnung?.bolognamodulVersion?.bolognamodul?.id ||
                        zuordnung?.bolognamodul?.id ||
                        z.id;

                    const gruppenName = zuordnung?.bolognamodulListengruppe?.name;
                    const bereichPfad = gruppenName ? [gruppenName] : [];

                    return {
                        id: {type: "moses", value: actualModulId},
                        // modultitel instead of name in /bolognamodullistenzuordnung/{id}
                        name: zuordnung?.modultitel ?? zuordnung?.bolognamodulVersion?.name ?? "",
                        lp: zuordnung?.modullp ?? 0,
                        bereichPfad,
                        semester: zuordnung?.makroturnus?.name ?? "",
                    } as ModulBasis;
                } catch {
                    return null;
                }
            })
        );

        moduleRoh.push(...(batchErgebnisse.filter(Boolean) as ModulBasis[]));
    }
    console.log("moduleRoh Data", moduleRoh);

    return moduleRoh;
}

// Verlagerung der detailedmodules Komponente, da client komponenten keine server action/Komponente wrappen/einbetten oder aufrufen können..
export async function ladeDetailedModulAction(modul_id: string | number) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

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
        link: "",
    }

    try {
        const id = String(modul_id);

        // fetchMoses hat bereits try/catch + null-Fallback eingebaut
        let zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${id}`);
        let zuordnung = zuordnungRaw?.data?.[0];

        if (!zuordnung) {
            zuordnungRaw = await fetchMoses(`/bolognamodullistenzuordnung/${id}`); //new fallback
            zuordnung = zuordnungRaw?.data?.[0];
        }

        if (!zuordnung) return details;

        const versionId = zuordnung?.bolognamodulVersion?.id;

        let version = null;
        if (versionId) {
            const versionRaw = await fetchMoses(`/bolognamodulversion/${versionId}`);
            version = versionRaw?.data?.[0];
        }

        const bolognamodulId = version?.bolognamodul?.id;
        const beschreibungId = version?.bolognamodulBeschreibung?.id;
        const versionsnummer = version?.versionsnummer;

        const [bolognamodulData, beschreibungData, pruefungData] = await Promise.all([
            bolognamodulId
                ? fetchMoses(`/bolognamodul/${bolognamodulId}`)
                : Promise.resolve(null),
            beschreibungId
                ? fetchMoses(`/bolognamodulbeschreibung/${beschreibungId}`)
                : Promise.resolve(null),
            fetchMoses(`/bolognamodulpruefung?bolognamodulId=${id}`),
        ]);

        const nummer = bolognamodulData?.data?.[0]?.number;
        const beschreibung = beschreibungData?.data?.[0];
        const pruefung = pruefungData?.data?.[0];

        details = {
            lehrinhalte: beschreibung?.lehrinhalteDE ?? "",
            lernergebnisse: beschreibung?.lernergebnisseDE ?? "",
            voraussetzungen: beschreibung?.lehrveranstaltungsvoraussetzungenDE ?? "",
            lehrlernformen: beschreibung?.lehrlernformenDE ?? "",
            pruefungsform: pruefung?.pruefungsform?.name ?? "",
            benotet: pruefung?.benotet ?? null,
            pruefungsBeschreibung: pruefung?.beschreibungDE ?? "",
            pruefungselemente: pruefung?.pruefungselementList?.map((p: { name: string }) => p.name) ?? [],
            anmeldeformalitaetenDE: pruefung?.anmeldeformalitaetenDE ?? "",
            link: nummer != null ? baueMosesLink(nummer, versionsnummer) : "",
        }
    } catch (e) {
        console.error("Ein Problem ist beim Fetch aufgetreten:", e)
    }

    return details;
}

export async function ladeModulBasisByIdsAction(modulDaten: { id: string; name: string, stupo_year:string }[]): Promise<ModulBasis[]> {
    // Iterate through the modulIds array from supabase (fuse.js return)
    // Fetch the basic data for each ID from the Moses API like with ladeModulBasisAction
    // Format them into your ModulBasis[] type and return them
  
    if (!modulDaten || modulDaten.length === 0) return [];

    const BATCH_SIZE = 10; 
    const Basic_extended_Module: ModulBasis[] = [];

    for (let i = 0; i < modulDaten.length; i += BATCH_SIZE) {
        const batch = modulDaten.slice(i, i + BATCH_SIZE);
        
        const batchErgebnisse = await Promise.all(
            batch.map(async ({ id, name, stupo_year }) => {
                try {
                    // basically for every id I get for every fuse js match I wanna grab the version_id from ../bolognamodul/${id} 
                    const modulRaw = await fetchMoses(`/bolognamodul/${id}`);
                    const versionen = modulRaw?.data?.[0]?.bolognamodulVersionList ?? [];
                    console.log("Versionen:" ,versionen.length)
                    let lp = 0;
                    let semester = "Unbekannt";

                    if (versionen.length > 0) {
                        const neuesteVersion = versionen.reduce(
                            (max: any, v: any) => v.id > max.id ? v : max
                        );
                        
                        if (neuesteVersion?.id) {
                            const versionRaw = await fetchMoses(`/bolognamodulversion/${neuesteVersion.id}`);
                            const versionDetail = versionRaw?.data?.[0];

                            if (versionDetail) {
                                const desc_id = versionDetail.bolognamodulBeschreibung?.id;
                                const description = await fetchMoses(`/bolognamodulbeschreibung/${desc_id}`);
                                const descriptionDetail = description?.data?.[0];
                                if (descriptionDetail){
                                    lp = descriptionDetail.lp ?? 0;
                                    semester = descriptionDetail.makroturnus?.name ?? "Unbekannt";
                                }

                            }
                        }
                    }

                    return {
                        id: {type: "moses", value: Number(id)},
                        name: name,         //already exists in the json, always take german name for now
                        lp: lp,
                        bereichPfad: [stupo_year], // doesnt matter for extended search, add stupo_year instead
                        semester: semester
                    } as ModulBasis;

                } catch (error) {
                    console.error(`Fehler beim Abrufen von Modul ${id}:`, error);
                    return null;
                }
            })
        );

        Basic_extended_Module.push(...batchErgebnisse.filter(Boolean) as ModulBasis[]);
    }

    return Basic_extended_Module;
}

//Custom Modul in Supabase speichern:
//Wird immer in current Semester hinzugefügt

export async function getCurrentSemester() {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const {data, error} = await supabase
        .from('profiles')
        .select("current_semester, max_semester")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error('Fehler beim Abrufen:', error)
        throw error
    }

    if (data.current_semester <= 0) {
        throw new Error("Das aktuelle Semester muss größer als 0 sein.");
    }

    if (data.max_semester <= 0) {
        throw new Error("Das maximale Semester muss größer als 0 sein.");
    }

    return data.current_semester;
}

export async function createCustomModul(
    modulname: string,
    bereichspfad: string,
    ects: number,
    turnus: string,
    beschreibung: string,
    pruefungsform: string,
    benotet: boolean | null,
    arbeitsaufwand: number,
    semesterId: string
) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const modul_id = crypto.randomUUID();

    const {data, error} = await supabase
        .from('module')
        .insert({
            id: modul_id,
            name: modulname,
            turnus: turnus,
            bereichpfad: [bereichspfad],
            ects: ects,
            lernergebnisse: beschreibung,
            pruefungsform: pruefungsform,
            benotet: benotet,
            voraussetzungen: null,
            moseslink: null,
            note: null,
            gewichtung: null,
            versuche: 1,
            arbeitsaufwand: bereichspfad === "job"
                ? arbeitsaufwand
                : ects * 30,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error('Fehler beim Aktualisieren:', error)
        throw error
    }

    // Schritt 2: Verknüpfung in planner anlegen
    const {error: plannerError} = await supabase
        .from("planner")
        .insert({
            group_id: semesterId,
            modul_id: data.id,
            user_id: user.id,
        });

    if (plannerError) {
        console.error("Fehler beim Verknüpfen des Custom-Moduls:", plannerError);
        throw plannerError;
    }

    return data.id;
}

export async function addCustomModulToPlanner(groupId?: UUID, modul_id?: ModuleId) {
    const supabase = await createClient();

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) return null;

    const groupIdValue = groupId ?? crypto.randomUUID();

    let modulIdValue: string | number;
    if (!modul_id) {
        modulIdValue = crypto.randomUUID();
    } else if (typeof modul_id === 'object' && 'type' in modul_id) {
        modulIdValue = modul_id.value;
    } else {
        modulIdValue = modul_id as any;
    }

    const {error} = await supabase
        .from("planner")
        .insert({
            modul_id: modulIdValue,
            group_id: groupIdValue,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) throw error;
}//keep mine