# 🧭 StudiKompass

## Inhaltsverzeichnis

1. 🤖 [Einführung](#einführung)
2. ⚙️ [Tech Stack](#techStack)
3. 🤸🏼 [Setup](#setup)
4. 🫱🏼‍🫲🏾 [Contributing](#contributing)
5. 📁 [Projektstruktur](#projektstruktur)

---

## 🤖 Einführung

**Navis** ist eine interaktive Webapp, die Studierende dabei unterstützt, ihre akademische Laufbahn
strategisch auf individuelle Berufsziele auszurichten. Durch einen dynamischen Studienverlaufsplan werden Module
visualisiert und die Semesterplanung strukturiert.

---

## ⚙️ Tech Stack

Wir nutzen moderne Technologien für eine schnelle Performance und eine sichere Datenverwaltung:

* **Framework:** [Next.js](https://nextjs.org/) (React) – Für schnelles Rendering und Routing.
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) – Für ein responsives und modernes UI-Design.
* **Backend & Datenbank:** [Supabase](https://supabase.com/) – Authentifizierung und PostgreSQL-Datenbank für Moduldaten
  und Benutzerprofile.
* **State Management:** [React Hooks](https://react.dev/) (useState, useEffect) – Für die interaktive Planung.
* **Icons:** [Lucide React](https://lucide.dev/) – Für klare, minimalistische Icons.

---

## 🤸🏼 Setup

Folge diesen Schritten, um das Projekt lokal auf deinem Rechner einzurichten.

**Voraussetzungen**

Stelle sicher, dass die folgenden Programme auf deinem Rechner installiert sind:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com)

**Repository klonen:**

```bash
https://github.com/TuBerlin-Projekt-Medienerstellung/StudiKompass.git
cd StudiKompass
```

**Installation**

```bash
npm install
```

**Umgebungsvariablen**

Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```env
NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_supabase_key
```

**Entwicklung**

```bash
npm run dev
```

**Entwicklung**

```bash
npm run dev
```

Öffne http://localhost:3000 in deinem Browser um das Projekt zu sehen

---

## 🫱🏼‍🫲🏾 Contributing

Da wir als Team zusammenarbeiten, ist es wichtig, dass wir alle nach denselben Regeln arbeiten.

---

### 🌿 Branch-Regeln

**Niemals direkt auf `main` arbeiten!** Erstelle immer einen eigenen Branch:

```bash
git checkout main
git pull origin main
git checkout -b feat/dein-feature
```

---

### 💾 Commits

```bash
# ✅ Gut
git commit -m "feat(login): add signup form"
git commit -m "fix(auth): resolve redirect issue"

# ❌ Schlecht
git commit -m "fix"
git commit -m "changes"
```

---

### 🔁 Pull Request

1. Zuerst main aktualisieren:

```bash
git checkout main
git pull origin main
git checkout -b feat/dein-feature
```

2. Coden & committen
3. Branch pushen: `git push origin feat/dein-feature`
4. Auf GitHub → **"Compare & pull request"**
5. Kurz beschreiben was du gemacht hast
6. Mindestens **1 Teammitglied** reviewen lassen
7. Erst mergen wenn jemand **approved** hat ✅

---

### ⚠️ Goldene Regeln

- 🚫 Nie auf `main` pushen
- 🚫 Keine API-Keys committen (`.env.local` bleibt lokal!)
- ✅ Immer erst `git pull` bevor du anfängst
- ✅ Lieber kleine, häufige Commits

---

## 📁Projektstruktur

```
StudiKompass/
├── app/              # Next.js App Router
├── components/       # Wiederverwendbare UI-Komponenten
├── constants/        # Statische Navigationsdaten und App-Konstanten
├── lib/              # Supabase-Client, Hilfsfunktionen
└── public/           # Statische Assets
```