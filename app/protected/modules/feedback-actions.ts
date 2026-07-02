"use server";
import {createClient} from "@/lib/supabase/server";
import {initialenAusName} from "@/components/ui/feedback-utlis";

// Zeile aus der Supabase-Tabelle "bewertung".
// Spalten-Zuordnung: 01=Dozent, 02=Vorlesung, 03=Tutorium, 04=Aufwand, 05=Organisation
interface BewertungRow {
    id: string;
    user_id: string;
    modul_id: string;
    sterne_kategorie01: number | null;
    sterne_kategorie02: number | null;
    sterne_kategorie03: number | null;
    sterne_kategorie04: number | null;
    sterne_kategorie05: number | null;
    kommentar: string | null;
    semester: string | null;
    created_at: string;
}

function zuBewertung(row: BewertungRow, name: string, istEigene: boolean): Bewertung {
    const kategorien: KategorieBewertung = {
        dozent: Number(row.sterne_kategorie01 ?? 0),
        vorlesung: Number(row.sterne_kategorie02 ?? 0),
        tutorium: Number(row.sterne_kategorie03 ?? 0),
        aufwand: Number(row.sterne_kategorie04 ?? 0),
        organisation: Number(row.sterne_kategorie05 ?? 0),
    };
    const werte = Object.values(kategorien);
    const erstellt = new Date(row.created_at);

    return {
        id: row.id,
        name,
        initialen: initialenAusName(name),
        semester: row.semester ?? "",
        datum: erstellt.toLocaleDateString("de-DE", {day: "2-digit", month: "short", year: "numeric"}),
        datumSort: erstellt.getTime(),
        kategorien,
        gesamtScore: werte.reduce((summe, w) => summe + w, 0) / werte.length,
        kommentar: row.kommentar ?? "",
        hilfreich: 0,
        antworten: 0,
        istEigene,
    };
}

export async function ladeBewertungenAction(modulId: string): Promise<Bewertung[]> {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return [];

    const {data, error} = await supabase
        .from("bewertung")
        .select("*")
        .eq("modul_id", modulId)
        .order("created_at", {ascending: false});

    if (error) {
        console.error("Fehler beim Laden der Bewertungen:", error);
        throw error;
    }

    const rows = (data ?? []) as BewertungRow[];
    if (rows.length === 0) return [];

    // Usernamen der Bewertenden nachladen (kein direkter FK bewertung -> profiles,
    // daher zweite Abfrage statt Join)
    const userIds = [...new Set(rows.map((row) => row.user_id))];
    const {data: profiles} = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

    const namen = new Map<string, string>(
        (profiles ?? []).map((p: { id: string; username: string | null }) => [p.id, p.username ?? "Anonym"])
    );

    return rows.map((row) => zuBewertung(row, namen.get(row.user_id) ?? "Anonym", row.user_id === user.id));
}

export async function erstelleBewertungAction(
    modulId: string,
    kategorien: KategorieBewertung,
    semester: string,
    kommentar: string
): Promise<Bewertung | null> {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const {data, error} = await supabase
        .from("bewertung")
        .insert({
            user_id: user.id,
            modul_id: modulId,
            sterne_kategorie01: kategorien.dozent,
            sterne_kategorie02: kategorien.vorlesung,
            sterne_kategorie03: kategorien.tutorium,
            sterne_kategorie04: kategorien.aufwand,
            sterne_kategorie05: kategorien.organisation,
            semester,
            kommentar,
        })
        .select()
        .single();

    if (error) {
        console.error("Fehler beim Speichern der Bewertung:", error);
        throw error;
    }

    const {data: profile} = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

    return zuBewertung(data as BewertungRow, profile?.username ?? "Anonym", true);
}

export async function loescheBewertungAction(bewertungId: string): Promise<void> {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return;

    // eq("user_id", user.id) zusätzlich zur RLS-Policy: es darf nur die eigene Bewertung sein
    const {error} = await supabase
        .from("bewertung")
        .delete()
        .eq("id", bewertungId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Fehler beim Löschen der Bewertung:", error);
        throw error;
    }
}
