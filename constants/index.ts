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
        modul_id: 1,
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
        modul_id: 2,
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
        modul_id: 3,
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
        modul_id: 4,
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
        modul_id: 5,
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
