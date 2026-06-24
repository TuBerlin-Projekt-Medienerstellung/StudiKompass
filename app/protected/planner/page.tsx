"use client";

import SemesterCard from "@/components/semester-card";
import SemesterModulCard from "@/components/semester-modul-card";
import { useState, useEffect } from "react";
import {Plus, Trash2} from 'lucide-react';
import { createSemester, deleteSemester, updateSemesterTable, getSemesters } from './actions';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';


type Semester = {
  nummer: number;
  modules: modulInfo[];
};

type SemesterList = Semester[];
  
const Page = () => {

    
    const [isOpen, setIsOpen] = useState(false);
    const [modul, setModul] = useState<modulInfo | null>(null);
    const [semesterList, setSemesterList] = useState<SemesterList>([]);
    const maxNummer = semesterList.length
        ? Math.max(...semesterList.map((s) => s.nummer))
        : 0;
    const [activeModul, setActiveModul] = useState<modulInfo | null>(null);

    useEffect(() => {
  async function loadSemesters() {
    const data = await getSemesters();

    setSemesterList(
      data.map((s) => ({
        nummer: s.semesterzahl,
        modules: [],
      }))
    );
  }

  loadSemesters();
}, []);

    async function handleAddSemester() {
      const maxNummer =
        semesterList.length > 0
          ? Math.max(...semesterList.map((s) => s.nummer))
          : 0;

      const neueNummer = maxNummer + 1;

      await updateSemesterTable(neueNummer);

      setSemesterList((prev) => [
        ...prev,
        {
          nummer: neueNummer,
          modules: [],
        },
      ]);
    }

  async function handleDeleteSemester(semesterNummer: number) {
    await deleteSemester();

    setSemesterList((prev) =>
      prev.filter((sem) => sem.nummer !== semesterNummer)
    );
  }

  const findSemesterByModulId = (modulId: string) => {
    return semesterList.find(s => s.modules.some(m => m.modul_id === modulId)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    // Durchsuche alle Semester nach dem Modul mit dieser ID
    for (const sem of semesterList) {
      const gefunden = sem.modules.find(m => m.modul_id === activeId);
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
      const targetSem = semesterList.find(s => s.modules.some(m => m.modul_id === overModulId));
      if (!targetSem) return;
      targetSemesterNummer = targetSem.nummer;
    }

    const sourceSemester = findSemesterByModulId(activeModulId);
    if (!sourceSemester || !targetSemesterNummer) return;

    const newSemesters = [...semesterList];
    const sourceSemIndex = newSemesters.findIndex(s => s.nummer === sourceSemester.nummer);
    const targetSemIndex = newSemesters.findIndex(s => s.nummer === targetSemesterNummer);


    // FALL 1: Innerhalb desselben Semesters verschieben (Reihenfolge ändern)
    if (sourceSemester.nummer === targetSemesterNummer) {
      const sem = newSemesters[sourceSemIndex];
      const oldIndex = sem.modules.findIndex(m => m.modul_id === activeModulId);
      let newIndex = sem.modules.findIndex(m => String(m.modul_id) === String(over.id));
      if (newIndex === -1) newIndex = sem.modules.length - 1;

      sem.modules = arrayMove(sem.modules, oldIndex, newIndex);
      setSemesterList(newSemesters);
    }
    // FALL 2: In ein anderes Semester rüberschieben
    else {
      const sourceSem = newSemesters[sourceSemIndex];
      const targetSem = newSemesters[targetSemIndex];

      const modulIndex = sourceSem.modules.findIndex(m => m.modul_id === activeModulId);
      const [movedModul] = sourceSem.modules.splice(modulIndex, 1);

      let newIndex = targetSem.modules.findIndex(m => String(m.modul_id) === String(over.id));
      if (newIndex === -1) newIndex = targetSem.modules.length;

      targetSem.modules.splice(newIndex, 0, movedModul);
      setSemesterList(newSemesters);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <section className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-4xl">Studienplaner</h1>
          <p className="opacity-70">Plane dein Studium semesterweise</p>
        </div>

        <div className="flex flex-col gap-6">
          {semesterList.map((semester) => (
            <SemesterCard
              key={semester.nummer}
              semester={semester.nummer}
              module={semester.modules}
              onClick={() => console.log(semester.nummer)}
            />
          ))}
        </div>

        <div className='flex flex-row gap-4'>
          <button onClick={handleAddSemester}
            className='border-2 rounded-2xl border-dashed p-4 flex cursor-pointer items-center justify-center px-6 py-4 md:w-5/6 w-full'>
            <Plus></Plus>Semester hinzufügen
          </button>
          <button onClick={() => handleDeleteSemester(semesterList[semesterList.length - 1].nummer)}
            className='flex border-2 rounded-2xl border-flag-red cursor-pointer md:w-1/6 w-full items-center justify-center'>
            <Trash2></Trash2>
          </button>
        </div>
      </section>

      <DragOverlay>
        {activeModul ? (
          <SemesterModulCard modul={activeModul} onClick={() => { }} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Page;
