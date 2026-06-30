"use client";

import SemesterModulCard from "@/components/semester-modul-card";
import {Plus} from 'lucide-react';
import Link from "next/link";
import {useDroppable} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";

type Props = {
    semester: number;
    module: modulInfo[];
    onClick: () => void;
};

const SemesterCard = ({semester, module, onClick}: Props) => {

    const totalECTS = module.reduce((sum, modul) => sum + modul.leistungspunkte, 0);
    const {setNodeRef} = useDroppable({id: `semester-${semester}`});

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className="flex w-full min-w-0 cursor-pointer flex-col gap-4 rounded-2xl border-2 bg-card p-4">
            {/* Header auf Mobile enger, ECTS rechts bündig */}
            <header className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-bold sm:text-xl">{semester}. Semester</h2>
                    <p className="text-sm opacity-70">
                        {module.length} {module.length === 1 ? "Modul" : "Module"}
                    </p>
                </div>

                <div className="shrink-0 text-right">
                    <h2 className="text-lg font-bold text-oxblood sm:text-xl">{totalECTS}</h2>
                    <p className="text-sm">ECTS</p>
                </div>
            </header>

            <SortableContext
                items={module.map(modul => String(modul.modul_id))}
                strategy={verticalListSortingStrategy}>
                <div className="flex min-h-16 flex-col gap-3">
                    {module.map((modul) => (
                        <SemesterModulCard
                            key={modul.modul_id}
                            modul={modul}
                        />
                    ))}
                </div>
            </SortableContext>

            {/** Button leitet zur Modulsuche weiter */}
            <Link
                href="/protected/modules"
                className="mt-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-4 text-sm sm:px-6 sm:text-base"
                onClick={(e) => e.stopPropagation()}>
                <Plus className="h-5 w-5 shrink-0"/>
                <span>Modul hinzufügen</span>
            </Link>
        </div>
    );
};

export default SemesterCard;