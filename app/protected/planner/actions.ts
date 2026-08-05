"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchMoses} from "@/app/protected/modules/actions";
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

    // current_semester MIT laden (für Regel 5 + Sonderfall)
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("max_semester, current_semester")
        .eq("id", user.id)
        .single();
    if (profileError) throw profileError;

    const nextSemester = (profile.max_semester ?? 0) + 1;

    // Sonderfall: war current 0 (alles leer), wird es beim ersten Hinzufügen 1.
    // Sonst bleibt current stehen (Regel 5).
    const aktuellesCurrent = profile.current_semester ?? 0;
    const neuerCurrentWert = aktuellesCurrent === 0 ? 1 : aktuellesCurrent;

    const { data, error } = await supabase
        .from('profiles')
        .update({
            max_semester: nextSemester,
            current_semester: neuerCurrentWert,   // NEU
        })
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
    const semester_id = crypto.randomUUID();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("semester")
        .insert({
            id: semester_id,
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

    // current_semester MIT laden (für Regel 3)
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("max_semester, current_semester")
        .eq("id", user.id)
        .single();
    if (profileError) throw profileError;

    const neuerMaxWert = Math.max(0, (profile.max_semester ?? 0) - 1);

    // Regel 3: current darf nie größer als max sein → zieht mit
    const aktuellesCurrent = profile.current_semester ?? 0;
    const neuerCurrentWert = aktuellesCurrent > neuerMaxWert
        ? neuerMaxWert
        : aktuellesCurrent;

    const { data, error } = await supabase
        .from('profiles')
        .update({
            max_semester: neuerMaxWert,
            current_semester: neuerCurrentWert,   // NEU
        })
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
    const { data: { user } } = await supabase.auth.getUser();
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

export async function saveGrade(modulId: string, note: number, gewichtung: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Du bist nicht eingeloggt." };
    }

    const { data, error } = await supabase
        .from("module")
        .update({
            note: note,
            gewichtung: gewichtung >= 0 ? gewichtung : 0,
        })
        .eq("user_id", user.id)
        .eq("id", modulId)
        .select();

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
        .select();

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
}//for new feature
export type ModuleType = "custom" | "basic" | "extended";
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
        module_type: ModuleType;
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
            module_type: modul.module_type,
        })
        .select()
        .single();

    if (modulError) {
        // Duplikat: Modul ist schon im Planer (Unique-Constraint unique_user_moses_modul)
        if (modulError.code === "23505") {
            return { success: false, error: "Dieses Modul ist bereits in deinem Planer." };
        }
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

// Löscht ein Semester samt aller darin liegenden Module.
// Reihenfolge: erst Module (planner-Einträge sterben via cascade), dann das Semester.
export async function loescheSemesterMitModulen(semesterId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Du bist nicht eingeloggt." };

    // Schritt 1: Alle Module dieses Semesters finden (über planner)
    const { data: plannerEintraege, error: ladeError } = await supabase
        .from("planner")
        .select("modul_id")
        .eq("group_id", semesterId)
        .eq("user_id", user.id);

    if (ladeError) {
        console.error("Fehler beim Laden der Modul-Verknüpfungen:", ladeError);
        return { success: false, error: "Module konnten nicht ermittelt werden." };
    }

    // Schritt 2: Diese Module aus der module-Tabelle löschen
    // (die planner-Einträge sterben dabei via cascade)
    const modulIds = (plannerEintraege ?? []).map((e) => e.modul_id);

    if (modulIds.length > 0) {
        const { error: modulError } = await supabase
            .from("module")
            .delete()
            .in("id", modulIds)
            .eq("user_id", user.id);

        if (modulError) {
            console.error("Fehler beim Löschen der Module:", modulError);
            return { success: false, error: "Module konnten nicht gelöscht werden." };
        }
    }

    // Schritt 3: Das Semester selbst löschen
    const { error: semesterError } = await supabase
        .from("semester")
        .delete()
        .eq("id", semesterId)
        .eq("user_id", user.id);

    if (semesterError) {
        console.error("Fehler beim Löschen des Semesters:", semesterError);
        return { success: false, error: "Semester konnte nicht gelöscht werden." };
    }

    return { success: true };
}

// Prüft ob ein Modul (per moses_id) im Planer ist — und in welchem Semester.
export async function findeModulImPlaner(
    mosesId: string
): Promise<{ imPlaner: boolean; semesterName: string | null }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { imPlaner: false, semesterName: null };

    // Schritt 1: Modul per moses_id finden
    const { data: modul, error: modulError } = await supabase
        .from("module")
        .select("id")
        .eq("user_id", user.id)
        .eq("moses_id", mosesId)
        .maybeSingle();

    if (modulError || !modul) {
        return { imPlaner: false, semesterName: null };
    }

    // Schritt 2: planner-Eintrag finden → group_id (das Semester)
    const { data: plannerEintrag, error: plannerError } = await supabase
        .from("planner")
        .select("group_id")
        .eq("modul_id", modul.id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (plannerError || !plannerEintrag) {
        // Modul existiert, aber keine Semester-Zuordnung → trotzdem "drin"
        return { imPlaner: true, semesterName: null };
    }

    // Schritt 3: Semester-Name holen
    const { data: semester, error: semesterError } = await supabase
        .from("semester")
        .select("name")
        .eq("id", plannerEintrag.group_id)
        .maybeSingle();

    if (semesterError || !semester) {
        return { imPlaner: true, semesterName: null };
    }

    return { imPlaner: true, semesterName: semester.name };
}

// Lädt current_semester und current_turnus aus dem Profil des Nutzers.
export async function getProfilTurnus(): Promise<{
    currentSemester: number | null;
    currentTurnus: string | null;
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { currentSemester: null, currentTurnus: null };

    const { data, error } = await supabase
        .from("profiles")
        .select("current_semester, current_turnus")
        .eq("id", user.id)
        .maybeSingle();

    if (error || !data) {
        console.error("Fehler beim Laden des Turnus:", error);
        return { currentSemester: null, currentTurnus: null };
    }

    return {
        currentSemester: data.current_semester ?? null,
        currentTurnus: data.current_turnus ?? null,
    };
}
//To-Do:
/*
We need to implement a new feature to give the user the option to check whether his planner is up to date with the latest modules:

To do this we will be checking the Modulename, ECTS and "semesterBis" in {base_url}/bolognamodulversion/{version_id} using max(id) in data[0]?.bolognamodulVersionList from  /bolognamodul/{modul_id}
if semesterBis exists -> module is outdated, only name changed -> Warning about changes to module

Path A: User-added content: Custom Modul/Job -> Add column in Supabase for modules "custom" -> no check
Path B: Basic Module: Added using StuPO and Studiengang in Settings and then Basic Search -> Add column in Supabase for modules "basic" -> the basic search doesn't pass the actual module id, it goes by zuordnung (studiengangzuordnung/ modulzuordnungsListe)-> fetch the version Id from zuordnung -> shared path
Path C: Extended Module: Added using extended Module Search -> Add column in Supabase for modules "extended" -> get the newest version by fetching max(bolognamodulVersionList.id) from /bolognamodul/{id} -> shared path

in the shared path: */ 



// On another note: Adding a feed, where the Admin can post updates would be useful

export type CheckStatus = "UP_TO_DATE" | "WARNING" | "ERROR";

export interface Module_Check_Info {
    status: CheckStatus;
    message: string;
}
export type CheckModulesResult = Record<string, Module_Check_Info>;

export async function Check_modules(): Promise<CheckModulesResult>{
    const supabase= await createClient();
    const {data:{user}} = await supabase.auth.getUser();

    const results: CheckModulesResult = {};
    if (!user) return results;
    const { data: userModules, error } = await supabase
        .from("module")
        .select("id, name, ects, moses_id, module_type")
        .eq("user_id", user.id);

    if (error || !userModules) {
        console.error("Failed to fetch user modules:", error);
        return results;
    }
    for (const module of userModules) {
        try {
            //Path A
            if (!module.module_type ||module.module_type === "custom"|| !module.moses_id) {
                results[module.id] = {status: "UP_TO_DATE", message: "Everything up to date",};
                continue;
            }
            let BolognaId: string | number | null = null;
            //Path B
            if (module.module_type === "basic") {
                let zuordnungRaw = await fetchMoses(`/studiengangszuordnung/${module.moses_id}`);
                let zuordnung = zuordnungRaw?.data?.[0];

                if (!zuordnung) {
                    zuordnungRaw = await fetchMoses(`/bolognamodullistenzuordnung/${module.moses_id}`);
                    zuordnung = zuordnungRaw?.data?.[0];
                }

                BolognaId = zuordnung?.bolognamodulVersion?.id ?? null;
            }

            // PATH C:
            else if (module.module_type === "extended") {
                const modulRaw = await fetchMoses(`/bolognamodul/${module.moses_id}`);
                const versionen = modulRaw?.data?.[0]?.bolognamodulVersionList ?? [];

                if (versionen.length > 0) {
                    BolognaId = Math.max(...versionen.map((v: any) => v.id));
                }
            }
            //SHARED PATH
            if (!BolognaId) {
                results[module.id] = { status: "ERROR", message: "Module version not found (404)" };
                continue;
            }
            const versionRaw = await fetchMoses(`/bolognamodulversion/${BolognaId}`);
            const versionDetail = versionRaw?.data?.[0];

            if (!versionDetail) {
                results[module.id] = { status: "ERROR", message: "Version details not found (404)" };
                continue;
            }
            const desc_id = versionDetail.bolognamodulBeschreibung?.id;
            if (!desc_id) {
                results[module.id] = { status: "ERROR", message: "Description ID not found (404)" };
                continue;
            }
            const descRaw = await fetchMoses(`/bolognamodulbeschreibung/${desc_id}`);
            const desc = descRaw?.data?.[0]?.lp;
            if (desc == null) {
                results[module.id] = { status: "ERROR", message: "LP details not found (404)" };
                continue;
            }

            const isOutdated = versionDetail.semesterBis != null;
            const isRenamed = versionDetail.name?.trim() !== module.name?.trim();
            const isEctsChanged = (desc ?? 0) !== (module.ects ?? 0);

            const warningMessages: string[] = [];

            if (isOutdated) {
                warningMessages.push(`Expired in ${versionDetail.semesterBis.name}`);
            }
            if (isRenamed) {
                warningMessages.push(`Renamed to "${versionDetail.name}"`);
            }
            if (isEctsChanged) {
                warningMessages.push(`LP changed from ${module.ects} to ${desc} LP`);
            }

            if (warningMessages.length > 0) {
                results[module.id] = {
                    status: "WARNING",
                    message: warningMessages.join(" • "),
                };
            } else {
                results[module.id] = {
                    status: "UP_TO_DATE",
                    message: "Everything up to date",
                };
            }

        } catch (e) {
            console.error(`Error checking module ${module.id}:`, e);
            results[module.id] = {
                status: "ERROR",
                message: "Failed to check status",
            };
        }
    }
   return results;
}
