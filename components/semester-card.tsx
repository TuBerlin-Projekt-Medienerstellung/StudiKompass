"use client";

import SemesterModulCard from "@/components/semester-modul-card";
import ModulCardModal from '@/components/modul-card-modal';
import {Plus} from 'lucide-react';
import { useState } from "react";
import Link from "next/link";

{/** bekommt alle Module eines Semesters in einem Array von type modulInfo*/}
type Props = {
    semester: number;
    module: modulInfo[];
    onClick: () => void;
};

const SemesterCard = ({semester, module, onClick }: Props) => {

    const [isOpen, setIsOpen] = useState(false);
    const [selectedModul, setSelectedModul] = useState<modulInfo | null>(null);
    const totalECTS = module.reduce ((sum, modul) => sum + modul.leistungspunkte,0);
    

    return (
        <div onClick={onClick} className="border-2 rounded-2xl p-4 gap-4 flex flex-col cursor-pointer">
            <header className="flex justify-between">
                <div>
                    {/** Hier fehlen Funktionen, die die Infos dynamisch füllen:
                     * Welches Semester? Wie viele Module im Semester? Summe ECTS aller Module im Semester?
                     */}
                    <h2 className="font-bold text-xl">{semester}. Semester
                    </h2>
                    <p className="opacity-70 text-sm">{module.length} { module.length === 1? "Modul":"Module"}</p>
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-xl text-oxblood">{totalECTS}</h2>
                    <p>ECTS</p>
                </div>
            </header>

            {module.map((modul) => (
            <SemesterModulCard 
                key={modul.modul_id}
                modul={modul}
                onClick={() => {
                console.log(modul.name);setSelectedModul(modul);
              setIsOpen(true);}}/>
            ))}

            {/** Button soll zu Modulsuche leiten um von da Module hinzufügen zu können */}
            <Link href="/protected/modules"
            className="border-2 border-dashed rounded-2xl flex items-center justify-center px-6 py-4"
            >
                <Plus />
                <span>Modul hinzufügen</span>
            </Link>
            
            <ModulCardModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                modul={selectedModul}/>
        </div>
    )
}
export default SemesterCard
