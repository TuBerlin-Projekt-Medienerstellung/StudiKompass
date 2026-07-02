import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function handleModule(id: ModuleId) {
    // ladeModulBasisAction liefert die id (noch) als rohe MOSES-Nummer statt
    // als {type, value}-Objekt — beide Formen abfangen, sonst wird "undefined" daraus
    if (typeof id === "object" && id !== null) {
        return String(id.value);
    }
    return String(id);
}