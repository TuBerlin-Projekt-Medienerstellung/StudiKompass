import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.moses_API_URL;
const headers: HeadersInit = process.env.moses_API_KEY
    ? { 'x-api-key': process.env.moses_API_KEY }
    : {};

export async function GET(req: NextRequest, { params }: { params: { modul_id: string } }) {
    const { modul_id } = await params;
    // console.log("BASE_URL:", BASE_URL)
    // console.log("API_KEY vorhanden:", !!process.env.moses_API_KEY)
    // console.log("Fetching ID:", modul_id)
    // console.log("Fetching ID:", modul_id)
    const [beschreibungRes, pruefungRes] = await Promise.all([
        fetch(`${BASE_URL}/bolognamodulbeschreibung/${modul_id}`, { headers, next: { revalidate: 86400 } }),
        fetch(`${BASE_URL}/bolognamodulpruefung/${modul_id}`,     { headers, next: { revalidate: 86400 } }),
    ]);

    const [beschreibungData, pruefungData] = await Promise.all([
        beschreibungRes.json(),
        pruefungRes.json(),
    ]);

    const beschreibung = beschreibungData?.data?.[0];
    const pruefung = pruefungData?.data?.[0];

    return NextResponse.json({
                lehrinhalte: beschreibung?.lehrinhalteDE,
                lernergebnisse: beschreibung?.lernergebnisseDE,
                voraussetzungen: beschreibung?.lehrveranstaltungsvoraussetzungenDE,
                lehrlernformen: beschreibung?.lehrlernformenDE,
                pruefungsform: pruefung?.pruefungsform?.name,
                benotet: pruefung?.benotet,
                pruefungsBeschreibung: pruefung?.beschreibungDE,
                pruefungselemente: pruefung?.pruefungselementList?.map((p: any) => p.name),
                anmeldeformalitaetenDE: pruefung?.anmeldeformalitaetenDE,
    });
}