// Basis-URL der MOSES Demo-API
const BASE_URL = "https://demo.moses.tu-berlin.de/moses/api/v1";

// Standard-Header für alle API-Anfragen (Authentifizierung über API-Key aus .env.local)
const HEADERS = {
    "accept": "application/json",
    "x-api-key": process.env.MOSES_API_KEY || ""
};

// Hilfsfunktion: Sendet eine GET-Anfrage an die MOSES-API und gibt das JSON-Ergebnis zurück
async function fetchMoses(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, { headers: HEADERS });
    return res.json();
}

// Hilfsfunktion: Baut einen verschachtelten Bereichsbaum aus einer flachen Liste von Bereichen
// und ordnet jedem Bereich seine zugehörigen Wahlregeln zu.
//
// Beispiel-Output:
// {
//   id: 868, name: "Pflichtbereich",
//   wahlregeln: [{ typ: "BESTEHE_ALLE" }],
//   kinder: [
//     { id: 870, name: "Naturwissenschaftliche Grundlagen", wahlregeln: [...], kinder: [] }
//   ]
// }
//
// Die Funktion arbeitet rekursiv: Für jeden Bereich sucht sie alle Kinder (Bereiche deren
// parent.id mit der aktuellen id übereinstimmt) und ruft sich selbst für diese auf.
function buildBereichBaum(bereiche: any[], wahlregeln: any[], parentId: number | null = null): any[] {
    return bereiche
        // Nur Bereiche nehmen, deren Elternteil der aktuelle parentId ist
        // null = Root-Bereiche (oberste Ebene, kein Elternteil)
        .filter((b: any) => (b.parent?.id ?? null) === parentId)
        .map((b: any) => ({
            id: b.id,
            name: b.name,
            // Alle Wahlregeln die zu diesem Bereich gehören herausfiltern und vereinfachen
            wahlregeln: wahlregeln
                .filter((r: any) => r.studiengangsbereich?.id === b.id)
                .map((r: any) => ({
                    typ: r.wahlregeltyp,
                    // "wert" nur hinzufügen wenn vorhanden (z.B. bei MIN_LP oder MAX_LP)
                    ...(r.wert !== undefined && { wert: r.wert })
                })),
            // Rekursiv alle Kinder dieses Bereichs ermitteln
            kinder: buildBereichBaum(bereiche, wahlregeln, b.id)
        }));
}

// Haupt-Handler: Wird aufgerufen wenn jemand GET /api/bereichregel?studiengangId=... aufruft
export async function GET(request: Request) {
    try {
        // studiengangId aus den URL-Parametern lesen
        const { searchParams } = new URL(request.url);
        const studiengangId = searchParams.get("studiengangId");

        // Fehler wenn kein studiengangId angegeben wurde
        if (!studiengangId) {
            return Response.json({ error: "studiengangId fehlt" }, { status: 400 });
        }

        // Schritt 1: Studiengang laden
        const studiengangDaten = await fetchMoses(`/studiengang/${studiengangId}`);
        const studiengang = studiengangDaten.data?.[0];

        if (!studiengang) {
            return Response.json({ error: "Studiengang nicht gefunden" }, { status: 404 });
        }

        // Schritt 2: Neueste StuPO (Studien- und Prüfungsordnung) ermitteln
        // Die neueste StuPO hat die höchste ID
        const neuesteStupo = studiengang.stupoList.reduce((max: any, s: any) =>
            s.id > max.id ? s : max
        );

        // Schritt 3: Studiengangsabbildung laden (verknüpft StuPO mit Bereichen und Modulen)
        const abbildungDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
        const abbildung = abbildungDaten.data?.[0];

        if (!abbildung) {
            return Response.json({ error: "Keine Studiengangsabbildung gefunden" }, { status: 404 });
        }

        // Schritt 4: Alle Studiengangsbereiche über alle Seiten hinweg laden
        // (Die API gibt Daten seitenweise zurück, daher müssen alle Seiten einzeln abgerufen werden)
        const ersteBereichSeite = await fetchMoses(`/studiengangsbereich?pageSize=1000`);
        const bereichTotalPages = ersteBereichSeite.totalPages ?? 1;
        let alleBereiche = Array.isArray(ersteBereichSeite.data) ? [...ersteBereichSeite.data] : [];

        for (let page = 2; page <= bereichTotalPages; page++) {
            const seite = await fetchMoses(`/studiengangsbereich?pageSize=1000&page=${page}`);
            if (Array.isArray(seite.data)) {
                alleBereiche = [...alleBereiche, ...seite.data];
            }
        }

        // Schritt 5: Nur Bereiche filtern, die zur aktuellen Studiengangsabbildung gehören
        const gefilterteBereiche = alleBereiche.filter((b: any) =>
            b.studiengangsabbildung?.id === abbildung.id
        );

        if (gefilterteBereiche.length === 0) {
            return Response.json({
                error: "Keine Bereiche gefunden — dieser Studiengang ist in der Demo-API nicht vollständig hinterlegt."
            }, { status: 404 });
        }

        // Schritt 6: Alle Wahlregeln über alle Seiten hinweg laden
        // Hinweis: Der korrekte Endpunkt heißt "/studiengangsbereichwahlregel" (nicht "/studiengangswahlregel")
        const ersteRegelSeite = await fetchMoses(`/studiengangsbereichwahlregel?pageSize=1000`);
        const regelTotalPages = ersteRegelSeite.totalPages ?? 1;
        let alleWahlregeln = Array.isArray(ersteRegelSeite.data) ? [...ersteRegelSeite.data] : [];

        for (let page = 2; page <= regelTotalPages; page++) {
            const seite = await fetchMoses(`/studiengangsbereichwahlregel?pageSize=1000&page=${page}`);
            if (Array.isArray(seite.data)) {
                alleWahlregeln = [...alleWahlregeln, ...seite.data];
            }
        }

        // Schritt 7: Nur Wahlregeln behalten, deren Bereich zum aktuellen Studiengang gehört
        // (Die API gibt alle Wahlregeln aller Studiengänge zurück, daher muss gefiltert werden)
        const bereichIds = new Set(gefilterteBereiche.map((b: any) => b.id));
        const gefilterteWahlregeln = alleWahlregeln.filter((r: any) =>
            bereichIds.has(r.studiengangsbereich?.id)
        );

        // Schritt 8: Aus der flachen Bereichsliste einen verschachtelten Baum bauen
        // und die Wahlregeln jedem Bereich zuordnen
        const baum = buildBereichBaum(gefilterteBereiche, gefilterteWahlregeln);

        // Schritt 9: Ergebnis zurückgeben
        return Response.json({
            studiengang: studiengang.name,
            stupo: neuesteStupo.name,
            bereiche: baum
        });

    } catch (error: any) {
        // Unerwartete Fehler abfangen und als JSON zurückgeben
        return Response.json({
            error: "Interner Fehler",
            details: error.message
        }, { status: 500 });
    }
}