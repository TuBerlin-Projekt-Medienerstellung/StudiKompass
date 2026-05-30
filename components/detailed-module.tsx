import { createClient } from "@/lib/supabase/server";
import ModulCard from "./modul-card"; 

interface Props {
    modul_id: number;
    name: string;
    leistungspunkte: number;
    semester?: string;
    modulArt?: string;
    link?: string;
}

export default async function DetailedModule({ modul_id, name, leistungspunkte, semester, modulArt, link }: Props){
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const baseUrl = process.env.moses_API_URL;
    const headers: HeadersInit = process.env.moses_API_KEY
        ? { 'x-api-key': process.env.moses_API_KEY }
        : {};

    // außerhalb vom try definieren damit return es sehen kann
    let details = {
        lehrinhalte: "",
        lernergebnisse: "",
        voraussetzungen: "",
        lehrlernformen: "",
        pruefungsform: "",
        benotet: false,
        pruefungsBeschreibung: "",
        pruefungselemente: [] as string[],
        anmeldeformalitaetenDE: "",
    }

    try {
        if (baseUrl) {
            const [beschreibungResponse, pruefungResponse] = await Promise.all([
                fetch(`${baseUrl}/bolognamodulbeschreibung/${modul_id}`, { headers, next: { revalidate: 86400 } }),
                fetch(`${baseUrl}/bolognamodulpruefung/${modul_id}`,     { headers, next: { revalidate: 86400 } }),
            ]);

            const [beschreibungData, pruefungData] = await Promise.all([
                beschreibungResponse.json(),
                pruefungResponse.json(),
            ]);

            const beschreibung = beschreibungData?.data?.[0];
            const pruefung = pruefungData?.data?.[0];

            details = {
                lehrinhalte: beschreibung?.lehrinhalteDE,
                lernergebnisse: beschreibung?.lernergebnisseDE,
                voraussetzungen: beschreibung?.lehrveranstaltungsvoraussetzungenDE,
                lehrlernformen: beschreibung?.lehrlernformenDE,
                pruefungsform: pruefung?.pruefungsform?.name,
                benotet: pruefung?.benotet,
                pruefungsBeschreibung: pruefung?.beschreibungDE,
                pruefungselemente: pruefung?.pruefungselementList?.map((p: {name:string}) => p.name) ?? [],
                anmeldeformalitaetenDE: pruefung?.anmeldeformalitaetenDE,
            }
        }
    } catch (e) {
        console.error("Ein Problem ist beim Fetch aufgetreten:", e)
    }

    return (
        <ModulCard {...details}
        modul_id={modul_id}
        name={name}
        leistungspunkte={leistungspunkte}
        semester={semester ?? "—"}
        modulArt={modulArt ?? "—"}
        link={link ?? "#"} /> 
    )
}