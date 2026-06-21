"use client";

import React from 'react'
import SemesterCard from "@/components/semester-card";
import { useState } from "react";
import {Plus} from 'lucide-react';

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

    return (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
                <h1 className="font-bold text-4xl">Studienplaner</h1>
                <p className="opacity-70">Plane dein Studium semesterweise</p>
          </div>
        

        {semesters.map((semester) => (
        <SemesterCard
            key={semester.nummer}
            semester = {semester.nummer}
            module={semester.modules}
            onClick={() => console.log(semester.nummer)}
          />
        ))}

        {/**Fügt nächste Semesterkarte hinzu -> neue Karte mit semester.length+1 */}
        <button className='border-2 rounded-2xl border-dashed p-4 flex cursor-pointer flex items-center justify-center px-6 py-4'>
          <Plus></Plus>Semester hinzufügen
        </button>
  
        </section>
    )
}
export default Page
