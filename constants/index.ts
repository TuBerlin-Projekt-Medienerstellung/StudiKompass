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

export const modulInfo = [
    {
        name: "Einführung in die Programmierung",
        leistungspunkte: 6,
        semester: "WiSe",
        modulArt: "Pflichtmodul",
        beschreibung: "Grundlagen der imperativen und objektorientierten Programmierung anhand von Java. Behandelt werden Datentypen, Kontrollstrukturen, Algorithmen und Datenstrukturen.",
        examform: "Klausur (90 Minuten)",
        arbeitsaufwand: 180,
        link: "https://uni-beispiel.de/module/ein-prog"
    },
    {
        name: "Datenbanksysteme",
        leistungspunkte: 5,
        semester: "SoSe",
        modulArt: "Pflichtmodul",
        beschreibung: "Konzeptioneller und logischer Entwurf von relationalen Datenbanken. Einführung in SQL, Normalisierung, Transaktionsmanagement und Datensicherheit.",
        examform: "Elektronische Klausur (60 Minuten) + Bonusprojekt",
        arbeitsaufwand: 150,
        link: "https://uni-beispiel.de/module/db-systeme"
    },
    {
        name: "Künstliche Intelligenz & Machine Learning",
        leistungspunkte: 6,
        semester: "WiSe",
        modulArt: "Wahlpflichtmodul",
        beschreibung: "Einführung in die Kernkonzepte der KI. Behandelt werden überwachtes und unüberwachtes Lernen, neuronale Netze mit Python sowie ethische Aspekte von KI-Systemen.",
        examform: "Projektarbeit mit anschließender Präsentation",
        arbeitsaufwand: 180,
        link: "https://uni-beispiel.de/module/ki-ml"
    },
    {
        name: "Software Engineering Projekt",
        leistungspunkte: 10,
        semester: "SoSe",
        modulArt: "Projektmodul",
        beschreibung: "Praktische Umsetzung eines Softwareprojekts im Team unter Anwendung agiler Methoden (Scrum). Von der Anforderungsanalyse bis zum Deployment.",
        examform: "Hausarbeit (Code-Review) und Kolloquium",
        arbeitsaufwand: 300,
        link: "https://uni-beispiel.de/module/se-projekt"
    },
    {
        name: "IT-Sicherheit und Kryptographie",
        leistungspunkte: 5,
        semester: "WiSe oder SoSe", // Manchmal werden wichtige Wahlmodule ja in beiden angeboten
        modulArt: "Wahlpflichtmodul",
        beschreibung: "Grundlagen der symmetrischen und asymmetrischen Verschlüsselung, Netzwerksicherheit, Angriffsvektoren und Schutzmaßnahmen in modernen IT-Infrastrukturen.",
        examform: "Mündliche Prüfung (20 Minuten)",
        arbeitsaufwand: 150,
        link: "https://uni-beispiel.de/module/it-sec"
    }
];