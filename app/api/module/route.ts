/**
 * MOSES API Route — /api/module
 * 
 * Lädt alle Module eines Studiengangs von der MOSES Demo-API der TU Berlin.
 * 
 * @endpoint GET /api/module?studiengangId={id}
 * @param studiengangId - Die MOSES-ID des Studiengangs (z.B. 37 = Maschinenbau B.Sc., 83 = Maschinenbau M.Sc.)
 * 
 * @returns {Object} JSON mit folgendem Shape:
 * {
 *   studiengang: string,       // Name des Studiengangs
 *   semester: string,          // Aktuelles Semester der Modulliste
 *   stupo: string,             // Name der neuesten Studienprüfungsordnung
 *   anzahl: number,            // Anzahl geladener Module
 *   module: Modul[]            // Array aller Module (siehe Modul-Shape unten)
 * }
 * 
 * @example
 * fetch('/api/module?studiengangId=37')
 * 
 * Modul-Shape:
 * {
 *   id: number,                // bolognamodulVersion ID
 *   name: string,              // Modulname
 *   bereichPfad: string[],     // Hierarchischer Pfad z.B. ["Pflichtmodule", "Mathematik"]
 *   lp: number,                // Leistungspunkte (ECTS)
 *   pruefungsform: string,     // z.B. "Klausur", "Mündliche Prüfung"
 *   turnus: string,            // z.B. "Wintersemester", "Sommersemester"
 *   lernergebnisse: string | null,
 *   lehrinhalte: string | null,
 *   voraussetzungen: string | null,
 *   mosesUrl: string           // Direktlink zur Modulbeschreibung auf Moses-Konto
 * }
 * 
 * DEMO-API LIMITATION:
 * Nur Maschinenbau B.Sc. (ID: 37) und M.Sc. (ID: 83) haben vollständige
 * Modullisten in der Demo-API. Andere Studiengänge geben 404 zurück.
 * 
 * PERFORMANCE-OPTIMIERUNGEN (Entwicklungshistorie):
 * 
 * Problem 1 — /modulliste Flaschenhals (23 Sekunden):
 *   Ursprünglich wurde GET /modulliste (4MB, alle Studiengänge) geladen
 *   und lokal nach studiengangsabbildungId gefiltert. Next.js kann Responses
 *   über 2MB nicht cachen, daher wurde bei jedem Request neu geladen.
 *   Lösung: GET /studiengangsabbildung/{id} enthält direkt eine modullisteList
 *   mit allen zugehörigen IDs → nur noch GET /modulliste/{neuesteId} nötig → ~1ms
 * 
 * Problem 2 — Sequenzielles Laden der Module (40 Sekunden bei 253 Modulen):
 *   Jedes Modul benötigt 4-5 API-Calls (studiengangszuordnung, bolognamodulversion,
 *   bolognamodul, bolognamodulbeschreibung, studiengangsbereich rekursiv).
 *   Sequenziell: 253 × ~160ms = ~40s
 *   Lösung 1: Innerhalb ladeModulDetails() werden bolognamodul, beschreibung und
 *             bereichPfad parallel mit Promise.all geladen
 *   Lösung 2: Module werden in 30er-Batches parallel geladen
 *   Ergebnis: ~600ms für 253 Module (erste Anfrage), <10ms danach (Cache)
 */

const BASE_URL = "https://demo.moses.tu-berlin.de/moses/api/v1";
const HEADERS = {
    "accept": "application/json",
    "x-api-key": process.env.MOSES_API_KEY || ""
};

/** Next.js Route Cache — 24 Stunden. Verhindert wiederholte API-Calls */
export const revalidate = 86400;

/**
 * Generische Hilfsfunktion für GET-Requests an die MOSES API.
 * Gibt null zurück statt einen Fehler zu werfen (Fallback-Verhalten).
 * Alle Responses werden 24h von Next.js gecacht.
 * 
 * @param path - API-Pfad relativ zur BASE_URL, z.B. "/studiengang/37"
 * @returns Geparste JSON-Antwort oder null bei Fehler
 */
