"use client";

import {ChevronUp, ChevronDown, Circle, CircleCheckBig, SquareArrowOutUpRight} from 'lucide-react';
import { ladeDetailedModulAction } from '@/app/protected/modules/actions';
import Link from "next/link";
import {useState} from 'react';

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
            if (data){
                setDetails(data);}
            setLoadingDetails(false);
        }
    }

    const detailBoxen = [
        { name: "Prüfungsform", value: details?.pruefungsform ?? "—" },
        { name: "Benotet", value: details?.benotet !== undefined ? (details?.benotet ? "Ja" : "Nein") : "—" },
        { name: "Voraussetzungen", value: details?.voraussetzungen ?? "—" },
    ];

    return (
        <div className={`w-full flex flex-col border-y-2 border-x-4 rounded-xl px-6 pt-4 transition-all duration-700 ${open ? 'pb-6' : 'pb-4'}`}>
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
                            <p className='text-blue-bell'>{modulArt}</p>
                        </div>
                    </div>
                </div>
                <div className="cursor-pointer" onClick={handleAusklappen}>
                    {open ? <ChevronUp/> : <ChevronDown/>}
                </div>
            </header>

            <div className={`grid transition-all duration-700 ease-in-expo ${open ? 'grid-rows-[1fr] mt-5' : 'grid-rows-[0fr] mb-0'}`}>
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
                                <div key={index} className='bg-[#E3E6EA] flex border-2 rounded-xl w-full items-center p-4 flex-col'>
                                    <span>{detail.name}</span>
                                    <p className='font-bold'>{detail.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className='flex rounded-lg gap-2'>
                            <button className='bg-violet-ray text-white px-4 py-2 rounded-lg w-5/6'>
                                Zum Planer hinzufügen
                            </button>
                            <Link href={link} className='bg-flag-red text-white w-1/6 px-4 py-2 rounded-lg flex items-center justify-center gap-2'>
                                zu Moses 
                                <SquareArrowOutUpRight className='justify-self-end'/>
                                {/* need ids and version for the moses link : should be props in normal module fetch */}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModulCard;