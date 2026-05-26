import React from 'react'
import SemesterModulCard from "@/components/semester-modul-card";
import {Plus} from 'lucide-react';

const SemesterCard = () => {
    return (
        <div className="border-2 rounded-2xl p-4 gap-4 flex flex-col">
            <header className="flex justify-between">
                <div>
                    <h2 className="font-bold text-xl">1. Semester
                    </h2>
                    <p className="opacity-70 text-sm">2 Module</p>
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-xl text-oxblood">20</h2>
                    <p>ECTS</p>
                </div>
            </header>

            <SemesterModulCard/>

            <button className="border-2 border-dashed rounded-2xl flex items-center justify-center px-6 py-4">
                <Plus/> Modul hinzufügen
            </button>
        </div>
    )
}
export default SemesterCard
