"use client";

import { useState } from "react";

// Easter Egg: 26 Klicks auf "Studienplaner" öffnen ein Credits-Overlay
export default function PlannerTitleEasterEgg() {
    const [klicks, setKlicks] = useState(0);
    const [zeigeCredits, setZeigeCredits] = useState(false);

    function handleKlick() {
        const neu = klicks + 1;
        if (neu >= 26) {
            setZeigeCredits(true);
            setKlicks(0);        // Zähler zurücksetzen
        } else {
            setKlicks(neu);
        }
    }

    const team = [
        { name: "Lena B.", rollen: ["Projektmanagerin", "Frontend", "Design", "Co-Videoproduktion"] },
        { name: "Jakob M.R.E.", rollen: ["Frontend", "Design", "Co-Videoproduktion"] },
        { name: "Emma W.", rollen: ["Frontend", "Design", "Videoproduktion"] },
        { name: "Lennart N.L.", rollen: ["Lead Frontend", "Design"] },
        { name: "Jamsin H.", rollen: ["Frontend", "Design"] },
        { name: "Vlad H.", rollen: ["Frontend", "Design"] },
        { name: "Anna G.", rollen: ["Lead Back-End Dev"] },
        { name: "Alessio B.", rollen: ["Back-End"] },
    ];
    const supervisorin = "Judith M.B. - Supervisorin";

    return (
        <>
            <h1
                onClick={handleKlick}
                className="font-bold text-4xl cursor-default select-none"
                title="Studienplaner"
            >
                Studienplaner
            </h1>

            {zeigeCredits && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setZeigeCredits(false)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-md mx-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-flag-red mb-4">
                            NAVIS — Das Team
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                            Die NAVIS-Seite ist ein Produkt, entstanden aus einer Projektwahl im Modul
                            "Projekt Medienerstellung" im Sommersemester 2026 an der TU Berlin. Das Ziel
                            war, ein Werkzeug für Studierende an der TUB zu entwickeln, das die Planung und
                            Navigation durch den Studiengangsverlauf erleichtert.
                        </p>

                        <h3 className="font-semibold mb-2">Entwicklungsteam</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {team.map((person) => (
                                <div key={person.name}>
                                    <p className="font-semibold text-sm">{person.name}</p>
                                    <ul className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {person.rollen.map((rolle) => (
                                            <li key={rolle}>{rolle}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <h3 className="font-semibold mb-2">Betreuung</h3>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-6">
                            {supervisorin}
                        </p>

                        <button
                            onClick={() => setZeigeCredits(false)}
                            className="w-full bg-flag-red text-white px-4 py-2 rounded-lg"
                        >
                            Schließen
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}