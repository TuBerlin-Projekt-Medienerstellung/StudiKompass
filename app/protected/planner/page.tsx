"use client";

import React from 'react'
import SemesterCard from "@/components/semester-card";
import { useState } from "react";
import {Plus, Trash2} from 'lucide-react';
import { createSemester, deleteSemester } from './actions';

{/** Dummy Daten zum testen, nach Semester gruppiert, werden durch Fetches aus Supabase ersetzt
  Wie aus Semester_ID tatsächliche Nummer des Semesters erhalten? */}
const semesters = [
  {
    nummer: 1,
    modules: [
      {
        modul_id: 345,
        name: "Mathe 1",
        leistungspunkte: 5,
        semester: "WiSe",
        modulArt: "Pflicht",
        beschreibung: "Lorem ipsum",
        examform: "Klausur",
        arbeitsaufwand: 150,
        link: "/moses",
      },
      {
        modul_id: 3648,
        name: "Programmierung",
        leistungspunkte: 5,
        semester: "WiSe",
        modulArt: "Pflicht",
        beschreibung: "Lorem ipsum",
        examform: "Projekt",
        arbeitsaufwand: 120,
        link: "/moses",
      },
    ],
  },

  {
    nummer: 2,
    modules: [
      {
        modul_id: 999,
        name: "Mathe 2",
        leistungspunkte: 5,
        semester: "SoSe",
        modulArt: "Pflicht",
        beschreibung: "Lorem ipsum",
        examform: "Klausur",
        arbeitsaufwand: 150,
        link: "/moses",
      },
    ],
  },
];
  
const Page = () => {

    
    const [isOpen, setIsOpen] = useState(false);
    const [modul, setModul] = useState<modulInfo | null>(null);
    const [semesterList, setSemesterList] = useState(semesters);

    async function handleAddSemester() {
        const neuesSemester = await createSemester();

        setSemesterList((prev) => [
            ...prev,
            neuesSemester,
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
