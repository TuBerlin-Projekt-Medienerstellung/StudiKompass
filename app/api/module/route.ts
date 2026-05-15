// Basis-URL der MOSES Demo-API der TU Berlin
const BASE_URL = "https://demo.moses.tu-berlin.de/moses/api/v1";

// Standard-Header für alle API-Anfragen
const HEADERS = {
    "accept": "application/json",
    "x-api-key": process.env.MOSES_API_KEY || ""
};

// Hilfsfunktion für API-Anfragen an MOSES
async function fetchMoses(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, { headers: HEADERS });
    return res.json();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studiengangId = searchParams.get("studiengangId");

        // Pflichtparameter prüfen
        if (!studiengangId) {
            return Response.json({ error: "studiengangId fehlt" }, { status: 400 });
        }

        // 1. Studiengang abrufen und neueste StuPO ermitteln
        // Die neueste StuPO hat die höchste ID
        const studiengangDaten = await fetchMoses(`/studiengang/${studiengangId}`);
        const studiengang = studiengangDaten.data?.[0];

        if (!studiengang) {
            return Response.json({ error: "Studiengang nicht gefunden" }, { status: 404 });
        }

        const neuesteStupo = studiengang.stupoList.reduce((max: any, s: any) =>
            s.id > max.id ? s : max
        );

        // 2. Studiengangsabbildung abrufen
        // Verbindet die StuPO mit den zugehörigen Modullisten
        const abbildungDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
        const abbildung = abbildungDaten.data?.[0];

        if (!abbildung) {
            return Response.json({ error: "Keine Studiengangsabbildung gefunden" }, { status: 404 });
        }

        // 3. Alle Modullisten seitenweise abrufen und nach Studiengangsabbildung filtern
        // pageSize=1000 um sicherzustellen dass alle Seiten abgerufen werden
        const ersteSeite = await fetchMoses(`/modulliste?pageSize=1000`);
        const totalPages = ersteSeite.totalPages;
        let alleModullisten = [...ersteSeite.data];

        for (let page = 2; page <= totalPages; page++) {
            const seite = await fetchMoses(`/modulliste?pageSize=1000&page=${page}`);
            alleModullisten = [...alleModullisten, ...seite.data];
        }

        // Nur Modullisten die zur aktuellen Studiengangsabbildung gehören
        const gefilterteModullisten = alleModullisten.filter((ml: any) =>
            ml.studiengangsabbildung?.id === abbildung.id
        );

        if (gefilterteModullisten.length === 0) {
            return Response.json({
                error: "Keine Modulliste gefunden — dieser Studiengang ist in der Demo-API nicht vollständig hinterlegt. In der echten MOSES API sollte dies funktionieren."
            }, { status: 404 });
        }

        // 4. Neueste Modulliste nehmen (höchste Semester-ID)
        const aktuelleModulliste = gefilterteModullisten.reduce((max: any, ml: any) =>
            (ml.semester?.id || 0) > (max.semester?.id || 0) ? ml : max
        );

        const zuordnungen = aktuelleModulliste.studiengangszuordnungList || [];

        if (zuordnungen.length === 0) {
            return Response.json({ error: "Keine Module in dieser Modulliste" }, { status: 404 });
        }

        // 5. Für jede Zuordnung die vollständigen Moduldaten abrufen
        // Ein Modul kann mehrfach erscheinen wenn es in mehreren Studienbereichen wählbar ist
        // In diesem Fall ist die Kombination aus id + kategorie eindeutig, nicht die id allein
        const module = [];
        for (const z of zuordnungen) {
            // Vollständige Zuordnungsdaten abrufen
            const zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${z.id}`);
            const zuordnung = zuordnungRaw.data?.[0];

            // bolognamodulversion abrufen um die bolognamodul-ID zu bekommen
            const versionRaw = await fetchMoses(`/bolognamodulversion/${zuordnung?.bolognamodulVersion?.id}`);
            const version = versionRaw.data?.[0];

            // bolognamodul abrufen um die korrekte Nummer für die MOSES-URL zu bekommen
            // Die "number" ist die offizielle Modulnummer die in der MOSES-URL verwendet wird
            const bolognamodulRaw = await fetchMoses(`/bolognamodul/${version?.bolognamodul?.id}`);
            const bolognamodul = bolognamodulRaw.data?.[0];

            module.push({
                id: zuordnung?.bolognamodulVersion?.id,
                name: zuordnung?.name,
                // Studiengangsbereich z.B. "Pflichtmodule", "Wahlpflichtmodule", "Mathematische Grundlagen"
                kategorie: zuordnung?.studiengangsbereich?.name,
                // Leistungspunkte (ECTS)
                lp: zuordnung?.modullp,
                pruefungsform: zuordnung?.bolognamodulPruefungsform?.name,
                turnus: zuordnung?.makroturnus?.name,
                // Link zur offiziellen MOSES-Modulseite mit der korrekten Modulnummer
                mosesUrl: `https://moseskonto.tu-berlin.de/moses/modultransfersystem/bolognamodule/beschreibung/anzeigen.html?nummer=${bolognamodul?.number}`
            });
        }

        return Response.json({
            studiengang: studiengang.name,
            semester: aktuelleModulliste.semester?.name,
            stupo: neuesteStupo.name,
            anzahl: module.length,
            module
        });

    } catch (error: any) {
        return Response.json({
            error: "Interner Fehler",
            details: error.message
        }, { status: 500 });
    }
}