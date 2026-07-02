"use client";

import SemesterModulCard from "@/components/semester-modul-card";
import {Plus} from 'lucide-react';
import Link from "next/link";
import {useDroppable} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import { handleModule } from '@/lib/utils';

type Props = {
    semester: number;
    module: modulInfo[];
    onClick: () => void;
};

const SemesterCard = ({semester, module, onClick}: Props) => {

    const totalECTS = module.reduce((sum, modul) => sum + modul.leistungspunkte, 0);
    const {setNodeRef} = useDroppable({id: `semester-${semester}`});

    return (
        <div ref={setNodeRef} onClick={onClick} className="border-2 rounded-2xl p-4 gap-4 flex flex-col cursor-pointer bg-card">
            <header className="flex justify-between">
                <div>
                    <h2 className="font-bold text-xl">{semester}. Semester</h2>
                    <p className="opacity-70 text-sm">{module.length} {module.length === 1 ? "Modul" : "Module"}</p>
                </div>

                <div className="text-right">
                    <h2 className="font-bold text-xl text-oxblood">{totalECTS}</h2>
                    <p>ECTS</p>
                </div>
            </header>

            <SortableContext items={module.map(modul => handleModule(modul.modul_id))} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2 min-h-15">
                    {module.map((modul) => (
                        <SemesterModulCard key={handleModule(modul.modul_id)} modul={modul} />
                    ))}
                </div>
            </SortableContext>

            {/** Button leitet zur Modulsuche weiter */}
            <Link href="/protected/modules" className="border-2 border-dashed rounded-2xl flex items-center justify-center px-6 py-4 mt-2" onClick={(e) => e.stopPropagation()}>
                <Plus />
                <span>Modul hinzufügen</span>
            </Link>
        </div>
    );
};

export default SemesterCard;