async function fetchMoses(path: string) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: HEADERS,
            next: { revalidate: 86400 }
        });
        if (!res.ok) {
            console.error(`MOSES API Fehler: ${res.status} für ${path}`);
            return null;
        }
        return res.json();
    } catch (e) {
        console.error(`MOSES API crashed für ${path}:`, e);
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
 * Lädt alle Details für eine einzelne Studiengangszuordnung.
 * 
 * Datenpfad pro Modul:
 * studiengangszuordnung → bolognamodulVersion → bolognamodul (für Moses-URL)
 *                                            → bolognamodulBeschreibung (Lernergebnisse etc.)
 *                       → studiengangsbereich (rekursiv für bereichPfad)
 * 
 * bolognamodul, beschreibung und bereichPfad werden parallel geladen (Promise.all)
 * um die Latenz pro Modul zu minimieren.
 * 
 * @param z - Studiengangszuordnung-Objekt mit mindestens {id: number}
 * @returns Aufbereitetes Modul-Objekt oder null bei Fehler
 */
async function ladeModulDetails(z: any): Promise<any | null> {
    try {
        const zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${z.id}`);
        const zuordnung = zuordnungRaw?.data?.[0];
        if (!zuordnung) return null;

        const versionRaw = await fetchMoses(`/bolognamodulversion/${zuordnung?.bolognamodulVersion?.id}`);
        const version = versionRaw?.data?.[0];
        if (!version) return null;

        // bolognamodul, Beschreibung und Bereichspfad parallel laden
        const [bolognamodulRaw, beschreibungRaw, bereichPfad] = await Promise.all([
            fetchMoses(`/bolognamodul/${version?.bolognamodul?.id}`),
            version?.bolognamodulBeschreibung?.id
                ? fetchMoses(`/bolognamodulbeschreibung/${version.bolognamodulBeschreibung.id}`)
                : Promise.resolve(null),
            zuordnung?.studiengangsbereich?.id
                ? getBereichPfad(zuordnung.studiengangsbereich.id)
                : Promise.resolve([])
        ]);

        const bolognamodul = bolognamodulRaw?.data?.[0];
        const beschreibung = beschreibungRaw?.data?.[0];

        return {
            id: zuordnung?.bolognamodulVersion?.id,
            name: zuordnung?.name,
            bereichPfad,
            lp: zuordnung?.modullp,
            pruefungsform: zuordnung?.bolognamodulPruefungsform?.name,
            turnus: zuordnung?.makroturnus?.name,
            lernergebnisse: beschreibung?.lernergebnisseDE ?? null,
            lehrinhalte: beschreibung?.lehrinhalteDE ?? null,
            voraussetzungen: beschreibung?.lehrveranstaltungsvoraussetzungenDE ?? null,
            mosesUrl: `https://moseskonto.tu-berlin.de/moses/modultransfersystem/bolognamodule/beschreibung/anzeigen.html?nummer=${bolognamodul?.number}`
        };
    } catch (e) {
        console.error(`Fehler beim Laden von Modul ${z.id}:`, e);
        return null;
    }
}

