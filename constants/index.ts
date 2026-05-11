import {LayoutDashboard, BookOpen, TrendingUp, Settings} from "lucide-react"

export const navBarLinks: navBarLink[] = [
    {name: "Planer", path: "/protected/planner", icon: LayoutDashboard},
    {name: "Module", path: "/protected/modules", icon: BookOpen},
    {name: "Fortschritt", path: "/protected/dashboard", icon: TrendingUp},
    {name: "Einstellungen", path: "/protected/settings", icon: Settings},
]