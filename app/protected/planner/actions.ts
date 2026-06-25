"use server";

import {createClient} from "@/lib/supabase/server";


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


    const  { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("max_semester")
    .eq("id", user.id)
    .single();

    if (profileError) throw profileError;

    const nextSemester = (profile.max_semester ?? 0) + 1;
    
    const { data, error } = await supabase
    .from('profiles')
    .update({ max_semester: nextSemester})
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
export async function updateSemesterTable (semesterzahl: number){
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
    name: semesterzahl+". Semester",
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


    const  { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("max_semester")
    .eq("id", user.id)
    .single();

    if (profileError) throw profileError;

    const { data, error } = await supabase
    .from('profiles')
    .update({ max_semester: profile.max_semester -1})
    .eq("id", user.id)
    .select()
    .single();

    if (error) {
        console.error('Fehler beim Löschen:', error)
        throw error
    }

    return data
}

export async function reduceSemesterTable(semesterzahl:number) {
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
export async function getTries(modulId: number) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
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

    return data?.versuche ?? 0;
}

// Speichert die Versuche nur, wenn das Modul bereits existiert
export async function saveTries(modulId: number, counter: number) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

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






