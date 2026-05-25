"use client";

import React from 'react'
import SemesterCard from "@/components/semester-card";
import ModulCardModal from '@/components/modul-card-modal';


  
const Page = () => {

    const modul = {
        name: "Web Engineering",
        leistungspunkte: 5,
        semester: "WS",
        modulArt: "Pflichtmodul",
        beschreibung:
        "Einführung in moderne Webtechnologien.",
        examform: "Klausur",
        arbeitsaufwand: "150 Stunden",
        link: "https://example.com",
    };

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="font-bold text-4xl">Studienplaner</h1>
                <p className="opacity-70">Plane dein Studium semesterweise</p>
            </div>
            <SemesterCard/>
            <ModulCardModal
            isOpen={true}
            onClose={() => {}}
            modul={modul}/>
        </section>
    )
}
export default Page
