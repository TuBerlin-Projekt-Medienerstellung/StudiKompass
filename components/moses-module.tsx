// components/moses-modulsuche.tsx
"use client";

/**
 * MosesModulsuche Komponente
 *
 * Client-Komponente — verwaltet den State der Modulsuche.
 *
 * Funktionsweise:
 * 1. Seite lädt → keine Module sichtbar, nur Filter-Buttons
 * 2. User klickt einen Button → Server Action wird aufgerufen
 * 3. Alle Module werden einmalig geladen und im State gespeichert
 * 4. Weitere Button-Klicks filtern nur noch lokal — kein neuer Fetch
 *
 * Bewusst werden nur Name, ECTS und bereichPfad geladen.
 * Details werden erst beim Ausklappen einer Karte gefetcht (TODO).
 */

import {useState} from 'react';
import ModulCard from '@/components/modul-card';
import ModulSearch from './modulsearch';
import {ladeModulBasisAction, ModulBasis} from '@/app/protected/modules/actions';

interface Props {
    // studiengangId wird von page.tsx weitergegeben
    // TODO: aus Supabase-Profil des eingeloggten Users holen
    studiengangId: number;
}

type FilterTyp = "alle" | "pflicht" | "wahlpflicht";

export default function MosesModulsuche({studiengangId}: Props) {
    // Aktuell ausgewählter Filter — null = noch kein Button gedrückt
    const [filter, setFilter] = useState<FilterTyp | null>(null);

    // Alle geladenen Module — wird beim ersten Knopfdruck befüllt
    const [moduleList, setModuleList] = useState<ModulBasis[]>([]);

    // Ladezustand — true während der Server Action läuft
    const [laden, setLaden] = useState(false);

    // Ob Module bereits geladen wurden — verhindert wiederholte Fetches
    const [geladen, setGeladen] = useState(false);

    /**
     * Wird aufgerufen wenn ein Filter-Button geklickt wird.
     * Beim ersten Klick: Server Action aufrufen und alle Module laden.
     * Bei weiteren Klicks: nur Filter setzen, kein neuer Fetch.
     *
     * @param gewaehlterFilter - Der geklickte Filter
     */
    async function handleFilterClick(gewaehlterFilter: FilterTyp) {
        setFilter(gewaehlterFilter);

        // Nur beim ersten Klick fetchen
        if (!geladen) {
            setLaden(true);
            try {
                // Server Action aufrufen — läuft serverseitig
                // kein CORS Problem, API-Key bleibt sicher auf dem Server
                const modulItems = await ladeModulBasisAction(studiengangId);
                setModuleList(modulItems);
                setGeladen(true);
            } catch (e) {
                console.error("Fehler beim Laden der Module:", e);
            } finally {
                setLaden(false);
            }
        }
    }

    /**
     * Lokale Filterlogik — kein neuer Fetch.
     * Filtert anhand des ersten Eintrags in bereichPfad.
     *
     * "pflicht": enthält "pflicht" aber nicht "wahl" → reine Pflichtmodule
     * "wahlpflicht": enthält "wahlpflicht"
     * "alle": keine Filterung
     */
    const gefilterteModule = moduleList.filter((modul) => {
        if (filter === "alle") return true;
        const bereich = modul.bereichPfad[0]?.toLowerCase() ?? "";
        if (filter === "pflicht") return bereich.includes("pflicht") && !bereich.includes("wahl");
        if (filter === "wahlpflicht") return bereich.includes("wahlpflicht");
        return true;
    });

    const filterButtons: { label: string; value: FilterTyp }[] = [
        {label: "Alle Module", value: "alle"},
        {label: "Pflichtmodule", value: "pflicht"},
        {label: "Wahlpflichtmodule", value: "wahlpflicht"},
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Filter-Buttons
                Erster Klick → löst Server Action aus
                Weitere Klicks → nur lokaler Filter */}
            <div className="flex gap-2">
                {filterButtons.map((btn) => (
                    <button
                        key={btn.value}
                        onClick={() => handleFilterClick(btn.value)}
                        className={`px-4 py-2 rounded-2xl border-2 font-medium transition-colors ${
                            filter === btn.value
                                ? "bg-flag-red text-white border-flag-red"
                                : "bg-white text-black border-gray-200 hover:border-flag-red"
                        }`}
                    >
                        {btn.label}
                    </button>
                    
                ))}

                {/* Anzahl der gefilterten Module — nur sichtbar wenn geladen */}
                {geladen && (
                    <span className="ml-auto self-center text-sm opacity-60">
                        {gefilterteModule.length} Module
                    </span>
                )}
            </div>

            {/* Ladezustand — sichtbar während Server Action läuft */}
            {laden && (
                <p className="text-center opacity-50 py-10">
                    Module werden geladen...
                </p>
            )}

            {/* Startzustand — kein Button gedrückt */}
            {!laden && !geladen && (
                <p className="text-center opacity-50 py-10">
                    Wähle eine Kategorie um Module anzuzeigen.
                </p>
            )}

            {/* Modulliste — nur sichtbar wenn geladen und nicht am laden */}
            {!laden && geladen && (
                <div className="w-full flex flex-col gap-4">
                    <ModulSearch modules={moduleList} />
                    {gefilterteModule.length === 0 ? (
                        <p className="text-center opacity-50 py-10">
                            Keine Module gefunden.
                        </p>
                    ) : (
                        gefilterteModule.map((modul, index) => (
                            /**
                             * key: Kombination aus id und index wegen möglicher
                             * doppelter IDs in der MOSES Demo-API
                             *
                             * onAusklappen: gibt modulId weiter für späteren Detail-Fetch
                             * TODO: Detail-Fetch implementieren
                             */
                            <ModulCard
                                key={`${modul.id}-${index}`}
                                modul_id={modul.id}
                                name={modul.name}
                                leistungspunkte={modul.lp}
                                modulArt={modul.bereichPfad[0] ?? "—"} link={''}
                                turnus={modul.semester}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}