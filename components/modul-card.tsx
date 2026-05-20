"use client";

import {ChevronUp, ChevronDown, Circle, CircleCheckBig, SquareArrowOutUpRight} from 'lucide-react';
import {details} from "@/constants";
import Link from "next/link";
import {useState} from 'react';

const ModulCard = () => {

    const [liked, setLiked] = useState(true);
    const [open, setOpen] = useState(false);
    //
    // function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    //     setLiked(e.target.checked);
    // }

    return (
        <div
            className={`w-full flex flex-col border-y-2 border-x-4 rounded-xl px-6 pt-4 transition-all duration-700 ${open ? 'pb-6' : 'pb-4'}`}>
            <header className='w-full flex justify-between items-center'>
                <div className='flex w-fit gap-2.5 '>
                    {/**Button Modul erledigt oder nicht*/}

                    <button onClick={() => setLiked(!liked)}>
                        {liked ? <CircleCheckBig className="text-mint-leaf"/> : <Circle/>}
                    </button>

                    <div className='flex gap-6 items-center md:flex-row flex-col'>
                        {/** Hier fetchen für den Titel **/}
                        <h1 className='font-bold md:text-2xl text-xl'>Software Entwicklung</h1>
                        <div className='flex gap-2'>
                            {/** Hier fetchen für Infos **/}
                            <div>6 ECTS</div>
                            <span className=''>• Sose •</span>
                            {/** Color angepasst auf Pflicht/Wahlpflicht/wahlt **/}
                            <p className='text-blue-bell'>Wahlpflichtmodul</p>
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
                                Im Projekt bearbeiten die Studierenden selbstständig in Gruppenarbeit konkrete Probleme.
                                Ein
                                grundsätzliches Projektthema wird vorgegeben, die Ausgestaltung kann in der Gruppe und
                                unter
                                Absprache mit der gruppenleitenden Person selbständig definiert werden. Fortschritte
                                werden
                                in regelmäßigen Absprachen Betreuern besprochen, die Ergebnisse werden in einer
                                Zwischen-
                                sowie in einer Abschlusspräsentation vor allen Teilnehmenden des Kurses vorgestellt
                                sowie
                                den Betreuern einem Projektbericht niedergelegt.
                            </p>
                        </div>
                        <div className='flex justify-between gap-2 md:flex-row flex-col'>
                            {/** Hier fetchen für die Details, gerade werden dummy daten von constants gefetchtet **/}
                            {details.map((detail, index) => (
                                <div key={index}
                                     className='bg-[#E3E6EA] flex border-2 rounded-xl w-full items-center p-4 flex-col'>
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
                            <button className='bg-violet-ray text-white px-4 py-2 rounded-lg w-5/6'>
                                Zum Planer hinzufügen
                            </button>
                            {/** Hier Link von Moses einfügen */}
                            <Link href="#"
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