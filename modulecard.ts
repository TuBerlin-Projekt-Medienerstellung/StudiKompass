export type ModulBereich = "Pflichtbereich" | "Wahlpflichtbereich" | "Wahlbereich";
export type Pruefungsforme = "S" | "M" | "P" | "H";
export type sprache = "DE" | "EN";

export interface ModulKarte {
    ID: string //hat man bei moseskonto
    Name: string
    KurzName: string // meist vorhanden(ISIS)
    LP: number
    Semester: number // nach dem Regelstudienplan 

    Bereich: ModulBereich 
    /*
    Bin mir nicht sicher ob es alle moeglichen Optionen in type Bereich sind.
    */


    Pruefung: Pruefungsforme
    /*
    Aber wir sollen es spaeter so machen dass man in der App nicht 'S' oder 'H' sieht
    sondern sinnvolle Namen wie "Schriftliche" "Hausarbeit" etc.
    */  

    Beschreibung: string //Das brauchen wir vllt nicht

    Voraussetzungen: string[]
    /*
     gibt s bei den meisten Kursen nicht
     aber
     ich habe bei den einigen "Empfohlene Voraussetzungen" gesehen, glaube ich
     Wir koennen es auch komplett weglassen oder optional machen
    */

    Klausurzulassung: string
    /*
    Da sollten wir uns ueberlegen.
    Erstens ob diese Information ueberhaupt irgendwo vorhanden ist.
    Es gibt natuerlich einzelne Modulseiten auf ISIS.
    Zweitens. Wenn es meist standartisierte Voraussetzungen gibt,
    dann koennten wir auch ein Type entwickeln.
    z. B. "Zwischentest", "Hausaufgabe", "Hausaufgabe & Zwischentest"
    sonst bleiben wir bei string
    Drittens. Eventuell wuerde es reichen, boolean hier zu machen also ja/nein
    */

    Tags: string[] // vllt brauchen wir nicht
    Sprache: sprache
}