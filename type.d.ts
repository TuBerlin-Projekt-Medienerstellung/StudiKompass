import { UUID } from "crypto";
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
        vorraussetzungen: string,
        link: string,
        note?: number,
        gewichtung?: number,
        abgeschlossen?: boolean,
        versuche?: number;
        arbeitsaufwand: number,
    }
}
export {}
