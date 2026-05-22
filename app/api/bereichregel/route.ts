/**
 * MOSES API Route — /api/bereichregel
 *
 * Lädt den vollständigen Bereichsbaum mit Wahlregeln eines Studiengangs
 * von der MOSES Demo-API der TU Berlin.
 *
 * @endpoint GET /api/bereichregel?studiengangId={id}
 * @param studiengangId - Die MOSES-ID des Studiengangs (z.B. 37 = Maschinenbau B.Sc., 83 = Maschinenbau M.Sc.)
 *
 * @returns {Object} JSON mit folgendem Shape:
 * {
 *   studiengang: string,       // Name des Studiengangs
 *   stupo: string,             // Name der neuesten Studienprüfungsordnung
 *   bereiche: Bereich[]        // Verschachtelter Bereichsbaum (siehe Bereich-Shape unten)
 * }
 *
 * @example
 * fetch('/api/bereichregel?studiengangId=37')
 *
 * Bereich-Shape (rekursiv verschachtelt):
 * {
 *   id: number,
 *   name: string,              // z.B. "Pflichtbereich", "Wahlpflichtbereich"
 *   wahlregeln: Wahlregel[],   // Regeln die für diesen Bereich gelten
 *   kinder: Bereich[]          // Untergeordnete Bereiche (rekursiv)
 * }
 *
 * Wahlregel-Shape:
 * {
 *   typ: string,               // z.B. "BESTEHE_ALLE", "MIN_LP", "MAX_LP"
 *   wert?: number              // Nur bei MIN_LP / MAX_LP vorhanden
 * }
 *
 * DEMO-API LIMITATION:
 * Nur Maschinenbau B.Sc. (ID: 37) und M.Sc. (ID: 83) haben vollständige
 * Daten in der Demo-API.
 *
 * PERFORMANCE-OPTIMIERUNGEN (Entwicklungshistorie):
 *
 * Problem — Alles laden + lokal filtern (28 Sekunden):
 *   Ursprünglich wurden GET /studiengangsbereich (alle Bereiche aller Studiengänge)
 *   und GET /studiengangsbereichwahlregel (alle Wahlregeln aller Studiengänge)
 *   vollständig über alle Seiten geladen und dann lokal gefiltert.
 *
 *   Lösung:
 *   - Bereiche: GET /studiengangsabbildung/{id} enthält studiengangsbereichList
 *     mit allen IDs → nur relevante Bereiche parallel laden
 *   - Wahlregeln: GET /studiengangsbereichwahlregel?pageSize=1000 hat nur 1 Seite
 *     → einmalig laden, lokal nach bereichId filtern
 *   - /studiengangsbereichwahlregel/{id} funktioniert nicht in der Demo-API,
 *     daher kein einzelner Call pro Wahlregel möglich
 *
 *   Ergebnis: 28s → ~200ms
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
 * @param path - API-Pfad relativ zur BASE_URL, z.B. "/studiengangsbereich/868"
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
 * Lädt einen einzelnen Studiengangsbereich.
 * Wahlregeln werden NICHT hier geladen — sie werden einmalig
 * für alle Bereiche geladen und in buildBereichBaum zugeordnet.
 *
 * @param bereichId - ID des Studiengangsbereichs
 * @returns Bereich-Objekt mit parentId und wahlregelIds, oder null bei Fehler
 */
async function ladeBereichDetails(bereichId: number): Promise<any | null> {
    const bereichRaw = await fetchMoses(`/studiengangsbereich/${bereichId}`);
    const bereich = bereichRaw?.data?.[0];
    if (!bereich) return null;

    return {
        id: bereich.id,
        name: bereich.name,
        // parentId wird für buildBereichBaum benötigt um die Hierarchie aufzubauen
        parentId: bereich.parent?.id ?? null,
        // IDs merken für späteren lokalen Abgleich mit alleWahlregeln
        wahlregelIds: (bereich.studiengangswahlregelList ?? []).map((r: any) => r.id)
    };
}

