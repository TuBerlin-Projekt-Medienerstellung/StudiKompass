"use client";

import {ChevronUp, ChevronDown, Circle, CircleCheckBig, SquareArrowOutUpRight} from 'lucide-react';
import {ladeDetailedModulAction} from '@/app/protected/modules/actions';
import Link from "next/link";
import {useState} from 'react';
import ModulFeedback from "./modul-feedback";

interface modulInfo {
    modul_id: number;
    name: string;
    leistungspunkte: number;
    semester?: string | number;
    modulArt: string;
    link: string;
    beschreibung?: string;
    lernergebnisse?: string;
    voraussetzungen?: string;
    pruefungsform?: string;
    pruefungselemente?: string[];
    benotet?: boolean | null;
    pruefungsBeschreibung?: string;
    lehrlernformen?: string;
}

const ModulCard = (props: modulInfo) => {
    const {
        modul_id,
        name,
        leistungspunkte,
        semester,
        modulArt,
        link,
        beschreibung,
        lernergebnisse,
        voraussetzungen,
        pruefungsform,
        pruefungselemente,
        benotet,
        pruefungsBeschreibung,
    } = props;

    const [liked, setLiked] = useState(true);
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<Partial<modulInfo> | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    async function handleAusklappen() {
        setOpen(!open);
        if (!open && !details) {
            setLoadingDetails(true);
            const data = await ladeDetailedModulAction(modul_id);
            if (data) {
                setDetails(data);
            }
            setLoadingDetails(false);
        }
    }

    const detailBoxen = [
        {name: "Prüfungsform", value: details?.pruefungsform ?? "—"},
        {name: "Benotet", value: details?.benotet !== undefined ? (details?.benotet ? "Ja" : "Nein") : "—"},
        {name: "Voraussetzungen", value: details?.voraussetzungen ?? "—"},
    ];

    const isWahlpflicht = modulArt.toLowerCase().includes("wahlpflicht");
    const moduleBorderClass = isWahlpflicht
        ? "border-l-flag-red border-r-flag-red dark:border-l-emerald-400 dark:border-r-emerald-400"
        : "border-l-flag-red border-r-flag-red dark:border-l-flag-red dark:border-r-flag-red";

    return (
        <div className={`w-full flex flex-col border-y-2 border-x-4 border-border ${moduleBorderClass} bg-background dark:bg-card rounded-xl px-6 pt-4 transition-all duration-700 ${open ? 'pb-6' : 'pb-4'}`}>
            <header className='w-full flex justify-between items-center'>
                <div className='flex w-fit gap-2.5'>
                    <button onClick={() => setLiked(!liked)}>
                        {liked ? <CircleCheckBig className="text-mint-leaf"/> : <Circle/>}
                    </button>
                    <div className='flex gap-6 items-center md:flex-row flex-col'>
                        <h1 className='font-bold md:text-2xl text-xl'>{name}</h1>
                        <div className='flex gap-2'>
                            <div>{leistungspunkte} ECTS</div>
                            <span>• {semester} •</span>
                            <p className='text-blue-bell dark:text-violet-ray'>{modulArt}</p>
                        </div>
                    </div>
                </div>
                <div className="cursor-pointer" onClick={handleAusklappen}>
                    {open ? <ChevronUp/> : <ChevronDown/>}
                </div>
            </header>

            <div
                className={`grid transition-all duration-700 ease-in-expo ${open ? 'grid-rows-[1fr] mt-5' : 'grid-rows-[0fr] mb-0'}`}>
                <div className='overflow-hidden'>
                    <div className='flex flex-col gap-y-5'>
                        {/* Beschreibung / Lernergebnisse */}
                        <div>
                            <h2 className='font-semibold text-lg'>Lernergebnisse</h2>
                            <p className='opacity-80'>{details?.lernergebnisse ?? beschreibung ?? "—"}</p>
                        </div>

                        {/* Prüfungselemente falls vorhanden */}
                        {pruefungselemente && pruefungselemente.length > 0 && (
                            <div>
                                <h2 className='font-semibold text-lg'>Prüfungselemente</h2>
                                <ul className='list-disc list-inside opacity-80'>
                                    {pruefungselemente.map((el, i) => (
                                        <li key={i}>{el}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Detail Boxen */}
                        <div className='flex justify-between gap-2 md:flex-row flex-col'>
                            {detailBoxen.map((detail, index) => (
                                <div key={index} className='bg-[#E3E6EA] dark:bg-[#16081f] flex border-2 border-border rounded-xl w-full items-center p-4 flex-col'>
                                    <span>{detail.name}</span>
                                    <p className='font-bold'>{detail.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className='flex rounded-lg gap-2'>
                            <button className='bg-violet-ray hover:bg-blue-bell text-white px-4 py-2 rounded-lg w-5/6 transition-colors'>
                                Zum Planer hinzufügen
                            </button>
                            {details?.link ? (
                                <Link
                                    href={details.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className='bg-flag-red text-white w-1/6 px-4 py-2 rounded-lg flex items-center justify-center gap-2'
                                >
                                    zu Moses
                                    <SquareArrowOutUpRight className='justify-self-end'/>
                                </Link>
                            ) : (
                                <span
                                    className='bg-gray-300 text-white w-1/6 px-4 py-2 rounded-lg flex items-center justify-center gap-2 opacity-50 cursor-not-allowed'>
                                    zu Moses
                                    <SquareArrowOutUpRight/>
                                </span>
                            )}
                        </div>
                        <ModulFeedback modulId={modul_id} modulName={name}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModulCard;
