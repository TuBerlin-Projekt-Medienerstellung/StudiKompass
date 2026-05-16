const BASE_URL = "https://demo.moses.tu-berlin.de/moses/api/v1";
const HEADERS = {
    "accept": "application/json",
    "x-api-key": process.env.MOSES_API_KEY || ""
};

async function fetchMoses(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, { headers: HEADERS });
    return res.json();
}

function buildBereichBaum(bereiche: any[], wahlregeln: any[], parentId: number | null = null): any[] {
    return bereiche
        .filter((b: any) => (b.parent?.id ?? null) === parentId)
        .map((b: any) => ({
            id: b.id,
            name: b.name,
            wahlregeln: wahlregeln
                .filter((r: any) => r.studiengangsbereich?.id === b.id)
                .map((r: any) => ({
                    typ: r.wahlregeltyp,
                    ...(r.wert !== undefined && { wert: r.wert })
                })),
            kinder: buildBereichBaum(bereiche, wahlregeln, b.id)
        }));
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

        // Bereiche laden
        const ersteBereichSeite = await fetchMoses(`/studiengangsbereich?pageSize=1000`);
        const bereichTotalPages = ersteBereichSeite.totalPages ?? 1;
        let alleBereiche = Array.isArray(ersteBereichSeite.data) ? [...ersteBereichSeite.data] : [];

        for (let page = 2; page <= bereichTotalPages; page++) {
            const seite = await fetchMoses(`/studiengangsbereich?pageSize=1000&page=${page}`);
            if (Array.isArray(seite.data)) {
                alleBereiche = [...alleBereiche, ...seite.data];
            }
        }

        const gefilterteBereiche = alleBereiche.filter((b: any) =>
            b.studiengangsabbildung?.id === abbildung.id
        );

        if (gefilterteBereiche.length === 0) {
            return Response.json({
                error: "Keine Bereiche gefunden — dieser Studiengang ist in der Demo-API nicht vollständig hinterlegt."
            }, { status: 404 });
        }

        // Wahlregeln laden
        const ersteRegelSeite = await fetchMoses(`/studiengangsbereichwahlregel?pageSize=1000`);
        const regelTotalPages = ersteRegelSeite.totalPages ?? 1;
        let alleWahlregeln = Array.isArray(ersteRegelSeite.data) ? [...ersteRegelSeite.data] : [];

        for (let page = 2; page <= regelTotalPages; page++) {
            const seite = await fetchMoses(`/studiengangsbereichwahlregel?pageSize=1000&page=${page}`);
            if (Array.isArray(seite.data)) {
                alleWahlregeln = [...alleWahlregeln, ...seite.data];
            }
        }

        // Nur Wahlregeln filtern deren Bereich zu diesem Studiengang gehört
        const bereichIds = new Set(gefilterteBereiche.map((b: any) => b.id));
        const gefilterteWahlregeln = alleWahlregeln.filter((r: any) =>
            bereichIds.has(r.studiengangsbereich?.id)
        );

        const baum = buildBereichBaum(gefilterteBereiche, gefilterteWahlregeln);

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