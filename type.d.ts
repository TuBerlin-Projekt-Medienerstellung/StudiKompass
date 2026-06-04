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
        modul_id: number,
        name: string,
        leistungspunkte: number,
        semester: string,
        modulArt: string,
        beschreibung: string,
        examform: string,
        arbeitsaufwand: number,
        link: string
    }
}
export {}
