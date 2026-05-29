"use client";

import React from 'react'
import SemesterCard from "@/components/semester-card";
import ModulCardModal from '@/components/modul-card-modal';
import { useState } from "react";

type ModulInfo = {
  name: string;
  leistungspunkte: number;
  semester: string;
  modulArt: string;
  beschreibung: string;
  examform: string;
  arbeitsaufwand: string;
  link: string;
  dozent: string;
};

const modules : ModulInfo[] = [
  {
    name: "Mathe 1",
    leistungspunkte: 5,
    semester: "WiSe",
    modulArt: "Pflicht",
    beschreibung: "Lorem ipsum",
    examform: "Klausur",
    arbeitsaufwand: "150h",
    link: "/moses",
    dozent: "Prof. Müller",
  },
  {
    name: "Programmierung",
    leistungspunkte: 5,
    semester: "WiSe",
    modulArt: "Pflicht",
    beschreibung: "Lorem ipsum",
    examform: "Projekt",
    arbeitsaufwand: "120h",
    link: "/moses",
    dozent: "Prof. Maier"
  },
];
  
const Page = () => {

    
    const [isOpen, setIsOpen] = useState(false);
    const [modul, setModul] = useState<ModulInfo | null>(null);

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="font-bold text-4xl">Studienplaner</h1>
                <p className="opacity-70">Plane dein Studium semesterweise</p>
            </div>
            
            {modules.map((m) => (
          <SemesterCard
            key={m.name}
            modul={m}
            onClick={() => {
              setModul(m);
              setIsOpen(true);
            }}
          />
          ))}
            
            <ModulCardModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                modul={modul}/>
        </section>
    )
}
export default Page
