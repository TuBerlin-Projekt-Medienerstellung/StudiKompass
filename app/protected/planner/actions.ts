"use server";

import { createClient } from "@/lib/supabase/server";


//Semester aus Supabase laden
export async function getSemesters() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("semester")
        .select("*")
        .eq("user_id", user.id)
        .order("semesterzahl");

    if (error) throw error;

    return data;
}

//leeres Semester hinzufügen
export async function createSemester() {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;


    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("max_semester")
        .eq("id", user.id)
        .single();

    if (profileError) throw profileError;

    const nextSemester = (profile.max_semester ?? 0) + 1;

    const { data, error } = await supabase
        .from('profiles')
        .update({ max_semester: nextSemester })
        .eq("id", user.id)
        .select()
        .single();

    if (error) {
        console.error('Fehler beim Aktualisieren:', error)
        throw error
    }


    return data.max_semester;
}


//erstellt neue Zeile in Tabelle Semester
export async function updateSemesterTable(semesterzahl: number) {
    const supabase = await createClient();


    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("semester")
        .insert({
            name: semesterzahl + ". Semester",
            semesterzahl: semesterzahl,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}


//leeres Semester löschen
export async function deleteSemester() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;


    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("max_semester")
        .eq("id", user.id)
        .single();

    if (profileError) throw profileError;

    const { data, error } = await supabase
        .from('profiles')
        .update({ max_semester: profile.max_semester - 1 })
        .eq("id", user.id)
        .select()
        .single();

    if (error) {
        console.error('Fehler beim Löschen:', error)
        throw error
    }

    return data
}

export async function reduceSemesterTable(semesterzahl: number) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { error } = await supabase
        .from("semester")
        .delete()
        .eq("user_id", user.id)
        .eq("semesterzahl", semesterzahl);

    if (error) throw error;
}


//Holt die anzahl der Versuche eines bestimmten Moduls
export async function getTries(modulId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("module")
        .select("versuche")
        .eq("user_id", user.id)
        .eq("id", modulId)
        .maybeSingle();

    if (error) {
        console.error("Fehler beim Abrufen der Versuche:", error);
        return 0;
    }

    if (!data) {
        return 0;
    }

    if (data?.versuche <= 0) {
        throw new Error("Versuche dürfen nicht negativ sein.");
    }

    if (data?.versuche > 4) {
        throw new Error("Du hast maximal 4 Prüfungsversuche.");
    }

    return data?.versuche ?? 0;
}

// Speichert die Versuche nur, wenn das Modul bereits existiert
export async function saveTries(modulId: string, counter: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Du bist nicht eingeloggt." };

    const { data, error } = await supabase
        .from("module")
        .update({ versuche: counter })
        .eq("user_id", user.id)
        .eq("id", modulId)
        .select();

    if (error) {
        console.error("Datenbank-Fehler beim Update:", error);
        return { success: false, error: "Datenbankfehler aufgetreten." };
    }

    if (!data || data.length === 0) {
        return { success: false, error: "Modul nicht in deiner Planung gefunden." };
    }

    return { success: true };
}

// speichert die eingetragene Note und Gewichtung
export async function saveGrade(modulId: string, note: number, gewichtung: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Du bist nicht eingeloggt." };
    }

    const { data, error } = await supabase
        .from("module")
        .update({
            note: note,
            gewichtung: gewichtung ? 1 : 0
        })
        .eq("user_id", user.id)
        .eq("id", modulId)
        .select()

    if (error) {
        console.error("Datenbank-Fehler beim Update der Note:", error);
        return { success: false, error: "Datenbankfehler aufgetreten." };
    }

    if (!data || data.length === 0) {
        return { success: false, error: "Modul nicht in deiner Planung gefunden." };
    }

    return { success: true };
}

export async function deleteGrade(modulId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Du bist nicht eingeloggt." };

    const { data, error } = await supabase
        .from("module")
        .update({
            note: null,
        })
        .eq("user_id", user.id)
        .eq("id", modulId)
        .select()

    if (error) {
        console.error("Datenbank-Fehler beim Update der Note:", error);
        return { success: false, error: "Datenbankfehler aufgetreten." };
    }

    if (!data || data.length === 0) {
        return { success: false, error: "Modul nicht in deiner Planung gefunden." };
    }

    return { success: true };
}

// Speichert den Status eines Moduls: abgeschlossen true oder false
export async function saveStatus(modulId: string, isChecked: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Du bist nicht eingeloggt." };

    const { error } = await supabase
        .from("module")
        .update({ abgeschlossen: isChecked })
        .eq("user_id", user.id)
        .eq("id", modulId)
        .select();

    if (error) {
        console.error("Datenbank-Fehler beim Update:", error);
        return { success: false, error: "Datenbankfehler." };
    }

    return { success: true };
}

