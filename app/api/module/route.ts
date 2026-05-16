const BASE_URL = "https://demo.moses.tu-berlin.de/moses/api/v1";
const HEADERS = {
    "accept": "application/json",
    "x-api-key": process.env.MOSES_API_KEY || ""
};

async function fetchMoses(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, { headers: HEADERS });
    return res.json();
}

async function getBereichPfad(bereichId: number): Promise<string[]> {
    const data = await fetchMoses(`/studiengangsbereich/${bereichId}`);
    const bereich = data.data?.[0];

    if (!bereich) return [];

    if (bereich.parent?.id) {
        const elternPfad = await getBereichPfad(bereich.parent.id);
        return [...elternPfad, bereich.name];
    }

    return [bereich.name];
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studiengangId = searchParams.get("studiengangId");

        if (!studiengangId) {
            return Response.json({ error: "studiengangId fehlt" }, { status: 400 });
        }

        const studiengangDaten = await fetchMoses(`/studiengang/${studiengangId}`);
        const studiengang = studiengangDaten.data?.[0];

        if (!studiengang) {
            return Response.json({ error: "Studiengang nicht gefunden" }, { status: 404 });
        }

        const neuesteStupo = studiengang.stupoList.reduce((max: any, s: any) =>
            s.id > max.id ? s : max
        );

        const abbildungDaten = await fetchMoses(`/studiengangsabbildung?stupoId=${neuesteStupo.id}`);
        const abbildung = abbildungDaten.data?.[0];

        if (!abbildung) {
            return Response.json({ error: "Keine Studiengangsabbildung gefunden" }, { status: 404 });
        }

        const ersteSeite = await fetchMoses(`/modulliste?pageSize=1000`);
        const totalPages = ersteSeite.totalPages;
        let alleModullisten = [...ersteSeite.data];

        for (let page = 2; page <= totalPages; page++) {
            const seite = await fetchMoses(`/modulliste?pageSize=1000&page=${page}`);
            alleModullisten = [...alleModullisten, ...seite.data];
        }

        const gefilterteModullisten = alleModullisten.filter((ml: any) =>
            ml.studiengangsabbildung?.id === abbildung.id
        );

        if (gefilterteModullisten.length === 0) {
            return Response.json({
                error: "Keine Modulliste gefunden — dieser Studiengang ist in der Demo-API nicht vollständig hinterlegt."
            }, { status: 404 });
        }

        const aktuelleModulliste = gefilterteModullisten.reduce((max: any, ml: any) =>
            (ml.semester?.id || 0) > (max.semester?.id || 0) ? ml : max
        );

        const zuordnungen = aktuelleModulliste.studiengangszuordnungList || [];

        if (zuordnungen.length === 0) {
            return Response.json({ error: "Keine Module in dieser Modulliste" }, { status: 404 });
        }

        const module = [];
        for (const z of zuordnungen) {
            const zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${z.id}`);
            const zuordnung = zuordnungRaw.data?.[0];

            const versionRaw = await fetchMoses(`/bolognamodulversion/${zuordnung?.bolognamodulVersion?.id}`);
            const version = versionRaw.data?.[0];

            const bolognamodulRaw = await fetchMoses(`/bolognamodul/${version?.bolognamodul?.id}`);
            const bolognamodul = bolognamodulRaw.data?.[0];

            const beschreibungId = version?.bolognamodulBeschreibung?.id;
            const beschreibungRaw = beschreibungId
                ? await fetchMoses(`/bolognamodulbeschreibung/${beschreibungId}`)
                : null;
            const beschreibung = beschreibungRaw?.data?.[0];

            const bereichId = zuordnung?.studiengangsbereich?.id;
            const bereichPfad = bereichId ? await getBereichPfad(bereichId) : [];

            module.push({
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