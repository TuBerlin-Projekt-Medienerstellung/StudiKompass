"use client";

import React from 'react'
import SemesterCard from "@/components/semester-card";
import { useState } from "react";
import {Plus, Trash2} from 'lucide-react';
import { createSemester, deleteSemester, updateSemesterTable } from './actions';

{/** Dummy Daten zum testen, nach Semester gruppiert, werden durch Fetches aus Supabase ersetzt
  Wie aus Semester_ID tatsächliche Nummer des Semesters erhalten? */}
const semesters = [
  {
    nummer: 1,
    modules: [
      {
        modul_id: "6065ee7e-b9dc-4b90-99de-b91b034e998c",
        name: "Mathe 1",
        leistungspunkte: 5,
        semester: "WiSe",
        modulArt: "Pflicht",
        beschreibung: "Lorem ipsum",
        examform: "Klausur",
        arbeitsaufwand: 150,
        link: "/moses",
        versuche: 1,
      },
    ],
  },
];
  
const Page = () => {

    
    const [isOpen, setIsOpen] = useState(false);
    const [modul, setModul] = useState<modulInfo | null>(null);
    const [semesterList, setSemesterList] = useState<typeof semesters>(semesters);
    const lastSemester = semesterList.at(-1);
        if (!lastSemester) return null;
    const maxNummer = semesterList.length
        ? Math.max(...semesterList.map((s) => s.nummer))
        : 0;

    async function handleAddSemester() {
         await updateSemesterTable( Math.max(...semesterList.map((s) => s.nummer)));

        const neueNummer =
        Math.max(...semesterList.map((s) => s.nummer)) + 1;

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

    return (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
                <h1 className="font-bold text-4xl">Studienplaner</h1>
                <p className="opacity-70">Plane dein Studium semesterweise</p>
          </div>
        

        {semesterList.map((semester) => (
        <SemesterCard
            key={semester.nummer}
            semester = {semester.nummer}
            module={semester.modules}
            onClick={() => console.log(semester.nummer)}
          />
        ))}
        
        <div className='flex flex-row gap-4'>
          <button   onClick={handleAddSemester}
                    className='border-2 rounded-2xl border-dashed p-4 flex cursor-pointer items-center justify-center px-6 py-4 md:w-5/6 w-full'>
            <Plus></Plus>Semester hinzufügen
          </button>
          <button   onClick={() => handleDeleteSemester(semesterList[semesterList.length - 1].nummer)}
                    className='flex border-2 rounded-2xl border-flag-red cursor-pointer md:w-1/6 w-full items-center justify-center'>
            <Trash2></Trash2>
          </button>
        </div>
        
  
        </section>
    )
}
export default Page
