import React from 'react'
import Link from "next/link"
import {SquareArrowOutUpRight} from 'lucide-react';


const SemesterModulCard = () => {
    return (
        <div className="px-6 py-4 rounded-2xl border-x-4 border-y-2 border-flag-red flex flex-col gap-2">
            <h1 className="font-bold text-lg">Grundlagen der Informatik</h1>
            <div className="flex opacity-80 gap-3 text-sm">
                <span className="text-flag-red">10 ECTS</span> &bull; <span>WiSe</span>&bull; <Link
                className="flex text-blue-bell"
                href="#">Moses <SquareArrowOutUpRight/></Link>
            </div>

        </div>
    )
}
export default SemesterModulCard
