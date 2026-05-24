// app/protected/modules/page.tsx

/**
 * Modulkatalog-Seite
 *
 * Server-Komponente — lädt beim Seitenaufruf KEINE Module.
 * Der Fetch wird erst bei Knopfdruck in MosesModulsuche ausgelöst.
 *
 * Aufgabe dieser Komponente:
 * - Seiten-Layout und Header rendern
 * - studiengangId an MosesModulsuche weitergeben
 *
 * TODO: studiengangId aus Supabase-Profil des eingeloggten Users holen
 * statt hardcoded 37 (Maschinenbau B.Sc.)
 */

import MosesModulsuche from "@/components/moses-modulsuche";
import { Plus } from 'lucide-react';

export default function ModulesPage() {
    // Hardcoded für Demo-Zwecke — wird später aus Supabase-Profil geholt
    // Verfügbare IDs in der Demo-API: 37 (Maschinenbau B.Sc.), 83 (Maschinenbau M.Sc.)
    const studiengangId = 37;

    return (
        <section className="flex flex-col gap-3">
            <header className="flex md:justify-between md:flex-row flex-col items-center md:items-start gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Modulkatalog</h1>
                    <p>Durchsuche und verwalte verfügbare Module</p>
                </div>
                {/* TODO: Custom-Modul Funktionalität noch nicht implementiert */}
                <button className="flex bg-flag-red text-white justify-center items-center px-3 rounded-2xl w-64 h-11">
                    <Plus />
                    Custom-Modul erstellen
                </button>
            </header>

            {/**
             * MosesModulsuche übernimmt:
             * - Filter-Buttons (Alle / Pflicht / Wahlpflicht)
             * - Fetch bei erstem Knopfdruck via Server Action
             * - Lokales Filtern nach erstem Load
             * - Anzeige der Modulkarten (nur Name + ECTS)
             */}
            <MosesModulsuche studiengangId={studiengangId} />
        </section>
    );
}