import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

<<<<<<< HEAD
export function handleModule(id: ModuleId | string | number) {
    // Fall 1: Es ist das Objekt-Format { type, value }
    if (id && typeof id === "object" && "value" in id) {
        return String(id.value);
    }
    // Fall 2: Es ist direkt eine Zahl oder ein String (der echte Fall aus der Suche)
=======
export function handleModule(id: ModuleId) {
    // ladeModulBasisAction liefert die id (noch) als rohe MOSES-Nummer statt
    // als {type, value}-Objekt — beide Formen abfangen, sonst wird "undefined" daraus
    if (typeof id === "object" && id !== null) {
        return String(id.value);
    }
>>>>>>> origin/main
    return String(id);
}