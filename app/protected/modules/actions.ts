"use server";
import { createClient } from "@/lib/supabase/server";
import { UUID } from "crypto";

export async function getUserStudiengangId() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
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
    const studiengangDaten = await fetchMoses(`/studiengang/${studiengangId}`);
    const studiengang = studiengangDaten?.data?.[0];
    if (!studiengang) return [];

    // ← stupoList absichern: leere/fehlende Liste würde reduce zum Absturz bringen
    const stupoList: MosesRef[] = studiengang.stupoList ?? [];
    if (stupoList.length === 0) return [];
    const neuesteStupo = stupoList.reduce((max, s) => s.id > max.id ? s : max);

    //.reduce((max, s) => s.id > max.id ? s : max);

    const abbildungListeDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
    console.log("stupo: ", neuesteStupo.id);
    console.log("abbilldungsdaten: ", abbildungListeDaten);
    const abbildungRef = abbildungListeDaten?.data?.[0];
    if (!abbildungRef) return [];
    console.log("Ist die Liste schon da?", abbildungRef?.modullisteList);
    const abbildungDetailDaten = await fetchMoses(`/studiengangsabbildung/${abbildungRef.id}`);
    const abbildungDetail = abbildungDetailDaten?.data?.[0];
    if (!abbildungDetail) return [];

    let modullisteIds: MosesRef[] = abbildungDetail.modullisteList ?? [];
    let isBologna = false;
    if (modullisteIds.length === 0) {
        modullisteIds = abbildungDetail.bolognamodullisteList ?? [];
        isBologna = true;
    }
    if (modullisteIds.length === 0) return [];

    const neuesteModullisteId = modullisteIds.reduce(
        (max, ml) => ml.id > max.id ? ml : max
    ).id;


    if (!isBologna) {
        const modullisteDaten = await fetchMoses(`/modulliste/${neuesteModullisteId}`);
        const aktuelleModulliste = modullisteDaten?.data?.[0];
        if (!aktuelleModulliste) return [];
        const zuordnungen: MosesRef[] = aktuelleModulliste.studiengangszuordnungList ?? [];   // ← typisiert
        if (zuordnungen.length === 0) return [];
        //there are duplicate elements in studiengangszuordnungList..so gotta get the newest vers
        const uniquezuordnungen = new Map<string, MosesRef>()
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
                batch.map(async (z) => {   // ← z wird automatisch als MosesRef erkannt, kein any mehr
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
                            name: zuordnung?.name ?? "",                       // ← Fallback
                            lp: zuordnung?.modullp ?? 0,                       // ← Fallback
                            bereichPfad,
                            semester: zuordnung?.makroturnus?.name ?? ""       // ← ?. + Fallback (war makroturnus.name)
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
    // ->/studiengang-> stupoid-> get fields from reference in /studiengangabbildung -> if modulliste exists: isBologna stays false -> /studiengangzuordnung->Module
    // if isBologna is true: -> /bolognamodulliste -> get group ids-> /bolognamodullistengruppe -> /bolognamodullistenzuordnung/{id}
    else {
        const bolognaDaten = await fetchMoses(`/bolognamodulliste/${neuesteModullisteId}`);
        const aktuelleBolognaListe = bolognaDaten?.data?.[0];
        if (!aktuelleBolognaListe) return [];
        console.log("Aktuelle Bolognamodulliste: ", aktuelleBolognaListe);

        const gruppenRefs: MosesRef[] = aktuelleBolognaListe.bolognamodulListengruppeList ?? [];
        if (gruppenRefs.length === 0) return [];
        const uniquegroups = new Map<string, MosesRef>()
        for (const x of gruppenRefs) {
            const moduleName = x.name || x.id.toString();
            const existing = uniquegroups.get(moduleName);
            if (!existing || x.id > existing.id) {
                uniquegroups.set(moduleName, x);
            }
        }
        const filteredgroups = Array.from(uniquegroups.values());
        // loop through groups basically
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
        console.log("GruppenErgebnisse sind da: ", gruppenErgebnisse)

        // the array needs to be 1 dim
        const alleBolognaZuordnungen: MosesRef[] = gruppenErgebnisse.flat();
        if (alleBolognaZuordnungen.length === 0) return [];
        //#removed duplicates like above and below
        const uniqueBolognaMap = new Map<string, MosesRef>()
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
                        // Bolognasystem has a different endpoint
                        const zuordnungRaw = await fetchMoses(`/bolognamodullistenzuordnung/${z.id}`);
                        const zuordnung = zuordnungRaw?.data?.[0];
                        if (!zuordnung) return null;

                        // ID-Fallback (identisch zum alten System)
                        const actualModulId = zuordnung?.bolognamodulVersion?.bolognamodul?.id ||
                            zuordnung?.bolognamodul?.id ||
                            z.id;

                        // BereichsPfad in zuordnung 
                        const gruppenName = zuordnung?.bolognamodulListengruppe?.name;
                        const bereichPfad = gruppenName ? [gruppenName] : [];

                        return {
                            id: actualModulId,
                            // modultitel instead of name in /bolognamodullistenzuordnung/{id}
                            name: zuordnung?.modultitel ?? zuordnung?.bolognamodulVersion?.name ?? "",
                            lp: zuordnung?.modullp ?? 0,
                            bereichPfad,
                            semester: zuordnung?.makroturnus?.name ?? ""
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
}

// Verlagerung der detailedmodules Komponente, da client komponenten keine server action/Komponente wrappen/einbetten oder aufrufen können..

export async function ladeDetailedModulAction(modul_id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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

        // fetchMoses hat bereits try/catch + null-Fallback eingebaut
        let zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${modul_id}`);
        let zuordnung = zuordnungRaw?.data?.[0];
        if (!zuordnung) {
            zuordnungRaw = await fetchMoses(`/bolognamodullistenzuordnung/${modul_id}`); //new fallback
            zuordnung = zuordnungRaw?.data?.[0];
        }

        if (!zuordnung) return details;// Fallback: leere Details zurückgeben


        const versionId = zuordnung?.bolognamodulVersion?.id;

        let version = null;
        if (versionId) {
            const versionRaw = await fetchMoses(`/bolognamodulversion/${versionId}`);
            version = versionRaw?.data?.[0];
        }

        const bolognamodulId = version?.bolognamodul?.id;
        const beschreibungId = version?.bolognamodulBeschreibung?.id;
        const versionsnummer = version?.versionsnummer;

        // Nummer, Beschreibung und Prüfung gleichzeitig
        // fetchMoses gibt null zurück bei Fehler — kein Absturz mehr
        const [bolognamodulData, beschreibungData, pruefungData] = await Promise.all([
            bolognamodulId
                ? fetchMoses(`/bolognamodul/${bolognamodulId}`)
                : Promise.resolve(null),
            beschreibungId
                ? fetchMoses(`/bolognamodulbeschreibung/${beschreibungId}`)
                : Promise.resolve(null),
            fetchMoses(`/bolognamodulpruefung?bolognamodulId=${modul_id}`),
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


//Custom Modul in Supabase speichern:
//Wird immer in current Semester hinzugefügt

export async function getCurrentSemester() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
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

export async function createCustomModul(modulname: string,
    bereichspfad: string,
    ects: number,
    turnus: string,
    beschreibung: string,
    pruefungsform: string,
    benotet: boolean | null,
    arbeitsaufwand: number,
    semesterId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Schritt 1: Modul anlegen
    const { data, error } = await supabase
        .from('module')
        .insert({
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
            moses_id: null,
        })
        .select()
        .single();


    if (error) {
        console.error('Fehler beim Aktualisieren:', error)
        console.log(error.code);
        console.log(error.message);
        console.log(error.details);
        console.log(error.hint);
        throw error
    }

    // Schritt 2: Verknüpfung in planner anlegen
    const { error: plannerError } = await supabase
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

export async function addCustomModultoPlanner(groupId: UUID, modul_id: ModuleId) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { error } = await supabase
        .from("planner")
        .insert({
            modul_id: modul_id,
            group_id: groupId,
            user_id: user.id,

        })
        .select()
        .single();

    if (error) throw error;
}