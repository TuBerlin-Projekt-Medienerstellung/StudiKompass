"use client";

import SemesterModulCard from "@/components/semester-modul-card";
import ModulCardModal from '@/components/modul-card-modal';
import {Plus} from 'lucide-react';
import { useState } from "react";

type Props = {
  modul: modulInfo;
  onClick: () => void;
};

const SemesterCard = ({modul, onClick }: Props) => {

    const [isOpen, setIsOpen] = useState(false);
    const [selectedModul, setSelectedModul] = useState<modulInfo | null>(null);
    

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
                console.log(modul.name);setSelectedModul(modul);
              setIsOpen(true);}}/>

            <button className="border-2 border-dashed rounded-2xl flex items-center justify-center px-6 py-4">
                <Plus/> Modul hinzufügen
            </button>
            <ModulCardModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                modul={selectedModul}/>
        </div>
    )
}
export default SemesterCard
