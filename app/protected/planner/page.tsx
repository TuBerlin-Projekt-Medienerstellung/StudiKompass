"use client";

import SemesterCard from "@/components/semester-card";
import SemesterModulCard from "@/components/semester-modul-card";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from 'lucide-react';
import { reduceSemesterTable, deleteSemester, createSemester, updateSemesterTable, getSemesters, getSemestersMitModulen, verschiebeModul, loescheSemesterMitModulen, getProfilTurnus } from './actions';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';


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

    async function handleAddSemester() {
        // Grenze: maximal 20 Semester (konsistent mit den Settings)
        if (semesterList.length >= 20) {
            return;   // nichts tun, Grenze erreicht
        }

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
    }

    async function handleDeleteSemester(semesterId: string, semesterNummer: number) {
        await deleteSemester();                        // zieht max_semester runter (profiles)
        await loescheSemesterMitModulen(semesterId);   // löscht Semester + Module

        setSemesterList((prev) => prev.filter((sem) => sem.id !== semesterId));
    }

    // Entfernt ein Modul aus dem State (nach dem Löschen aus der DB).
    function entferneModulAusState(modulId: string) {
        setSemesterList((prev) =>
            prev.map((sem) => ({
                ...sem,
                modules: sem.modules.filter((m) => String(m.modul_id) !== modulId),
            }))
        );
    }
    const getModuleId = (m: modulInfo) => String((m as any)?.modul_id?.value ?? (m as any)?.modul_id);

    const findSemesterByModulId = (modulId: string) => {
        return semesterList.find(s => s.modules.some(m => String(m.modul_id) === modulId)
        );
    };

    const handleDragStart = (event: DragStartEvent) => {
        const activeId = String(event.active.id);
        // Durchsuche alle Semester nach dem Modul mit dieser ID
        for (const sem of semesterList) {
            const gefunden = sem.modules.find(
                m => String(m.modul_id) === activeId
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
            const targetSem = semesterList.find(s => s.modules.some(m => String(m.modul_id) === overModulId));
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
            const oldIndex = sem.modules.findIndex(m => String(m.modul_id) === activeModulId);
            let newIndex = sem.modules.findIndex(m => String(m.modul_id) === String(over.id));
            if (newIndex === -1) newIndex = sem.modules.length - 1;

            sem.modules = arrayMove(sem.modules, oldIndex, newIndex);
            setSemesterList(newSemesters);
        }
        // FALL 2: In ein anderes Semester rüberschieben
        else {
            const sourceSem = newSemesters[sourceSemIndex];
            const targetSem = newSemesters[targetSemIndex];

            const modulIndex = sourceSem.modules.findIndex(m => String(m.modul_id) === activeModulId);
            const [movedModul] = sourceSem.modules.splice(modulIndex, 1);

            let newIndex = targetSem.modules.findIndex((m) => getModuleId(m) === String(over.id));
            if (newIndex === -1) newIndex = targetSem.modules.length;

            targetSem.modules.splice(newIndex, 0, movedModul);
            setSemesterList(newSemesters);

            verschiebeModul(String(movedModul.modul_id), targetSem.id);
        }
    };

    return (
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
                        />
                    ))}
                </div>

                {/* Buttons auf Mobile untereinander, auf Desktop nebeneinander */}
                <div className='flex flex-col gap-4 md:flex-row'>
                    <button onClick={handleAddSemester}
                        disabled={semesterList.length >= 20}
                        className={`border-2 rounded-2xl border-dashed p-4 flex items-center justify-center px-6 py-4 md:w-5/6 w-full ${semesterList.length >= 20
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                            }`}>
                        <Plus></Plus>Semester hinzufügen
                    </button>
                    <button onClick={() => {
                        const letztes = semesterList[semesterList.length - 1];
                        if (letztes) handleDeleteSemester(letztes.id, letztes.nummer);
                    }}
                        className='flex border-2 rounded-2xl border-flag-red cursor-pointer md:w-1/6 w-full items-center justify-center'>
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
                        onDeleteModul={() => { }}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default Page;