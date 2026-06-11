"use server";
import { createClient } from "@/lib/supabase/server";

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
// Minimaler Typ für MOSES-Referenzen, die nur eine id tragen.
// (Die vollen MOSES-Antwortobjekte bleiben bewusst untypisiert)
interface MosesRef {
    id: number;
}

export interface ModulBasis {
    id: number;
    name: string;
    lp: number;
    bereichPfad: string[]; 
    semester: string;
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

    const abbildungListeDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
    const abbildungRef = abbildungListeDaten?.data?.[0];
    if (!abbildungRef) return [];

    const abbildungDetailDaten = await fetchMoses(`/studiengangsabbildung/${abbildungRef.id}`);
    const abbildungDetail = abbildungDetailDaten?.data?.[0];
    if (!abbildungDetail) return [];

    const modullisteIds: MosesRef[] = abbildungDetail.modullisteList ?? [];   // ← MosesRef statt inline-Typ
    if (modullisteIds.length === 0) return [];

    const neuesteModullisteId = modullisteIds.reduce(
        (max, ml) => ml.id > max.id ? ml : max
    ).id;

    const modullisteDaten = await fetchMoses(`/modulliste/${neuesteModullisteId}`);
    const aktuelleModulliste = modullisteDaten?.data?.[0];
    if (!aktuelleModulliste) return [];

    const zuordnungen: MosesRef[] = aktuelleModulliste.studiengangszuordnungList ?? [];   // ← typisiert
    if (zuordnungen.length === 0) return [];

    const BATCH_SIZE = 30;
    const moduleRoh: ModulBasis[] = [];

    for (let i = 0; i < zuordnungen.length; i += BATCH_SIZE) {
        const batch = zuordnungen.slice(i, i + BATCH_SIZE);
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

// Verlagerung der detailedmodules Komponente, da client komponenten keine server action/Komponente wrappen/einbetten oder aufrufen können..

export async function ladeDetailedModulAction(modul_id: number) {
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
        // Schritt 1 (sequenziell): zuordnung → version
        // fetchMoses hat bereits try/catch + null-Fallback eingebaut
        const zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${modul_id}`);
        const zuordnung = zuordnungRaw?.data?.[0];
        if (!zuordnung) return details;  // Fallback: leere Details zurückgeben

        const versionId = zuordnung?.bolognamodulVersion?.id;

        let version = null;
        if (versionId) {
            const versionRaw = await fetchMoses(`/bolognamodulversion/${versionId}`);
            version = versionRaw?.data?.[0];
        }

        const bolognamodulId = version?.bolognamodul?.id;
        const beschreibungId = version?.bolognamodulBeschreibung?.id;
        const versionsnummer = version?.versionsnummer;

        // Schritt 2 (parallel): Nummer, Beschreibung und Prüfung gleichzeitig
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
            pruefungselemente: pruefung?.pruefungselementList?.map((p: {name: string}) => p.name) ?? [],
            anmeldeformalitaetenDE: pruefung?.anmeldeformalitaetenDE ?? "",
            link: nummer != null ? baueMosesLink(nummer, versionsnummer) : "",
        }

    } catch (e) {
        console.error("Ein Problem ist beim Fetch aufgetreten:", e)
    }

    return details;
}

