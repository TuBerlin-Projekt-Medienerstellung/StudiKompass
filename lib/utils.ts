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