/**
 * Baut einen verschachtelten Bereichsbaum aus einer flachen Liste von Bereichen
 * und ordnet jedem Bereich seine Wahlregeln aus der globalen Liste zu.
 *
 * @example
 * // Input (flach):
 * bereiche = [
 *   { id: 1, name: "Pflichtbereich", parentId: null, wahlregelIds: [5846] },
 *   { id: 2, name: "Mathematik", parentId: 1, wahlregelIds: [5842] }
 * ]
 * alleWahlregeln = [
 *   { id: 5846, studiengangsbereich: {...}, wahlregeltyp: "BESTEHE_ALLE" },
 *   { id: 5842, studiengangsbereich: {...}, wahlregeltyp: "MIN_LP", wert: 18 }
 * ]
 * // Output (verschachtelt):
 * [
 *   { id: 1, name: "Pflichtbereich", wahlregeln: [{ typ: "BESTEHE_ALLE" }], kinder: [
 *     { id: 2, name: "Mathematik", wahlregeln: [{ typ: "MIN_LP", wert: 18 }], kinder: [] }
 *   ]}
 * ]
 *
 * @param bereiche - Flache Liste aller Bereiche mit parentId und wahlregelIds
 * @param alleWahlregeln - Alle Wahlregeln (einmalig geladen)
 * @param parentId - ID des Elternbereichs (null = Root-Ebene)
 * @returns Verschachtelter Bereichsbaum
 */
function buildBereichBaum(bereiche: any[], alleWahlregeln: any[], parentId: number | null = null): any[] {
    return bereiche
        .filter((b) => b.parentId === parentId)
        .map((b) => ({
            id: b.id,
            name: b.name,
            wahlregeln: alleWahlregeln
                .filter((r: any) => b.wahlregelIds.includes(r.id))
                .map((r: any) => ({
                    typ: r.wahlregeltyp,
                    ...(r.wert !== undefined && { wert: r.wert })
                })),
            kinder: buildBereichBaum(bereiche, alleWahlregeln, b.id)
        }));
}

/**
 * GET /api/bereichregel?studiengangId={id}
 *
 * Haupthandler. Lädt den Bereichsbaum eines Studiengangs in 6 Schritten:
 *
 * 1. Studiengang laden → neueste StuPO ermitteln
 * 2. Studiengangsabbildung-Referenz laden (via stupoId)
 * 3. Studiengangsabbildung-Detail laden (enthält studiengangsbereichList)
 * 4. Wahlregeln einmalig laden (1 Seite, pageSize=1000)
 * 5. Alle Bereiche parallel laden
 * 6. Flache Liste in verschachtelten Baum umwandeln
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
        // Enthält studiengangsbereichList mit allen zugehörigen Bereich-IDs
        console.time("Abbildung Detail laden");
        const abbildungDetailDaten = await fetchMoses(`/studiengangsabbildung/${abbildungRef.id}`);
        console.timeEnd("Abbildung Detail laden");
        const abbildungDetail = abbildungDetailDaten?.data?.[0];
        if (!abbildungDetail) {
            return Response.json({ error: "Abbildung Detail nicht gefunden" }, { status: 404 });
        }

        const bereichIds: { id: number }[] = abbildungDetail.studiengangsbereichList ?? [];
        if (bereichIds.length === 0) {
            return Response.json({
                error: "Keine Bereiche gefunden — dieser Studiengang ist in der Demo-API nicht vollständig hinterlegt."
            }, { status: 404 });
        }

        // Schritt 5: Wahlregeln einmalig laden (pageSize=1000, nur 1 Seite)
        // Einzelne Calls via /studiengangsbereichwahlregel/{id} funktionieren
        // in der Demo-API nicht → einmalig alles laden und lokal filtern
        console.time("Wahlregeln laden");
        const wahlregelDaten = await fetchMoses(`/studiengangsbereichwahlregel?pageSize=1000`);
        const alleWahlregeln = wahlregelDaten?.data ?? [];
        console.timeEnd("Wahlregeln laden");

        // Schritt 6: Alle Bereiche parallel laden
        console.time("Bereiche laden");
        const bereiche = await Promise.all(
            bereichIds.map((b) => ladeBereichDetails(b.id))
        );
        console.timeEnd("Bereiche laden");

        const gueltigeBereiche = bereiche.filter(Boolean);

        // Schritt 7: Flache Liste in verschachtelten Baum umwandeln
        // Wahlregeln werden dabei lokal aus alleWahlregeln zugeordnet
        const baum = buildBereichBaum(gueltigeBereiche, alleWahlregeln);

        return Response.json({
            studiengang: studiengang.name,
            stupo: neuesteStupo.name,
            bereiche: baum
        });

    } catch (error: any) {
        return Response.json({
            error: "Interner Fehler",
            details: error.message
        }, { status: 500 });
    }
}