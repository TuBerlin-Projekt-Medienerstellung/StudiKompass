# NAVIS – MOSES API Routes (`api-routes/first-experiments`)

Dieser Branch enthält die ersten experimentellen API-Routen für das NAVIS-Projekt. Ziel ist es, Modulinformationen aus der [MOSES-Datenbank der TU Berlin](https://moses.tu-berlin.de) abzurufen und für die NAVIS-Modulkarten bereitzustellen.

---

## Voraussetzungen

- [Node.js](https://nodejs.org/) installiert
- Zugriff auf einen MOSES-API-Key (Demo oder Produktiv)
- Eine `.env.local` Datei im Projektroot mit folgendem Inhalt:

```env
MOSES_API_KEY=dein-api-key-hier


## Projekt starten

```bash
npm install
npm run dev
```

Die Anwendung läuft dann auf `http://localhost:3000`.

---

## API-Routen Übersicht

### 1. `/api/module` — Modulliste eines Studiengangs

**Zweck:**
Gibt alle Module eines Studiengangs mit ihren vollständigen Informationen zurück, inklusive Bereichszuordnung, ECTS, Prüfungsform, Turnus, Lernergebnissen, Lehrinhalten, Voraussetzungen und einem direkten Link zur MOSES-Modulseite.

**Aufruf:**
```
GET http://localhost:3000/api/module?studiengangId=37
```

| Parameter | Beschreibung |
|---|---|
| `studiengangId` | Die MOSES-ID des gewünschten Studiengangs (z.B. `37` für Maschinenbau B.Sc.) |

**Beispiel-Output (ein Modul):**
```json
{
  "id": 22914,
  "name": "Strömungsmechanisches Projekt",
  "bereichPfad": ["Wahlpflichtmodule", "Projekt"],
  "lp": 6,
  "pruefungsform": "Portfolioprüfung",
  "turnus": "Winter- und Sommersemester",
  "lernergebnisse": "Die Studierenden sollen...",
  "lehrinhalte": "Folgende Themen werden behandelt...",
  "voraussetzungen": "a) obligatorisch: ...",
  "mosesUrl": "https://moseskonto.tu-berlin.de/moses/modultransfersystem/bolognamodule/beschreibung/anzeigen.html?nummer=50592"
}
```

**Erklärung der Felder:**

- `bereichPfad` — Zeigt die vollständige Hierarchie des Studiengangsbereichs, dem das Modul zugeordnet ist (von oben nach unten). Das erste Element entspricht dem Pflicht-/Wahlpflichtstatus, das letzte Element der Themenkategorie.
- `lernergebnisse` — Beschreibt die Kompetenzen und Kenntnisse, die nach dem Bestehen des Moduls erworben wurden (aus MOSES-Modulbeschreibung).
- `lehrinhalte` — Beschreibt die behandelten Themen und Inhalte des Moduls.
- `voraussetzungen` — Listet Pflicht- und Wunschvoraussetzungen als Freitext auf (eine direkte Modulverlinkung ist in MOSES nicht vorgesehen).
- `mosesUrl` — Direktlink zur offiziellen Modulbeschreibungsseite auf MOSES.

---

### 2. `/api/bereichregel` — Bereichsbaum mit Wahlregeln

**Zweck:**
Gibt den vollständigen Bereichsbaum eines Studiengangs zurück, inklusive aller Wahlregeln pro Bereich. Diese Informationen beschreiben, wie viele ECTS oder Module ein Studierender aus einem bestimmten Bereich bestehen muss oder darf.

**Aufruf:**
```
GET http://localhost:3000/api/bereichregel?studiengangId=37
```

| Parameter | Beschreibung |
|---|---|
| `studiengangId` | Die MOSES-ID des gewünschten Studiengangs |

**Beispiel-Output (Ausschnitt):**
```json
{
  "studiengang": "Maschinenbau",
  "stupo": "Maschinenbau (B. Sc.) - StuPO 2017",
  "bereiche": [
    {
      "id": 868,
      "name": "Pflichtbereich",
      "wahlregeln": [
        { "typ": "BESTEHE_ALLE" }
      ],
      "kinder": [
        {
          "id": 870,
          "name": "Naturwissenschaftliche Grundlagen",
          "wahlregeln": [
            { "typ": "BESTEHE_ALLE" }
          ],
          "kinder": []
        }
      ]
    },
    {
      "id": 894,
      "name": "Projekt",
      "wahlregeln": [
        { "typ": "BESTEHE_MIN_LP", "wert": 6 },
        { "typ": "BESTEHE_MAX_LP", "wert": 6 }
      ],
      "kinder": []
    }
  ]
}
```

**Erklärung der Wahlregeltypen:**

| Typ | Bedeutung |
|---|---|
| `BESTEHE_ALLE` | Alle Module des Bereichs müssen bestanden werden (Pflichtbereich) |
| `BESTEHE_MIN_LP` + `wert` | Mindestens X ECTS aus diesem Bereich müssen erreicht werden |
| `BESTEHE_MAX_LP` + `wert` | Maximal X ECTS aus diesem Bereich dürfen angerechnet werden |
| `BESTEHE_MIN_ANZAHL` + `wert` | Mindestens X Module aus diesem Bereich müssen bestanden werden |
| `BESTEHE_MAX_ANZAHL` + `wert` | Maximal X Module aus diesem Bereich dürfen angerechnet werden |

---

## Bekannte Einschränkungen (Demo-API)

Die Demo-API der TU Berlin ist eine abgespeckte Testumgebung. Folgende Einschränkungen sind bekannt:

- Vollständige Modullisten sind nur für **Maschinenbau B.Sc. (ID: 37)** und **Maschinenbau M.Sc. (ID: 83)** vorhanden.
- Andere Studiengänge sind zwar in der API gelistet, haben aber keine Moduldaten hinterlegt.
- Für den produktiven Einsatz mit allen TU-Studiengängen wird der Zugriff auf die vollständige MOSES-Produktiv-API benötigt.

---

## Datenpfad (Technischer Hintergrund)

Die MOSES-API ist stark verschachtelt. Ein Modul ist nicht direkt am Studiengang hängend, sondern über folgende Kette erreichbar:

```
Studiengang
  └── StuPO (neueste = höchste ID)
        └── Studiengangsabbildung
              └── Modulliste (neueste)
                    └── Studiengangszuordnung
                          ├── Bolivamodulversion
                          │     ├── Bolivamodul (für MOSES-URL)
                          │     └── Bolivamodulbeschreibung (für Lernergebnisse etc.)
                          └── Studiengangsbereich (rekursiv → Bereichspfad)
```

---

## Dateipfade

```
app/
└── api/
    ├── module/
    │   └── route.ts       ← /api/module
    ├── bereichregel/
    │   └── route.ts       ← /api/bereichregel
    ├── studiengaenge/
    │   └── route.ts       ← /api/studiengaenge
    └── semester/
        └── route.ts       ← /api/semester
```
