"use client";

import SemesterModulCard from "@/components/semester-modul-card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { berechneTurnus, handleModule } from "@/lib/utils";
import { Module_Check_Info } from "@/components/check_modules";

type Props = {
    semester: number;
    module: modulInfo[];
    onClick: () => void;
    proWoche: boolean;
    onToggleAufwand: () => void;
    onDeleteModul: (modulId: string) => void;
    currentSemester: number | null;
    currentTurnus: string | null;
    checkResults?: Record<string, Module_Check_Info>;
};

const SemesterCard = ({ semester, module, onClick, proWoche, onToggleAufwand, onDeleteModul, currentSemester, currentTurnus, checkResults}: Props) => {
    const totalECTS = module.reduce((sum, modul) => sum + modul.leistungspunkte, 0);
    const { setNodeRef } = useDroppable({ id: `semester-${semester}` });
    const turnus = berechneTurnus(semester, currentSemester, currentTurnus);

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className="border-2 rounded-2xl p-4 gap-4 flex flex-col cursor-pointer bg-card"
        >
            <header className="flex justify-between">
                <div>
                    <h2 className="font-bold text-xl">
                        {semester}. Semester{turnus ? ` - ${turnus}` : ''}
                    </h2 >
                    <p className="opacity-70 text-sm">
                        {module.length}{" "}
                        {module.length === 1 ? "Modul" : "Module"}
                    </p>
                </div >

                <div className="text-right">
                    <h2 className="font-bold text-xl text-oxblood">
                        {totalECTS}
                    </h2>
                    <p>ECTS</p>
                </div>
            </header >

            <SortableContext
                items={module.map((modul) => handleModule(modul.modul_id))}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-2 min-h-15">
                    {module.map((modul) => {
                    // Step A: Clean up the ID so we have a simple string (e.g. "25400")
                    const modulIdKey = handleModule(modul.modul_id);

                    // Step B: Return the card, and look up "25400" inside the checkResults dictionary!
                    return (
                        <SemesterModulCard
                        key={modulIdKey}
                        modul={modul}
                        proWoche={proWoche}
                        onToggleAufwand={onToggleAufwand}
                        onDeleteModul={onDeleteModul}
                        checkInfo={checkResults?.[modulIdKey]} // <-- Grabs ONLY this card's check status!
                        />
                    );
                    })}
                </div>
            </SortableContext>

            <Link
                href="/protected/modules"
                className="border-2 border-dashed rounded-2xl flex items-center justify-center px-6 py-4 mt-2"
                onClick={(e) => e.stopPropagation()}
            >
                <Plus />
                <span>Modul hinzufügen</span>
            </Link>
        </div >
    );
};

export default SemesterCard;