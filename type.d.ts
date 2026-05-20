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
}
export {}
