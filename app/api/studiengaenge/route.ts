export async function GET() {
    const response = await fetch(
        "https://demo.moses.tu-berlin.de/moses/api/v1/studiengang",
        {
            headers: {
                "accept": "application/json",
                "x-api-key": process.env.MOSES_API_KEY || ""
            }
        }
    );

    const daten = await response.json();

    // Nur sichtbare Studiengänge filtern
    const studiengaenge = daten.data.filter(
        (s: any) => s.visible === true
    );

    return Response.json(studiengaenge);
}