import React from 'react'
import SemesterModulCard from "@/components/semester-modul-card";
import {Plus} from 'lucide-react';

type modulInfo = {
    name: string;
    leistungspunkte: number;
    semester: string;
    modulArt: string;
    beschreibung: string;
    examform: string;
    arbeitsaufwand: string;
    link: string;
}

type Props = {
  modul: modulInfo;
  onClick: () => void;
};

const SemesterCard = ({modul, onClick }: Props) => {
    return (
        <div onClick={onClick} className="border-2 rounded-2xl p-4 gap-4 flex flex-col cursor-pointer">
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

            <SemesterModulCard 
                modul={modul}
                onClick={() => {
                console.log(modul.name);}}/>

            <button className="border-2 border-dashed rounded-2xl flex items-center justify-center px-6 py-4">
                <Plus/> Modul hinzufügen
            </button>
        </div>
    )
}
export default SemesterCard
