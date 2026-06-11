"use client";

import {ChevronUp, ChevronDown, Circle, CircleCheckBig, SquareArrowOutUpRight} from 'lucide-react';
import {details} from "@/constants";
import Link from "next/link";
import {useState} from 'react';

const ModulCard = (props: modulInfo) => {

    const [liked, setLiked] = useState(true);
    const [open, setOpen] = useState(false);
    //
    // function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    //     setLiked(e.target.checked);
    // }

    const {
        name,
        leistungspunkte,
        semester,
        modulArt,
        beschreibung,
        link
    } = props;

    const isWahlpflicht = modulArt.toLowerCase().includes("wahlpflicht");
    const moduleBorderClass = isWahlpflicht
        ? "border-l-flag-red border-r-flag-red dark:border-l-emerald-400 dark:border-r-emerald-400"
        : "border-l-flag-red border-r-flag-red dark:border-l-flag-red dark:border-r-flag-red";

    return (
        <div
            className={`w-full flex flex-col border-y-2 border-x-4 border-border ${moduleBorderClass} bg-background dark:bg-card rounded-xl px-6 pt-4 transition-all duration-700 ${open ? 'pb-6' : 'pb-4'}`}>
            <header className='w-full flex justify-between items-center'>
                <div className='flex w-fit gap-2.5 '>
                    {/**Button Modul erledigt oder nicht*/}

                    <button onClick={() => setLiked(!liked)}>
                        {liked ? <CircleCheckBig className="text-mint-leaf"/> : <Circle/>}
                    </button>

                    <div className='flex gap-6 items-center md:flex-row flex-col'>
                        {/** Hier fetchen für den Titel **/}
                        <h1 className='font-bold md:text-2xl text-xl'>{name}</h1>
                        <div className='flex gap-2'>
                            {/** Hier fetchen für Infos **/}
                            <div>{leistungspunkte} ECTS</div>
                            <span className=''>• {semester} •</span>
                            {/** Color angepasst auf Pflicht/Wahlpflicht/wahlt **/}
                            <p className='text-blue-bell dark:text-violet-ray'>{modulArt}</p>
                        </div>
                    </div>

                </div>
                {/** Hier wird die Modulkarte ausgeklappt */}
                <div className="cursor-pointer" onClick={() => setOpen(!open)}>
                    {open ? <ChevronUp/> : <ChevronDown/>}
                </div>
            </header>

            {/** Zusatzinformationen, die beim ausklappen gezeigt werden*/}

            <div
                className={`grid transition-all duration-700 ease-in-expo ${open ? 'grid-rows-[1fr] mt-5' : 'grid-rows-[0fr] mb-0'}`}>
                <div className='overflow-hidden'>
                    <div className='flex flex-col gap-y-5'>
                        <div>
                            <h2 className='font-semibold text-lg'>Beschreibung</h2>
                            {/** Hier fetchen für die Beschreibung **/}
                            <p className='opacity-80'>
                                {beschreibung}
                            </p>
                        </div>
                        <div className='flex justify-between gap-2 md:flex-row flex-col'>
                            {/** Hier fetchen für die Details, gerade werden dummy daten von constants gefetchtet **/}
                            {details.map((detail, index) => (
                                <div key={index}
                                     className='bg-[#E3E6EA] dark:bg-[#16081f] flex border-2 border-border rounded-xl w-full items-center p-4 flex-col'>
                        <span>
                            {detail.name}
                        </span>
                                    <p className='font-bold'>
                                        {detail.value}
                                    </p>
                                </div>
                            ))}


                        </div>
                        <div className='flex rounded-lg gap-2'>
                            <button className='bg-violet-ray hover:bg-blue-bell text-white px-4 py-2 rounded-lg w-5/6 transition-colors'>
                                Zum Planer hinzufügen
                            </button>
                            {/** Hier Link von Moses einfügen */}
                            <Link href={link}
                                  className='bg-flag-red text-white w-1/6 px-4 py-2 rounded-lg flex items-center justify-center gap-2'>
                                zu Moses
                                <SquareArrowOutUpRight className='justify-self-end'/>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ModulCard;
