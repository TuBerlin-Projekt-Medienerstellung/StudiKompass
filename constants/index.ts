import {LayoutDashboard, BookOpen, TrendingUp, Settings} from "lucide-react"

export const navBarLinks: navBarLink[] = [
    {name: "Planer", path: "/protected/planner", icon: LayoutDashboard},
    {name: "Module", path: "/protected/modules", icon: BookOpen},
    {name: "Fortschritt", path: "/protected/dashboard", icon: TrendingUp},
    {name: "Einstellungen", path: "/protected/settings", icon: Settings},
]

export const words: words[] = [
    {text: 'Studium'},
    {text: 'Fokus'},
    {text: 'Plan'},
]

// dummy daten
export const details: detail[] = [
    {name: "Prüfungsform", value: "Portfolioprüfung"},
    {name: "Arbeitsaufwand", value: "150h"},
    {name: "Angebot", value: "SoSe"},
    {name: "Leistungspunkte", value: "6"},
]


export const initialeBewertungen: Bewertung[] = [
    {
        id: "1",
        name: "Lena K.",
        initialen: "LK",
        semester: "WS 2023/24",
        datum: "15. März 2024",
        datumSort: new Date("2024-03-15").getTime(),
        kategorien: {dozent: 5, vorlesung: 4, tutorium: 5, aufwand: 3, organisation: 4},
        gesamtScore: 4.2,
        kommentar:
            "Super Einstieg in die Informatik! Prof. Schmidt erklärt sehr anschaulich und die Übungen sind praxisnah gestaltet.",
        hilfreich: 12,
        antworten: 1,
    },
    {
        id: "2",
        name: "Jonas W.",
        initialen: "JW",
        semester: "WS 2023/24",
        datum: "10. Feb. 2024",
        datumSort: new Date("2024-02-10").getTime(),
        kategorien: {dozent: 4, vorlesung: 3, tutorium: 4, aufwand: 4, organisation: 3},
        gesamtScore: 3.6,
        kommentar:
            "Gutes Modul, aber die Prüfungsvorbereitung hätte klarer kommuniziert werden können. Tutorien sind definitiv wichtiger als die Vorlesung.",
        hilfreich: 8,
        antworten: 0,
    },
];