/**
 * GET /api/module?studiengangId={id}
 * 
 * Haupthandler. Lädt alle Module eines Studiengangs in 6 Schritten:
 * 
 * 1. Studiengang laden → neueste StuPO ermitteln
 * 2. Studiengangsabbildung-Referenz laden (via stupoId)
 * 3. Studiengangsabbildung-Detail laden (enthält modullisteList)
 * 4. Aktuellste Modulliste direkt laden (höchste ID = aktuellste)
 * 5. Module in 30er-Batches parallel laden
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studiengangId = searchParams.get("studiengangId");

        if (!studiengangId) {
            return Response.json({ error: "studiengangId fehlt" }, { status: 400 });
        }

        // Schritt 1: Studiengang laden
        console.time("Studiengang laden");
        const studiengangDaten = await fetchMoses(`/studiengang/${studiengangId}`);
        console.timeEnd("Studiengang laden");
        const studiengang = studiengangDaten?.data?.[0];
        if (!studiengang) {
            return Response.json({ error: "Studiengang nicht gefunden" }, { status: 404 });
        }

        // Schritt 2: Neueste StuPO ermitteln (höchste ID)
        const neuesteStupo = studiengang.stupoList.reduce((max: any, s: any) =>
            s.id > max.id ? s : max
        );

        // Schritt 3: Studiengangsabbildung-Referenz laden
        console.time("Abbildung laden");
        const abbildungListeDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
        console.timeEnd("Abbildung laden");
        const abbildungRef = abbildungListeDaten?.data?.[0];
        if (!abbildungRef) {
            return Response.json({ error: "Keine Studiengangsabbildung gefunden" }, { status: 404 });
        }

        // Schritt 4: Studiengangsabbildung Detail laden
        // Enthält modullisteList mit allen zugehörigen Modullisten-IDs —
        // dadurch können wir direkt /modulliste/{id} aufrufen statt
        // alle 4MB von /modulliste zu laden und lokal zu filtern
        console.time("Abbildung Detail laden");
        const abbildungDetailDaten = await fetchMoses(`/studiengangsabbildung/${abbildungRef.id}`);
        console.timeEnd("Abbildung Detail laden");
        const abbildungDetail = abbildungDetailDaten?.data?.[0];
        if (!abbildungDetail) {
            return Response.json({ error: "Abbildung Detail nicht gefunden" }, { status: 404 });
        }

        // Schritt 5: Aktuellste Modulliste direkt laden
        // Aktuellste = höchste ID in modullisteList
        console.time("Modulliste laden");
        const modullisteIds: { id: number }[] = abbildungDetail.modullisteList ?? [];
        if (modullisteIds.length === 0) {
            return Response.json({
                error: "Keine Modullisten gefunden — dieser Studiengang ist in der Demo-API nicht vollständig hinterlegt."
            }, { status: 404 });
        }

        const neuesteModullisteId = modullisteIds.reduce(
            (max, ml) => ml.id > max.id ? ml : max
        ).id;

        const modullisteDaten = await fetchMoses(`/modulliste/${neuesteModullisteId}`);
        console.timeEnd("Modulliste laden");

        const aktuelleModulliste = modullisteDaten?.data?.[0];
        if (!aktuelleModulliste) {
            return Response.json({ error: "Modulliste konnte nicht geladen werden" }, { status: 404 });
        }

        const zuordnungen = aktuelleModulliste.studiengangszuordnungList ?? [];
        if (zuordnungen.length === 0) {
            return Response.json({ error: "Keine Module in dieser Modulliste" }, { status: 404 });
        }

        // Schritt 6: Module parallel laden in 30er-Batches
        // Innerhalb jedes Batches werden alle Module gleichzeitig geladen (Promise.all)
        // Zusätzlich lädt ladeModulDetails() intern bolognamodul/beschreibung/bereichPfad parallel
        // Ergebnis: 253 Module in ~600ms statt ~40s sequenziell
        console.time("Module laden gesamt");
        const BATCH_SIZE = 30;
        const moduleRoh: any[] = [];

        for (let i = 0; i < zuordnungen.length; i += BATCH_SIZE) {
            const batch = zuordnungen.slice(i, i + BATCH_SIZE);
            const batchErgebnisse = await Promise.all(
                batch.map((z: any) => ladeModulDetails(z))
            );
            moduleRoh.push(...batchErgebnisse.filter(Boolean));
            console.log(
                `Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(zuordnungen.length / BATCH_SIZE)} fertig` +
                ` — ${moduleRoh.length} Module geladen`
            );
        }

        console.timeEnd("Module laden gesamt");

        return Response.json({
            studiengang: studiengang.name,
            semester: aktuelleModulliste.semester?.name,
            stupo: neuesteStupo.name,
            anzahl: moduleRoh.length,
            module: moduleRoh
        });

    } catch (error: any) {
        return Response.json({
            error: "Interner Fehler",
            details: error.message
        }, { status: 500 });
    }
}