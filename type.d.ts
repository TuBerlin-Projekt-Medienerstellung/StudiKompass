// import {UUID} from "crypto";
import {LucideIcon} from "lucide-react";

declare global {
    interface navBarLink {
        name: string,
        path: string,
        icon: LucideIcon
    }

    interface words {
        text: string
    }

    interface detail {
        name: string,
        value: string
    }

    interface modulInfo {
        modul_id: string, //später zu UUID
        name: string,
        turnus: string,
        bereichpfad: string,
        leistungspunkte: number,
        lernergebnisse: string,
        pruefungsform: string,
        benotet: boolean,
        voraussetzungen?: string,
        link: string,
        note?: number,
        gewichtung?: number,
        abgeschlossen?: boolean,
        versuche?: number;
        arbeitsaufwand: number,
    }

    export interface KategorieBewertung {
        dozent: number;
        vorlesung: number;
        tutorium: number;
        aufwand: number;
        organisation: number;
    }

    export interface Bewertung {
        id: string;
        name: string;
        initialen: string;
        semester: string;
        datum: string; // Anzeigeformat, z.B. "15. März 2024"
        datumSort: number; // Timestamp für Sortierung
        kategorien: KategorieBewertung;
        gesamtScore: number;
        kommentar: string;
        hilfreich: number;
        antworten: number;
    }

    export type SortOption = "hilfreichste" | "neueste" | "beste";

    export type VerteilungsStufe = 1 | 2 | 3 | 4 | 5;
}
export {}
