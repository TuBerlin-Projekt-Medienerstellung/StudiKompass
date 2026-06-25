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

export const modulInfo: modulInfo[] = [
    {   
        modul_id: "1",
        name: "Einführung in die Programmierung",
        leistungspunkte: 6,
        turnus: "WiSe",
        bereichpfad: "Pflichtmodul",
        lernergebnisse: "Grundlagen der imperativen und objektorientierten Programmierung anhand von Java. Behandelt werden Datentypen, Kontrollstrukturen, Algorithmen und Datenstrukturen.",
        pruefungsform: "Klausur (90 Minuten)",
        benotet: true,
        arbeitsaufwand: 180,
        link: "https://uni-beispiel.de/module/ein-prog"
    },
    {   modul_id: "2",
        name: "Datenbanksysteme",
        leistungspunkte: 5,
        turnus: "SoSe",
        bereichpfad: "Pflichtmodul",
        lernergebnisse: "Konzeptioneller und logischer Entwurf von relationalen Datenbanken. Einführung in SQL, Normalisierung, Transaktionsmanagement und Datensicherheit.",
        pruefungsform: "Elektronische Klausur (60 Minuten) + Bonusprojekt",
        benotet: true,
        arbeitsaufwand: 150,
        link: "https://uni-beispiel.de/module/db-systeme"
    },
    {   modul_id: "3",
        name: "Künstliche Intelligenz & Machine Learning",
        leistungspunkte: 6,
        turnus: "WiSe",
        bereichpfad: "Wahlpflichtmodul",
        lernergebnisse: "Einführung in die Kernkonzepte der KI. Behandelt werden überwachtes und unüberwachtes Lernen, neuronale Netze mit Python sowie ethische Aspekte von KI-Systemen.",
        pruefungsform: "Projektarbeit mit anschließender Präsentation",
        benotet: true,
        arbeitsaufwand: 180,
        link: "https://uni-beispiel.de/module/ki-ml"
    },
    {   modul_id: "4",
        name: "Software Engineering Projekt",
        leistungspunkte: 10,
        turnus: "SoSe",
        bereichpfad: "Projektmodul",
        lernergebnisse: "Praktische Umsetzung eines Softwareprojekts im Team unter Anwendung agiler Methoden (Scrum). Von der Anforderungsanalyse bis zum Deployment.",
        pruefungsform: "Hausarbeit (Code-Review) und Kolloquium",
        benotet: true,
        arbeitsaufwand: 300,
        link: "https://uni-beispiel.de/module/se-projekt"
    },
    {   modul_id: "5",
        name: "IT-Sicherheit und Kryptographie",
        leistungspunkte: 5,
        turnus: "WiSe oder SoSe", // Manchmal werden wichtige Wahlmodule ja in beiden angeboten
        bereichpfad: "Wahlpflichtmodul",
        lernergebnisse: "Grundlagen der symmetrischen und asymmetrischen Verschlüsselung, Netzwerksicherheit, Angriffsvektoren und Schutzmaßnahmen in modernen IT-Infrastrukturen.",
        pruefungsform: "Mündliche Prüfung (20 Minuten)",
        benotet: true,
        arbeitsaufwand: 150,
        link: "https://uni-beispiel.de/module/it-sec"
    }
];
