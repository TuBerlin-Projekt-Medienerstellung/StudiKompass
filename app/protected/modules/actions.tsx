// app/protected/modules/actions.ts
"use server";

/**
 * Server Actions für die Modulsuche
 *
 * "use server" bedeutet: dieser Code läuft ausschließlich auf dem Server.
 * Der MOSES API-Key ist dadurch nie im Browser sichtbar.
 * Aufgerufen wird die Action vom Client (moses-modulsuche.tsx) bei Knopfdruck.
 */

const BASE_URL = "https://demo.moses.tu-berlin.de/moses/api/v1";

/**
 * Generische Hilfsfunktion für GET-Requests an die MOSES API.
 * Gibt null zurück statt einen Fehler zu werfen (Fallback-Verhalten).
 *
 * @param path - API-Pfad relativ zur BASE_URL, z.B. "/studiengang/37"
 * @returns Geparste JSON-Antwort oder null bei Fehler
 */
async function fetchMoses(path: string) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: {
                "accept": "application/json",
                "x-api-key": process.env.MOSES_API_KEY || ""
            },
            // Next.js cached jeden einzelnen API-Call für 24 Stunden
            // dadurch wird es beim zweiten Knopfdruck deutlich schneller
            next: { revalidate: 86400 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error(`MOSES Fehler für ${path}:`, e);
        return null;
    }
}

/**
 * Ermittelt den vollständigen hierarchischen Pfad eines Studiengangsbereichs
 * durch rekursives Traversieren der Parent-Beziehungen.
 *
 * @example
 * // Gibt zurück: ["Wahlpflichtmodule", "Schwerpunktmodule", "Methodenorientierung"]
 * await getBereichPfad(12345)
 *
 * @param bereichId - ID des Studiengangsbereichs
 * @returns Array von Bereichsnamen vom Root bis zum aktuellen Bereich
 */
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

/**
 * Shape eines einzelnen Moduls — nur Basisinformationen.
 * Details (Beschreibung, Prüfungsform etc.) werden erst beim
 * Ausklappen der Karte geladen (noch nicht implementiert).
 */
export interface ModulBasis {
    id: number;          // Studiengangszuordnung ID — wird beim Ausklappen weitergegeben
    name: string;        // Modulname
    lp: number;          // Leistungspunkte (ECTS)
    bereichPfad: string[]; // z.B. ["Pflichtmodule", "Mathematik"] — genutzt für Filter
}

/**
 * Server Action — lädt alle Basisinformationen der Module eines Studiengangs.
 * Wird von moses-modulsuche.tsx beim ersten Knopfdruck aufgerufen.
 *
 * Lädt bewusst NUR Name, ECTS und bereichPfad — keine Details.
 * Details werden erst beim Ausklappen einer Karte gefetcht.
 *
 * Datenpfad:
 * Studiengang → neueste StuPO → Studiengangsabbildung → aktuellste Modulliste
 * → Studiengangszuordnungen → Name + ECTS + bereichPfad (rekursiv)
 *
 * Performance:
 * - Module werden in 30er-Batches parallel geladen (Promise.all)
 * - Jeder API-Call wird 24h gecacht (next: { revalidate: 86400 })
 * - Erster Load: ~600ms, danach deutlich schneller dank Cache
 *
 * @param studiengangId - MOSES ID des Studiengangs (z.B. 37 = Maschinenbau B.Sc.)
 * @returns Array von ModulBasis Objekten oder leeres Array bei Fehler
 */
export async function ladeModulBasisAction(studiengangId: number): Promise<ModulBasis[]> {
    // Schritt 1: Studiengang laden
    const studiengangDaten = await fetchMoses(`/studiengang/${studiengangId}`);
    const studiengang = studiengangDaten?.data?.[0];
    if (!studiengang) return [];

    // Schritt 2: Neueste StuPO ermitteln (höchste ID = aktuellste)
    const neuesteStupo = studiengang.stupoList.reduce((max: any, s: any) =>
        s.id > max.id ? s : max
    );

    // Schritt 3: Studiengangsabbildung-Referenz laden
    // Die Abbildung verknüpft StuPO mit Modulen und Bereichen
    const abbildungListeDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
    const abbildungRef = abbildungListeDaten?.data?.[0];
    if (!abbildungRef) return [];

    // Schritt 4: Studiengangsabbildung-Detail laden
    // Enthält modullisteList mit allen zugehörigen Modullisten-IDs
    // → dadurch können wir direkt /modulliste/{id} aufrufen statt
    //   alle 4MB von /modulliste zu laden und lokal zu filtern
    const abbildungDetailDaten = await fetchMoses(`/studiengangsabbildung/${abbildungRef.id}`);
    const abbildungDetail = abbildungDetailDaten?.data?.[0];
    if (!abbildungDetail) return [];

    // Schritt 5: Aktuellste Modulliste direkt laden
    // Aktuellste = höchste ID in modullisteList
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

    // Schritt 6: Module in 30er-Batches parallel laden
    // Pro Modul werden nur 2 Calls gemacht (studiengangszuordnung + studiengangsbereich)
    // statt 5 wie bei der vollständigen Detail-Route
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

                    // bereichPfad rekursiv ermitteln für die Filter-Logik
                    const bereichPfad = zuordnung?.studiengangsbereich?.id
                        ? await getBereichPfad(zuordnung.studiengangsbereich.id)
                        : [];

                    return {
                        id: z.id,
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