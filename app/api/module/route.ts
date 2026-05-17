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

// Hilfsfunktion: Gibt den vollständigen Bereichspfad eines Studiengangsbereichs zurück
// Beispiel-Output: ["Wahlpflichtmodule", "Schwerpunktmodule", "Methodenorientierung", "Mechanik"]
// Die Funktion arbeitet rekursiv: Sie klettert den Eltern-Baum hoch bis sie den Root-Bereich erreicht
async function getBereichPfad(bereichId: number): Promise<string[]> {
    const data = await fetchMoses(`/studiengangsbereich/${bereichId}`);
    const bereich = data.data?.[0];

    // Bereich nicht gefunden → leerer Pfad
    if (!bereich) return [];

    // Wenn ein Elternbereich existiert, rekursiv den Elternpfad holen und aktuellen Bereich anhängen
    if (bereich.parent?.id) {
        const elternPfad = await getBereichPfad(bereich.parent.id);
        return [...elternPfad, bereich.name];
    }

    // Root-Bereich erreicht (kein Elternteil) → Pfad beginnt hier
    return [bereich.name];
}

// Haupt-Handler: Wird aufgerufen wenn jemand GET /api/module?studiengangId=... aufruft
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

        // Schritt 3: Studiengangsabbildung laden (verknüpft StuPO mit Modulen und Bereichen)
        const abbildungDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
        const abbildung = abbildungDaten.data?.[0];

        if (!abbildung) {
            return Response.json({ error: "Keine Studiengangsabbildung gefunden" }, { status: 404 });
        }

        // Schritt 4: Alle Modullisten über alle Seiten hinweg laden
        // (Die API gibt Daten seitenweise zurück, daher müssen alle Seiten einzeln abgerufen werden)
        const ersteSeite = await fetchMoses(`/modulliste?pageSize=1000`);
        const totalPages = ersteSeite.totalPages;
        let alleModullisten = [...ersteSeite.data];

        for (let page = 2; page <= totalPages; page++) {
            const seite = await fetchMoses(`/modulliste?pageSize=1000&page=${page}`);
            alleModullisten = [...alleModullisten, ...seite.data];
        }

        // Schritt 5: Nur die Modullisten filtern, die zur aktuellen Studiengangsabbildung gehören
        const gefilterteModullisten = alleModullisten.filter((ml: any) =>
            ml.studiengangsabbildung?.id === abbildung.id
        );

        if (gefilterteModullisten.length === 0) {
            return Response.json({
                error: "Keine Modulliste gefunden — dieser Studiengang ist in der Demo-API nicht vollständig hinterlegt."
            }, { status: 404 });
        }

        // Schritt 6: Aktuellste Modulliste auswählen (höchste Semester-ID = neuestes Semester)
        const aktuelleModulliste = gefilterteModullisten.reduce((max: any, ml: any) =>
            (ml.semester?.id || 0) > (max.semester?.id || 0) ? ml : max
        );

        // Liste aller Modulzuordnungen aus der aktuellen Modulliste
        const zuordnungen = aktuelleModulliste.studiengangszuordnungList || [];

        if (zuordnungen.length === 0) {
            return Response.json({ error: "Keine Module in dieser Modulliste" }, { status: 404 });
        }

        // Schritt 7: Für jede Modulzuordnung die vollständigen Moduldetails laden
        const module = [];
        for (const z of zuordnungen) {

            // 7a: Vollständige Zuordnungsdetails laden (enthält Name, ECTS, Prüfungsform etc.)
            const zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${z.id}`);
            const zuordnung = zuordnungRaw.data?.[0];

            // 7b: Modulversion laden (wird benötigt um zur Modulbeschreibung zu gelangen)
            const versionRaw = await fetchMoses(`/bolognamodulversion/${zuordnung?.bolognamodulVersion?.id}`);
            const version = versionRaw.data?.[0];

            // 7c: bolognamodul laden (enthält das Feld "number" für die korrekte MOSES-URL)
            const bolognamodulRaw = await fetchMoses(`/bolognamodul/${version?.bolognamodul?.id}`);
            const bolognamodul = bolognamodulRaw.data?.[0];

            // 7d: Modulbeschreibung laden (enthält Lernergebnisse, Lehrinhalte, Voraussetzungen)
            const beschreibungId = version?.bolognamodulBeschreibung?.id;
            const beschreibungRaw = beschreibungId
                ? await fetchMoses(`/bolognamodulbeschreibung/${beschreibungId}`)
                : null;
            const beschreibung = beschreibungRaw?.data?.[0];

            // 7e: Bereichspfad rekursiv ermitteln (z.B. ["Wahlpflichtmodule", "Projekt"])
            const bereichId = zuordnung?.studiengangsbereich?.id;
            const bereichPfad = bereichId ? await getBereichPfad(bereichId) : [];

            // 7f: Alle gesammelten Informationen als Modulobjekt zusammenführen
            module.push({
                id: zuordnung?.bolognamodulVersion?.id,
                name: zuordnung?.name,
                bereichPfad,                          // Hierarchie des Studiengangsbereichs
                lp: zuordnung?.modullp,               // Leistungspunkte (ECTS)
                pruefungsform: zuordnung?.bolognamodulPruefungsform?.name,
                turnus: zuordnung?.makroturnus?.name, // z.B. "Wintersemester"
                lernergebnisse: beschreibung?.lernergebnisseDE ?? null,
                lehrinhalte: beschreibung?.lehrinhalteDE ?? null,
                voraussetzungen: beschreibung?.lehrveranstaltungsvoraussetzungenDE ?? null,
                // Die "number" aus dem bolognamodul ist die korrekte ID für die MOSES-URL
                mosesUrl: `https://moseskonto.tu-berlin.de/moses/modultransfersystem/bolognamodule/beschreibung/anzeigen.html?nummer=${bolognamodul?.number}`
            });
        }

        // Schritt 8: Ergebnis zurückgeben
        return Response.json({
            studiengang: studiengang.name,
            semester: aktuelleModulliste.semester?.name,
            stupo: neuesteStupo.name,
            anzahl: module.length,
            module
        });

    } catch (error: any) {
        // Unerwartete Fehler abfangen und als JSON zurückgeben
        return Response.json({
            error: "Interner Fehler",
            details: error.message
        }, { status: 500 });
    }
}