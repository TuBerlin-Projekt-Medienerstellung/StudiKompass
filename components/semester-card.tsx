"use client";

import SemesterModulCard from "@/components/semester-modul-card";
import ModulCardModal from '@/components/modul-card-modal';
import { Plus } from 'lucide-react';
import { useState } from "react";
import Link from "next/link";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

{/** bekommt alle Module eines Semesters in einem Array von type modulInfo*/ }
type Props = {
    semester: number;
    module: modulInfo[];
    onClick: () => void;
};

const SemesterCard = ({ semester, module, onClick }: Props) => {

    const [isOpen, setIsOpen] = useState(false);
    const [selectedModul, setSelectedModul] = useState<modulInfo | null>(null);
    const totalECTS = module.reduce((sum, modul) => sum + modul.leistungspunkte, 0);

    const { setNodeRef } = useDroppable({ id: `semester-${semester}` });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className="border-2 rounded-2xl p-4 gap-4 flex flex-col cursor-pointer bg-card">

            <header className="flex justify-between">
                <div>
                    {/** Hier fehlen Funktionen, die die Infos dynamisch füllen:
                         * Welches Semester? Wie viele Module im Semester? Summe ECTS aller Module im Semester?
                         */}
                    <h2 className="font-bold text-xl">{semester}. Semester
                    </h2>
                    <p className="opacity-70 text-sm">{module.length} {module.length === 1 ? "Modul" : "Module"}</p>
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-xl text-oxblood">{totalECTS}</h2>
                    <p>ECTS</p>
                </div>
            </header>


            <SortableContext
                items={module.map(modul => String(modul.modul_id))}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-2 min-h-[50px]">
                    {module.map((modul) => (
                        <SemesterModulCard
                            key={modul.modul_id}
                            modul={modul}
                            onClick={() => {
                                console.log(modul.name);
                                setSelectedModul(modul);
                                setIsOpen(true);
                            }}
                        />
                    ))}
                </div>
            </SortableContext>

            {/** Button soll zu Modulsuche leiten um von da Module hinzufügen zu können */}
            <Link
                href="/protected/modules"
                className="border-2 border-dashed rounded-2xl flex items-center justify-center px-6 py-4"
                onClick={(e) => e.stopPropagation()}
            >
                <Plus />
                <span>Modul hinzufügen</span>
            </Link>

            <ModulCardModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                modul={selectedModul} />
        </div>
    )
}
export default SemesterCard
