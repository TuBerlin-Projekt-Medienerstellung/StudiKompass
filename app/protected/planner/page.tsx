"use client";

import React from 'react'
import SemesterCard from "@/components/semester-card";
import { useState } from "react";

const modules : modulInfo[] = [
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
            
          {modules.map((m) => (
          <SemesterCard
            key={m.modul_id}
            modul={m}
            onClick={() => {
              setModul(m);
              setIsOpen(true);
            }}
          />
          ))}
        
        </section>
    )
}
export default Page
