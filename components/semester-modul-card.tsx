import React from 'react'
import Link from "next/link"
import {SquareArrowOutUpRight} from 'lucide-react';


const SemesterModulCard = () => {
    return (
        <div className="px-6 py-4 rounded-2xl border-x-4 border-y-2 border-flag-red dark:border-flag-red/65 bg-background dark:bg-[#2A1738] flex flex-col gap-2">
            <h1 className="font-bold text-lg dark:text-white">Grundlagen der Informatik</h1>
            <div className="flex opacity-80 gap-3 text-sm">
                <span className="text-flag-red">10 ECTS</span> &bull; <span>WiSe</span>&bull; <Link
                className="flex text-blue-bell dark:text-violet-ray"
                href="#">Moses <SquareArrowOutUpRight/></Link>
            </div>

        </div>
    )
}
export default SemesterModulCard