// Fügt ein Modul aus der Suche zu einem Semester im Planer hinzu.
// Schritt 1: Modul in die `module`-Tabelle schreiben.
// Schritt 2: Verknüpfung in die `planner`-Tabelle schreiben.
export async function moduleZuPlanerHinzufuegen(
    semesterId: string,          // die uuid der Semesterzeile (semester.id)
    modul: {
        moses_id: number;
        name: string;
        turnus: string;
        bereichpfad: string;
        ects: number;
        lernergebnisse: string;
        pruefungsform: string;
        benotet: boolean;
        voraussetzungen?: string;
        moseslink: string;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Du bist nicht eingeloggt." };

    // Arbeitsaufwand berechnen: ects * 30 Stunden pro Semester
    const arbeitsaufwand = (modul.ects ?? 0) * 30;

    // Schritt 1: Modul in die module-Tabelle einfügen
    const { data: modulData, error: modulError } = await supabase
        .from("module")
        .insert({
            moses_id: String(modul.moses_id),        // Spalte ist text
            name: modul.name,
            turnus: modul.turnus ?? "",
            bereichpfad: [modul.bereichpfad ?? ""],  // Spalte ist ein Array (_text)
            ects: modul.ects ?? 0,
            lernergebnisse: modul.lernergebnisse ?? "",
            pruefungsform: modul.pruefungsform ?? "",
            benotet: modul.benotet ?? false,
            voraussetzungen: modul.voraussetzungen ?? "",
            moseslink: modul.moseslink ?? "",
            arbeitsaufwand: arbeitsaufwand,
            user_id: user.id,
        })
        .select()
        .single();

    if (modulError) {
        console.error("Fehler beim Speichern des Moduls:", modulError);
        return { success: false, error: "Modul konnte nicht gespeichert werden." };
    }

    // Schritt 2: Verknüpfung in die planner-Tabelle einfügen
    const { error: plannerError } = await supabase
        .from("planner")
        .insert({
            group_id: semesterId,        // verweist auf semester.id
            modul_id: modulData.id,      // die neue uuid aus Schritt 1
            user_id: user.id,
        });

    if (plannerError) {
        console.error("Fehler beim Verknüpfen mit dem Semester:", plannerError);
        return { success: false, error: "Modul konnte dem Semester nicht zugeordnet werden." };
    }

    return { success: true, modulId: modulData.id };
}

// Lädt alle Semester des Nutzers samt der zugeordneten Module.
// Weg: semester → planner (Verknüpfung) → module
export async function getSemestersMitModulen() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Schritt 1: Alle Semester des Nutzers laden
    const { data: semesterData, error: semesterError } = await supabase
        .from("semester")
        .select("*")
        .eq("user_id", user.id)
        .order("semesterzahl");

    if (semesterError) {
        console.error("Fehler beim Laden der Semester:", semesterError);
        return [];
    }

    // Schritt 2: Für jedes Semester die verknüpften Module holen
    const semesterMitModulen = await Promise.all(
        (semesterData ?? []).map(async (sem) => {
            // Alle planner-Einträge dieses Semesters holen
            const { data: plannerEintraege, error: plannerError } = await supabase
                .from("planner")
                .select("modul_id")
                .eq("group_id", sem.id)
                .eq("user_id", user.id);

            if (plannerError || !plannerEintraege) {
                console.error("Fehler beim Laden der Verknüpfungen:", plannerError);
                return { ...sem, modules: [] };
            }

            // Die modul_ids aus den Verknüpfungen sammeln
            const modulIds = plannerEintraege.map((e) => e.modul_id);

            // Wenn keine Module da sind, leeres Array zurück
            if (modulIds.length === 0) {
                return { ...sem, modules: [] };
            }

            // Schritt 3: Die eigentlichen Moduldaten holen
            const { data: moduleData, error: moduleError } = await supabase
                .from("module")
                .select("*")
                .in("id", modulIds);

            if (moduleError || !moduleData) {
                console.error("Fehler beim Laden der Module:", moduleError);
                return { ...sem, modules: [] };
            }

            return { ...sem, modules: moduleData };
        })
    );

    return semesterMitModulen;
}

// Verschiebt ein Modul in ein anderes Semester.
// Aktualisiert die group_id des planner-Eintrags auf das neue Semester.
export async function verschiebeModul(modulId: string, neueSemesterId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Du bist nicht eingeloggt." };

    const { data, error } = await supabase
        .from("planner")
        .update({ group_id: neueSemesterId })
        .eq("modul_id", modulId)
        .eq("user_id", user.id)
        .select();

    if (error) {
        console.error("Fehler beim Verschieben des Moduls:", error);
        return { success: false, error: "Modul konnte nicht verschoben werden." };
    }

    if (!data || data.length === 0) {
        return { success: false, error: "Verknüpfung nicht gefunden." };
    }

    return { success: true };
}

// Löscht ein Modul aus dem Planer (und via cascade auch die planner-Verknüpfung)
export async function loescheModul(modulId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Du bist nicht eingeloggt." };

    const { error } = await supabase
        .from("module")
        .delete()
        .eq("id", modulId)
        .eq("user_id", user.id);   // Sicherheit: nur eigene Module

    if (error) {
        console.error("Fehler beim Löschen des Moduls:", error);
        return { success: false, error: "Modul konnte nicht gelöscht werden." };
    }

    return { success: true };
}