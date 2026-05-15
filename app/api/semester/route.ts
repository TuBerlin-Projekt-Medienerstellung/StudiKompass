export async function GET() {
    const response = await fetch(
        "https://demo.moses.tu-berlin.de/moses/api/v1/semester?pageSize=1000",
        {
            headers: {
                "accept": "application/json",
                "x-api-key": process.env.MOSES_API_KEY || ""
            }
        }
    );
    const daten = await response.json();
    const alleSemester = daten.data;
    const aktuellesDatum = new Date();

    const gestartete = alleSemester.filter((s: any) =>
        s.startDate && new Date(s.startDate) <= aktuellesDatum
    );

    const aktuellesSemester = gestartete.reduce((max: any, s: any) =>
        new Date(s.startDate) > new Date(max.startDate) ? s : max
    );

    return Response.json(aktuellesSemester);
}