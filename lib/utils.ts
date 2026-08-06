import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function handleModule(id: ModuleId | string | number) {
    // Fall 1: Objekt-Format { type, value }
    if (id && typeof id === "object" && "value" in id) {
        return String(id.value);
    }

    // Fall 2: String oder number
    return String(id);
}

// Berechnet den Turnus eines Semesters basierend auf dem aktuellen Semester + dessen Turnus.
// Logik: Semester wechseln sich ab (WiSe/SoSe). Ist die Differenz zum current-Semester
// gerade, hat es denselben Turnus wie current; ist sie ungerade, den anderen.
export function berechneTurnus(
    semesterzahl: number,
    currentSemester: number | null,
    currentTurnus: string | null
): string | null {
    // Ohne current-Turnus können wir nichts ableiten
    if (!currentTurnus || !currentSemester) {
        return null;
    }

    const differenz = semesterzahl - currentSemester;
    const gleicheParitaet = differenz % 2 === 0;

    if (gleicheParitaet) {
        return currentTurnus;   // gleicher Turnus wie current
    }

    // anderer Turnus
    return currentTurnus === "WiSe" ? "SoSe" : "WiSe";
}

function wechselBisDatum(datum: Date): number {

    const jahr = datum.getFullYear();

    //getMonth() ist 0 basiert => januar = 0, april = 3, oktober = 9 , dezember = 11
    const monat = datum.getMonth();

    const tag = datum.getDate();

    let zaehler = jahr * 2;
    
    //Ist der 1.4. dieses Jahres erreicht? (Monat > April, ODER genau April ab Tag 1)
    if (monat > 3 || (monat === 3 && tag >= 1)) {
        zaehler += 1;
    }

    //Ist der 1.10. dieses Jahres erreicht?
    if (monat > 9 || (monat === 9 && tag >= 1)) {
        zaehler += 1;
    }

    return zaehler;
}

//Zählt die Semesterwechsel zwischen zwei Daten (merker < heute).
export function zaehleSemesterWechsel(merker: Date, heute: Date): number {
    return wechselBisDatum(heute) - wechselBisDatum(merker);
}

// Formatiert ein Date als "YYYY-MM-DD" anhand der LOKALEN Zeit
export function formatiereDatumLokal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}