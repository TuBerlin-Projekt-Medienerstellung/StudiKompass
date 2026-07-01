"use client";

import {
    ChevronUp,
    ChevronDown,
    Circle,
    CircleCheckBig,
    SquareArrowOutUpRight,
    BookOpen
} from 'lucide-react';
import {ladeDetailedModulAction} from '@/app/protected/modules/actions';
import Link from "next/link";
import {useState} from 'react';

interface modulInfo {
    modul_id: string;
    name: string;
    leistungspunkte: number;
    semester?: string | number;
    turnus?: string | number;
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
        turnus,
        modulArt,
        link,
        beschreibung,
        pruefungselemente,
    } = props;

    const [liked, setLiked] = useState(true);
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<Partial<modulInfo> | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showLernergebnisse, setShowLernergebnisse] = useState(false);

    const angezeigterTurnus = turnus ?? semester;

    const kurzerTurnus = angezeigterTurnus
        ?.toString()
        .replaceAll("Winter- und Sommersemester", "WiSe & SoSe")
        .replaceAll("Wintersemester", "WiSe")
        .replaceAll("Sommersemester", "SoSe");

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
        ? "border-l-mint-leaf border-r-mint-leaf"
        : "border-l-flag-red border-r-flag-red";

    return (
        <div
            className={`w-full min-w-0 flex flex-col border-y-2 border-x-4 border-border ${moduleBorderClass} bg-background dark:bg-card rounded-xl px-4 sm:px-6 pt-4 transition-all duration-700 ${open ? 'pb-6' : 'pb-4'}`}>
            <header className='flex w-full items-start justify-between gap-3'>
                <div className='flex min-w-0 flex-1 gap-3'>
                    <button onClick={() => setLiked(!liked)} className="mt-1 shrink-0">
                        {liked ? <CircleCheckBig className="text-mint-leaf"/> : <Circle/>}
                    </button>

                    <div className='flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6'>
                        <h1 className='break-words text-lg font-bold leading-tight md:text-2xl'>
                            {name}
                        </h1>

                        <div className="flex flex-col gap-1 text-sm opacity-80 md:ml-auto md:items-end">
                            {/* Desktop */}
                            <div className="hidden xl:flex items-center gap-2 whitespace-nowrap">
                                <span>{leistungspunkte} ECTS</span>
                                <span>•</span>
                                <span>{angezeigterTurnus}</span>
                                <span>•</span>
                                <p className="text-blue-bell dark:text-violet-ray">
                                    {modulArt}
                                </p>
                            </div>

                            {/* Mobile / Tablet */}
                            <div className="xl:hidden">
                                <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap">{leistungspunkte} ECTS</span>
                                    <span>•</span>
                                    <span className="whitespace-nowrap">{kurzerTurnus}</span>
                                </div>

                                <p className="mt-1 break-words text-blue-bell dark:text-violet-ray">
                                    {modulArt}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 cursor-pointer pt-1" onClick={handleAusklappen}>
                    {open ? <ChevronUp/> : <ChevronDown/>}
                </div>
            </header>

            <div
                className={`grid transition-all duration-700 ease-in-expo ${open ? 'grid-rows-[1fr] mt-5' : 'grid-rows-[0fr] mb-0'}`}>
                <div className='overflow-hidden'>
                    <div className='flex flex-col gap-y-5'>
                        {/* Beschreibung / Lernergebnisse */}
                        <div>
                            {/* Desktop: immer sichtbar */}
                            <div className="hidden md:block">
                                <h2 className="font-semibold text-lg">Lernergebnisse</h2>
                                <p className="opacity-80">
                                    {details?.lernergebnisse ?? beschreibung ?? "—"}
                                </p>
                            </div>

                            {/* Mobile: einklappbar */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setShowLernergebnisse(!showLernergebnisse)}
                                    className="w-full rounded-xl bg-[#E3E6EA] dark:bg-card border-2 border-border px-4 py-3 text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="text-flag-red shrink-0" size={20}/>

                                            <span className="font-medium">
                                                {showLernergebnisse
                                                    ? "Lernergebnisse"
                                                    : "Lernergebnisse anzeigen"}
                                            </span>
                                        </div>

                                        {showLernergebnisse ? (
                                            <ChevronUp size={18}/>
                                        ) : (
                                            <ChevronDown size={18}/>
                                        )}
                                    </div>

                                    {showLernergebnisse && (
                                        <p className="mt-3 text-sm leading-relaxed opacity-80">
                                            {details?.lernergebnisse ?? beschreibung ?? "—"}
                                        </p>
                                    )}
                                </button>
                            </div>
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
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
                            {detailBoxen.map((detail, index) => (
                                <div key={index}
                                     className='bg-[#E3E6EA] dark:bg-[#16081f] flex border-2 border-border rounded-xl w-full items-center p-4 flex-col text-center'>
                                    <span className="text-xs opacity-80 sm:text-sm">{detail.name}</span>
                                    <p className='break-words text-sm font-bold sm:text-base'>{detail.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className='flex flex-col rounded-lg gap-2 md:flex-row'>
                            <button
                                className='bg-violet-ray hover:bg-blue-bell text-white px-4 py-2 rounded-lg w-full md:w-5/6 transition-colors'>
                                Zum Planer hinzufügen
                            </button>
                            {details?.link ? (
                                <Link
                                    href={details.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className='bg-flag-red text-white w-full md:w-1/6 px-4 py-2 rounded-lg flex items-center justify-center gap-2'
                                >
                                    zu Moses
                                    <SquareArrowOutUpRight className='justify-self-end shrink-0'/>
                                </Link>
                            ) : (
                                <span
                                    className='bg-gray-300 text-white w-full md:w-1/6 px-4 py-2 rounded-lg flex items-center justify-center gap-2 opacity-50 cursor-not-allowed'>
                                    zu Moses
                                    <SquareArrowOutUpRight className="shrink-0"/>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModulCard;