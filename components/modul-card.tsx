"use client";

import {
    ChevronUp,
    ChevronDown,
    Circle,
    CircleCheckBig,
    SquareArrowOutUpRight,
    FileText,
    Clock,
    GraduationCap,
    Calendar
} from 'lucide-react';
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
    bestanden: boolean; ///muss bei den Moduldaten ergänzt werden dann wird bei bestanden die Modulkatrte grün markiert
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

    const [liked, setLiked] = useState(false);
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

    const {
        modul_id,
        name,
        leistungspunkte,
        semester,
        modulArt,
        link,
        bestanden,
        beschreibung,
        lernergebnisse,
        voraussetzungen,
        pruefungsform,
        pruefungselemente,
        benotet,
        pruefungsBeschreibung,
    } = props;

    const detailBoxen = [
    {
        name: "Prüfungsform",
        icon: FileText,
        value: details?.pruefungsform ?? "—"
    },
    {
        name: "Arbeitsaufwand",
        icon: Clock,
        value: details?.leistungspunkte ?? "—"
    },
    {
        name: "Leistungspunkte",
        icon: GraduationCap,
        value: details?.leistungspunkte ?? "—"
    },
    {
        name: "Angebot",
        icon: Calendar,
        value: details?.semester ?? "—"
    },
];

    

    return (
        <div
            className={`w-full flex flex-col border-y-2 border-x-4 rounded-xl px-6 pt-4 transition-all duration-700 ${bestanden ? "border-green-500" : ""} ${open ? 'pb-6' : 'pb-4'}`}>
            <header className="w-full flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                    <div className="mt-1 shrink-0">
                        {bestanden ? (
                            <CircleCheckBig className="text-green-500" />
                        ) : (
                        <Circle className="text-gray-400" />
                        )}
                    </div>

                    <div className="flex min-w-0 flex-col gap-1">
                        <h1 className="break-words text-lg font-bold leading-tight md:text-2xl">
                            {name}
                        </h1>

                        <div className="flex flex-wrap gap-x-1.5 gap-y-1 text-xs text-muted-foreground md:text-base">
                            <span className="whitespace-nowrap">{leistungspunkte} ECTS</span>
                            <span>• {semester} •</span>
                            <span
                                className={
                                    modulArt === "Pflichtmodul"
                                        ? "text-flag-red"
                                        : modulArt === "Wahlpflichtmodul"
                                        ? "text-blue-bell"
                                        : "text-muted-foreground"
                                }
                            >
                                {modulArt}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 cursor-pointer pt-1" onClick={handleAusklappen}>
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
                        <div className="flex gap-2 overflow-x-auto md:overflow-visible">
                            {detailBoxen.map((detail, index) => {
                                const Icon = detail.icon;

                                return (
                                    <div
                                        key={index}
                                        className="bg-stone-grey flex-1 min-w-0 border-2 rounded-xl p-1.5 md:p-4 flex flex-col items-center justify-between text-center overflow-hidden"
                                    >
                                        <Icon className="h-5 w-5 mb-1" />

                                        <span className="hidden md:block text-xs text-center break-words">
                                            {detail.name}
                                        </span>

                                        <p className="font-bold text-[10px] md:text-base text-center break-words leading-tight">
                                            {detail.value}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className='flex rounded-lg gap-2'>
                            <button className='bg-violet-ray text-white px-6 font-bold py-2 rounded-lg w-4/6'>
                                Zum Planer hinzufügen
                            </button>
                            {/** Hier Link von Moses einfügen */}
                            <Link href={link}
                                  className='bg-flag-red text-white w-2/6 px-4 py-2 rounded-lg flex font-bold items-center justify-center gap-2'>
                                    Moses
                                <SquareArrowOutUpRight className='justify-self-end shrink-0'/>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ModulCard;