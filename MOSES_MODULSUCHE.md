# MOSES Modulsuche — feat/moses-modulsuche

Diese Dokumentation erklärt die Implementierung der Modulsuche im StudiKompass Projekt, die Denkweise dahinter und was noch offen ist.

---

## Was wurde gebaut

Eine Modulsuche für den Modulkatalog (`app/protected/modules/`) die Module aus der MOSES API der TU Berlin lädt und gefiltert anzeigt.

**Drei Filter-Buttons:**
- "Alle Module" — zeigt alle Module des Studiengangs
- "Pflichtmodule" — zeigt nur Pflichtmodule
- "Wahlpflichtmodule" — zeigt nur Wahlpflichtmodule

**Wichtig:** Beim ersten Knopfdruck werden alle Module einmalig geladen, danach filtern die Buttons nur noch lokal — kein weiterer Fetch.

---

## Dateistruktur

```
app/
└── protected/
    └── modules/
        ├── page.tsx           ← Server-Komponente, gibt studiengangId weiter
        └── actions.ts         ← Server Action, fetcht MOSES API serverseitig

components/
├── moses-modulsuche.tsx       ← Client-Komponente, Buttons + State + Filter
└── modul-card.tsx             ← Einzelne Modulkarte, gibt modulId beim Ausklappen weiter
```

---

## Technische Entscheidungen

### Warum Server Action statt `/api/` Route?

Die MOSES API erlaubt keine direkten Browser-Requests (CORS). Ursprünglich haben wir eine `/api/module` Route gebaut — aber da Next.js Server Actions serverseitig laufen, können wir die MOSES API direkt aufrufen ohne den Umweg über eine eigene API-Route.

Vorteile:
- Kein `/api/` Endpunkt der von außen aufrufbar ist
- `MOSES_API_KEY` ist nie im Browser sichtbar (kein `NEXT_PUBLIC_` Prefix nötig)
- Weniger Code, saubere Struktur

### Warum erst bei Knopfdruck fetchen?

- `page.tsx` ist eine Server-Komponente — würde beim Seitenaufruf sofort fetchen
- Das wäre ineffizient wenn der User die Seite nur kurz besucht
- Bessere UX: User entscheidet selbst wann er die Module laden möchte

### Warum nur Name + ECTS laden?

Die MOSES API ist stark verschachtelt — vollständige Moduldetails (Beschreibung, Prüfungsform etc.) benötigen pro Modul 4-5 API-Calls. Bei 253 Modulen wären das über 1000 Calls.

Lösung: Beim ersten Load nur Name, ECTS und bereichPfad laden (2 Calls pro Modul). Details werden erst beim Ausklappen einer Karte geladen — dann nur für das eine angeklickte Modul.

### Warum 30er-Batches mit Promise.all?

Sequenzielles Laden von 253 Modulen dauerte ~40 Sekunden. Mit `Promise.all` in 30er-Batches sind es ~600ms beim ersten Load, danach unter 10ms dank Next.js Cache (`revalidate: 86400`).

### Warum bereichPfad für die Filter-Logik?

Jedes Modul hat einen `bereichPfad` — ein Array das die Hierarchie des Studiengangsbereichs zeigt, z.B. `["Pflichtmodule", "Mathematik"]`. Der erste Eintrag (`bereichPfad[0]`) bestimmt ob es ein Pflicht- oder Wahlpflichtmodul ist.

---

## Datenpfad (MOSES API)

Die MOSES API ist stark verschachtelt:

``
Studiengang
  └── StuPO (neueste = höchste ID)
        └── Studiengangsabbildung (via ?stupoId)
              └── modullisteList → Modulliste (neueste = höchste ID)
                    └── Studiengangszuordnung
                          ├── name, modullp (ECTS)
                          └── Studiengangsbereich (rekursiv → bereichPfad)
```

**Wichtige Erkenntnis:** `GET /studiengangsabbildung/{id}` enthält direkt eine `modullisteList` mit allen zugehörigen Modullisten-IDs. Dadurch können wir direkt `GET /modulliste/{id}` aufrufen statt alle 4MB von `GET /modulliste` zu laden und lokal zu filtern.

---

## Demo-API Limitation

Die Demo-API der TU Berlin hat nur vollständige Daten für:
- Maschinenbau B.Sc. (ID: 37)
- Maschinenbau M.Sc. (ID: 83)

Die `studiengangId` ist aktuell hardcoded auf `37` in `page.tsx`.

---

## Was noch offen ist

### 1. studiengangId aus Supabase-Profil holen

Aktuell ist die `studiengangId` hardcoded auf `37`. Sie soll aus dem Supabase-Profil des eingeloggten Users geholt werden.

```tsx
// page.tsx — TODO:
const { data: profile } = await supabase
    .from('profiles')
    .select('studiengang_id')
    .single();

const studiengangId = profile?.studiengang_id ?? 37;
```

Dafür muss in Supabase die `studiengang_id` als MOSES ID (Zahl) gespeichert werden — nicht als Name.

### 2. Detail-Fetch beim Ausklappen

Wenn eine Modulkarte ausgeklappt wird, gibt `onAusklappen(modulId)` die ID weiter. Damit soll eine separate Komponente die Details fetchen:

- Beschreibung (Lernergebnisse / Lehrinhalte)
- Prüfungsform
- Turnus
- Link zu Moses
- "Zum Planer hinzufügen" Button

```tsx
// modul-card.tsx — TODO:
onAusklappen={(modulId) => {
    // Detail-Fetch hier aufrufen
}}
```

### 3. "Module suchen" Button

Die Kollegin hat vorgeschlagen einen separaten "Module suchen" Button einzubauen der den Fetch auslöst, während Pflicht/Wahl nur noch als Filter daneben liegen. Das ist noch nicht umgesetzt.

---

## Performance Übersicht

| Schritt | Alt | Neu |
|---|---|---|
| Modulliste finden | `GET /modulliste` (4MB, alle) → lokal filtern → ~23s | `GET /studiengangsabbildung/{id}` → `modullisteList` → direkt laden → ~1ms |
| Module laden (253 Stück) | Sequenziell → ~40s | 30er-Batches parallel → ~600ms |
| Wiederholte Requests | Jedes Mal neu | 24h Cache → <10ms |
| Erster Seitenaufruf | Sofort alles geladen | Nichts geladen bis Knopfdruck |