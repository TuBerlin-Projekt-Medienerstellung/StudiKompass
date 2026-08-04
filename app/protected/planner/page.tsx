"use client";

import SemesterCard from "@/components/semester-card";
import SemesterModulCard from "@/components/semester-modul-card";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2 } from 'lucide-react';
import { reduceSemesterTable, deleteSemester, createSemester, updateSemesterTable, getSemesters, getSemestersMitModulen, verschiebeModul, loescheSemesterMitModulen, getProfilTurnus} from './actions';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Check_modules } from "./actions";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { Module_Check_Info } from "@/components/check_modules"
import { modulInfo } from "@/constants";


type Semester = {
    id: string;
    nummer: number;
    modules: modulInfo[];
};

type SemesterList = Semester[];

const Page = () => {

    const [semesterList, setSemesterList] = useState<SemesterList>([]);
    const [activeModul, setActiveModul] = useState<modulInfo | null>(null);
    const [proWoche, setProWoche] = useState(false);
    const [currentSemester, setCurrentSemester] = useState<number | null>(null);
    const [currentTurnus, setCurrentTurnus] = useState<string | null>(null);
    const semesterOperationLaeuft = useRef(false);
    const [semesterButtonsDisabled, setSemesterButtonsDisabled] = useState(false);
    const [vollesSemester, setVollesSemester] = useState<number | null>(null);
    const [vollesSemesterSichtbar, setvollesSemesterSichtbar] = useState(false);
    const [richtigerTurnus, setRichtigerTurnus] = useState<string | null>(null);
    const [richtigerTurnusSichtbar, setRichtigerTurnusSichtbar] = useState(false);

    const [checkResults, setCheckResults] = useState<Record<string, Module_Check_Info>>({});
    const [checking, setChecking] = useState(false);

    async function handle_Check() {
        setChecking(true);
        try {
            const results = await Check_modules();
            setCheckResults(results);
        } catch (e) {
            console.error("Fehler beim Prüfen:", e);
        } finally {
            setChecking(false);
        }
    }

    useEffect(() => {
        async function loadSemesters() {
            const data = await getSemestersMitModulen();
            setSemesterList(
                data.map((s) => ({
                    id: s.id,
                    nummer: s.semesterzahl,
                    // TODO: statt any einen Typ für DB-Module definieren
                    modules: (s.modules ?? []).map((m: any) => ({
                        modul_id: m.id,
                        name: m.name,
                        leistungspunkte: m.ects,
                        turnus: m.turnus,
                        bereichpfad: Array.isArray(m.bereichpfad) ? m.bereichpfad[0] : m.bereichpfad,
                        link: m.moseslink,
                        lernergebnisse: m.lernergebnisse,
                        voraussetzungen: m.voraussetzungen,
                        pruefungsform: m.pruefungsform,
                        benotet: m.benotet,
                        note: m.note,
                        gewichtung: m.gewichtung,
                        abgeschlossen: m.abgeschlossen,
                        versuche: m.versuche,
                        arbeitsaufwand: m.arbeitsaufwand,
                    })),
                }))
            );
        }

        async function loadTurnus() {
            const { currentSemester, currentTurnus } = await getProfilTurnus();
            setCurrentSemester(currentSemester);
            setCurrentTurnus(currentTurnus);
        }

        loadSemesters();
        loadTurnus();
    }, []);

    //turnus in profiles anders gespeichert als in modules tabelle
    function normalizeTurnus(turnus: string) {
    switch (turnus.toLowerCase()) {
        case "wise":
            return "Wintersemester";
        case "sose":
            return "Sommersemester";
        default:
            return turnus;
    }
}

    //Turnus eines Semesters berechnen
    function getSemesterTurnus(semesterNummer: number,currentSemester: number, currentTurnus: "Wintersemester" | "Sommersemester"): "Wintersemester" | "Sommersemester" {

               const diff = semesterNummer - currentSemester;

                    if (diff % 2 === 0) {
                        return currentTurnus;
                    }

                    return currentTurnus === "Wintersemester"
                        ? "Sommersemester"
                        : "Wintersemester";
                }
            
    function checkTurnus(modulTurnus: string | undefined, semesterTurnus: string) {
        if (semesterTurnus == modulTurnus){
            return true; 
        }
        if (semesterTurnus != "Wintersemester" && semesterTurnus != "Sommersemester" ){
            return true;
        }
    
        if (modulTurnus != "Wintersemester" && modulTurnus != "Sommersemester"){
            return true;
        }

        return false;
    }

    //Arbeitsaufwand warning fade
    useEffect(() => {
        if (!vollesSemesterSichtbar) return;

        const hideTimer = setTimeout(() => {
            setvollesSemesterSichtbar(false);
        }, 4000);

        const resetTimer = setTimeout(() => {
            setVollesSemester(null);
        }, 5000);

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(resetTimer);
        };
    }, [vollesSemesterSichtbar]);

    //Turnus warning fade
     useEffect(() => {
        if (!richtigerTurnusSichtbar) return;

        const hideTimer = setTimeout(() => {
            setRichtigerTurnusSichtbar(false);
        }, 4000);

        const resetTimer = setTimeout(() => {
            setRichtigerTurnus(null);
        }, 5000);

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(resetTimer);
        };
    }, [richtigerTurnusSichtbar]);


    async function handleAddSemester() {

        //Guard: läuft schin eine Semesteroperation? Wenn ja, ignorieren
        if (semesterOperationLaeuft.current) return;

        // Grenze: maximal 20 Semester (konsistent mit den Settings)
        if (semesterList.length >= 20) {
            return;   // nichts tun, Grenze erreicht
        }

        semesterOperationLaeuft.current = true;
        setSemesterButtonsDisabled(true);
        try {
            const maxNummer =
                semesterList.length > 0
                    ? Math.max(...semesterList.map((s) => s.nummer))
                    : 0;

            const neueNummer = maxNummer + 1;

            await createSemester();
            const neueZeile = await updateSemesterTable(neueNummer);

            setSemesterList((prev) => [
                ...prev,
                {
                    id: neueZeile.id,
                    nummer: neueNummer,
                    modules: [],
                },
            ]);
        } finally {
            semesterOperationLaeuft.current = false;
            setSemesterButtonsDisabled(false);
        }
    }

    async function handleDeleteSemester(semesterId: string, semesterNummer: number) {

        //Guard: läuft schon eine Semesteroperation? Wenn ja, ignorieren
        if (semesterOperationLaeuft.current) return;

        semesterOperationLaeuft.current = true;
        setSemesterButtonsDisabled(true);
        try {
            await deleteSemester();                        // zieht max_semester runter (profiles)
            await loescheSemesterMitModulen(semesterId);   // löscht Semester + Module

            setSemesterList((prev) => prev.filter((sem) => sem.id !== semesterId));
        } finally {
            semesterOperationLaeuft.current = false;
            setSemesterButtonsDisabled(false);
        }
    }

    // Entfernt ein Modul aus dem State (nach dem Löschen aus der DB).
    function entferneModulAusState(modulId: string) {
        setSemesterList((prev) =>
            prev.map((sem) => ({
                ...sem,
                modules: sem.modules.filter((m) => getModuleId(m) !== modulId),
            }))
        );
    }
    const getModuleId = (m: modulInfo) => String((m as any)?.modul_id?.value ?? (m as any)?.modul_id);

    const findSemesterByModulId = (modulId: string) => {
        return semesterList.find(s => s.modules.some(m => getModuleId(m) === modulId)
        );
    };

    const handleDragStart = (event: DragStartEvent) => {
        const activeId = String(event.active.id);
        // Durchsuche alle Semester nach dem Modul mit dieser ID
        for (const sem of semesterList) {
            const gefunden = sem.modules.find(
                m => getModuleId(m) === activeId
            );
            if (gefunden) {
                setActiveModul(gefunden);
                break;
            }
        }
    };

    // Die neue Drag-and-Drop Logik verarbeitet das Verschieben im Zustand (State)
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveModul(null);

        if (!over) return;

        const activeModulId = String(active.id);

        // Prüfen, ob das Modul auf eine leere Semester-Spalte oder über ein anderes Modul gezogen wurde
        let targetSemesterNummer: number;
        if (String(over.id).startsWith('semester-')) {
            targetSemesterNummer = Number(String(over.id).replace('semester-', ''));
        } else {
            const overModulId = String(over.id);
            const targetSem = semesterList.find(s => s.modules.some(m => getModuleId(m) === overModulId));
            if (!targetSem) return;
            targetSemesterNummer = targetSem.nummer;
        }

        const sourceSemester = findSemesterByModulId(activeModulId);
        if (!sourceSemester || !targetSemesterNummer) return;

        const newSemesters = [...semesterList];
        const sourceSemIndex = newSemesters.findIndex((s) => s.nummer === sourceSemester.nummer);
        const targetSemIndex = newSemesters.findIndex((s) => s.nummer === targetSemesterNummer);

        // FALL 1: Innerhalb desselben Semesters verschieben (Reihenfolge ändern)
        if (sourceSemester.nummer === targetSemesterNummer) {
            const sem = newSemesters[sourceSemIndex];
            const oldIndex = sem.modules.findIndex(m => getModuleId(m) === activeModulId);
            let newIndex = sem.modules.findIndex(m => getModuleId(m) === String(over.id));
            if (newIndex === -1) newIndex = sem.modules.length - 1;

            sem.modules = arrayMove(sem.modules, oldIndex, newIndex);
            setSemesterList(newSemesters);
        }
        // FALL 2: In ein anderes Semester rüberschieben
        else {
            const sourceSem = newSemesters[sourceSemIndex];
            const targetSem = newSemesters[targetSemIndex];

            const modulIndex = sourceSem.modules.findIndex(m => getModuleId(m) === activeModulId);
            const movedModul = sourceSem.modules[modulIndex];
            sourceSem.modules = sourceSem.modules.filter((_, index) => index !== modulIndex);

            let newIndex = targetSem.modules.findIndex((m) => getModuleId(m) === String(over.id));
            if (newIndex === -1) newIndex = targetSem.modules.length;

            targetSem.modules = [...targetSem.modules.slice(0, newIndex), movedModul,...targetSem.modules.slice(newIndex),];
            setSemesterList(newSemesters);

            verschiebeModul(String(movedModul.modul_id), targetSem.id);


            //Gesamtarbeitsaufwand prüfen
            const gesamtArbeitsaufwand = targetSem.modules.reduce(
                (sum, modul) => sum + (modul.arbeitsaufwand ?? 0), 0);

            if (gesamtArbeitsaufwand > 900){
                setVollesSemester(targetSem.nummer);
                setvollesSemesterSichtbar(true);
            }

            //Turnus überprüfen
            if (!currentSemester || !currentTurnus) return;

            const semesterTurnus = getSemesterTurnus(targetSem.nummer,currentSemester,normalizeTurnus(currentTurnus) as "Wintersemester" | "Sommersemester");
   
            if (!checkTurnus(movedModul.turnus, semesterTurnus)) {
                setRichtigerTurnus(movedModul.turnus);
                setRichtigerTurnusSichtbar(true);
            }
        }

    };

    return (
        <div>

        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {vollesSemester && (
               <div className={`rounded-lg border border-sandy-brown bg-warning-background px-4 py-3 text-dark-khaki shadow-lg transition-all
                                duration-1000 ease-in-out ${vollesSemesterSichtbar ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                        Das {vollesSemester}. Semester überschreitet den empfohlenen Arbeitsaufwand.
                </div>
                
            )}

            {richtigerTurnus && (
                <div className={`rounded-lg border border-sandy-brown bg-warning-background px-4 py-3 text-dark-khaki shadow-lg transition-all
                                duration-1000 ease-in-out ${richtigerTurnusSichtbar ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                        Achtung! Das Modul gehört in das {richtigerTurnus}. 
                </div>

            )}
        </div>
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}>
            
                <section className="flex flex-col gap-4 p-4 md:p-6">
                    {/* Responsive Header: auf Mobile etwas kleiner */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold md:text-4xl">Studienplaner</h1>
                        <p className="text-sm opacity-70 md:text-base">Plane dein Studium semesterweise</p>
                    </div>
                    <button
                        onClick={handle_Check}
                        disabled={checking}
                        className="w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-2.5 font-medium transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto shadow-sm"
                    >
                        {checking ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin text-flag-red" />
                                <span className="text-sm">Überprüfe deine Module..</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="h-4 w-4 text-mint-leaf" />
                                <span className="text-sm">Aktualität prüfen</span>
                            </>
                        )}
                    </button>

                    <div className="flex flex-col gap-6">
                        {semesterList.map((semester) => (
                            <SemesterCard
                                key={semester.nummer}
                                semester={semester.nummer}
                                module={semester.modules}
                                onClick={() => console.log(semester.nummer)}
                                proWoche={proWoche}
                                onToggleAufwand={() => setProWoche(!proWoche)}
                                currentSemester={currentSemester}
                                currentTurnus={currentTurnus}
                                onDeleteModul={entferneModulAusState}
                                checkResults={checkResults}
                            />
                        ))}
                    </div>

                     {/* Buttons auf Mobile untereinander, auf Desktop nebeneinander */}
                    <div className='flex flex-col gap-4 md:flex-row'>
                        <button onClick={handleAddSemester}
                            disabled={semesterList.length >= 20 || semesterButtonsDisabled}
                            className={`border-2 rounded-2xl border-dashed p-4 flex items-center justify-center px-6 py-4 md:w-5/6 w-full ${semesterList.length >= 20 || semesterButtonsDisabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                                }`}>
                            <Plus></Plus>Semester hinzufügen
                        </button>
                        <button onClick={() => {
                            const letztes = semesterList[semesterList.length - 1];
                            if (letztes) handleDeleteSemester(letztes.id, letztes.nummer);
                        }}
                            disabled={semesterButtonsDisabled}
                            className={`flex border-2 rounded-2xl border-flag-red md:w-1/6 w-full items-center justify-center ${semesterButtonsDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}>
                            <Trash2></Trash2>
                        </button>
                    </div>
                </section>

                <DragOverlay>
                    {activeModul ? (
                        <SemesterModulCard
                            modul={activeModul}
                            proWoche={proWoche}
                            onToggleAufwand={() => setProWoche(!proWoche)}
                            // currentSemester={currentSemester}
                            // currentTurnus={currentTurnus}
                            onDeleteModul={() => { }}
                            //checkResults={checkResults}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default Page;