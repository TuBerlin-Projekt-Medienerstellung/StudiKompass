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

import {useEffect, useState} from 'react';
import {handleModule} from '@/lib/utils';
import {getSemesters} from '@/app/protected/planner/actions';

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

    const [query, setQuery] = useState("");

    // Semester einmal laden — zentral, damit nicht jede Karte einzeln lädt
    const [semesterListe, setSemesterListe] = useState<{ id: string; semesterzahl: number; name: string }[]>([]);

    useEffect(() => {
        async function ladeSemester() {
            try {
                const data = await getSemesters();
                setSemesterListe(data ?? []);
            } catch (e) {
                console.error("Fehler beim Laden der Semester:", e);
            }
        }

        ladeSemester();
    }, []);

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
        const bereich = modul.bereichPfad[0]?.toLowerCase() ?? "";
        const name = modul.name?.toLowerCase() ?? "";
        const search = query.toLowerCase().trim();

        //filter nach name, optional
        const searchOk = search === "" || name.includes(search);

        //bereichspfad Filter
        let filterOk = true;

        if (filter === "pflicht") {
            filterOk = bereich.includes("pflicht") && !bereich.includes("wahl");
        } else if (filter === "wahlpflicht") {
            filterOk = bereich.includes("wahlpflicht");
        }

        return searchOk && filterOk;
    });

    const filterButtons: { label: string; shortLabel: string; value: FilterTyp }[] = [
        {label: "Alle Module", shortLabel: "Alle", value: "alle"},
        {label: "Pflichtmodule", shortLabel: "Pflicht", value: "pflicht"},
        {label: "Wahlpflichtmodule", shortLabel: "Wahlpfl.", value: "wahlpflicht"},
    ];

    return (
        <div className="flex w-full min-w-0 flex-col gap-4 overflow-hidden">
            {/* Filter-Buttons
                Erster Klick → löst Server Action aus
                Weitere Klicks → nur lokaler Filter */}
            <div className="grid w-full grid-cols-3 gap-2">
                {filterButtons.map((btn) => (
                    <button
                        key={btn.value}
                        onClick={() => handleFilterClick(btn.value)}
                        className={`min-w-0 rounded-2xl border-2 px-2 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm lg:text-base ${
                            filter === btn.value
                                ? "bg-flag-red text-white border-flag-red"
                                : "bg-white dark:bg-card text-black dark:text-white border-gray-200 hover:border-flag-red"
                        }`}
                    >
                        <span className="sm:hidden">{btn.shortLabel}</span>
                        <span className="hidden sm:inline">{btn.label}</span>
                    </button>
                ))}
            </div>

            {/* Anzahl der gefilterten Module — nur sichtbar wenn geladen */}
            {geladen && (
                <p className="text-sm opacity-60">
                    {gefilterteModule.length} Module
                </p>
            )}

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

            {/** Suchbar wird angezeigt nachdem ein Filter ausgewählt ist und Module geladen sind */}
            {geladen && filter !== null && (
                <ModulSearch
                    modules={moduleList}
                    query={query}
                    onQueryChange={setQuery}
                />
            )}

            {/* Modulliste — nur sichtbar wenn geladen und nicht am laden */}
            {!laden && geladen && (
                <div className="w-full min-w-0 flex flex-col gap-4">
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
                                key={`${handleModule(modul.id)}-${index}`}
                                modul_id={modul.id}
                                name={modul.name}
                                leistungspunkte={modul.lp}
                                bereichpfad={modul.bereichPfad[0] ?? "—"}
                                link={''}
                                turnus={modul.semester}
                                lernergebnisse={''}
                                pruefungsform=""
                                pruefungselemente={[]}
                                benotet={false}
                                arbeitsaufwand={0}
                                semesterListe={semesterListe}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}