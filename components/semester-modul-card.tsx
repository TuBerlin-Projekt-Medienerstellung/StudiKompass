"use client";

import Link from "next/link"
import {SquareArrowOutUpRight, Grip, Trash2} from 'lucide-react';
import ModulCardModal from '@/components/modul-card-modal';
import {useState} from "react";

type Props = {
    modul: modulInfo;
    onClick: () => void;
};

const SemesterModulCard = ({modul, onClick}: Props) => {

    const [isOpen, setIsOpen] = useState(false);
    const [selectedModul, setSelectedModul] = useState<modulInfo | null>(null);
    const valueDisplay = document.getElementById("counter-value");

    return (
        <div>
            <div onClick={onClick}
                 className="px-6 py-4 rounded-2xl border-x-4 border-y-2 border-flag-red flex flex-row gap-2 cursor-pointer">
                <div className='pr-2 py-4'>
                    <Grip/>
                </div>
                <div className='flex flex-col flex-1'>
                    <h1 className="font-bold text-lg">{modul.name}</h1>
                    <div className="flex flex-wrap items-center opacity-80 gap-3 text-sm">
                        <span className="text-flag-red">{modul.leistungspunkte} ECTS</span>
                        <span>WiSe</span>
                        <Link className="flex items-center gap-1 text-blue-bell" href="#">
                            Moses <SquareArrowOutUpRight size={14}/>
                        </Link>
                    </div>
                </div>
                <button
                    className="flex pr-2 py-4 ml-auto hover:text-red-500 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <Trash2/>
                </button>
            </div>
            <ModulCardModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                modul={selectedModul}/>
        </div>
    );
};

export default SemesterModulCard;