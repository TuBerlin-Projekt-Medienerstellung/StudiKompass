"use client";

import {
    ChevronUp,
    ChevronDown,
    Circle,
    CircleCheckBig,
    SquareArrowOutUpRight,
    BookOpen,
    CalendarPlus,
} from "lucide-react";
import { ladeDetailedModulAction } from "@/app/protected/modules/actions";
import Link from "next/link";
import { useState } from "react";
import ModulFeedback from "./modul-feedback";
import { handleModule } from "@/lib/utils";

// Placeholder – später aus Supabase laden
const SEMESTER_LISTE = [
    { nummer: 1, name: "1. Semester", typ: "Wintersemester" },
    { nummer: 2, name: "2. Semester", typ: "Sommersemester" },
    { nummer: 3, name: "3. Semester", typ: "Wintersemester" },
    { nummer: 4, name: "4. Semester", typ: "Sommersemester" },
    { nummer: 5, name: "5. Semester", typ: "Wintersemester" },
    { nummer: 6, name: "6. Semester", typ: "Sommersemester" },
];

const ModulCard = (props: modulInfo) => {
    const [liked, setLiked] = useState(true);
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<Partial<modulInfo> | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showLernergebnisse, setShowLernergebnisse] = useState(false);
    const [plannerOpen, setPlannerOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

    const {
        modul_id,
        name,
        leistungspunkte,
        turnus,
        bereichpfad,
        link,
        lernergebnisse,
        voraussetzungen,
        pruefungsform,
        benotet,
    } = props;

    const angezeigterTurnus = turnus ?? undefined;
    const kurzerTurnus = angezeigterTurnus
        ?.toString()
        .replaceAll("Winter- und Sommersemester", "WiSe & SoSe")
        .replaceAll("Wintersemester", "WiSe")
        .replaceAll("Sommersemester", "SoSe");

    async function handleAusklappen() {
        setOpen(!open);
        if (!open && !details) {
            setLoadingDetails(true);
            const data = await ladeDetailedModulAction(handleModule(modul_id));
            if (data) {
                setDetails({
                    ...data,
                    benotet: data.benotet ?? undefined,
                });
            }
            setLoadingDetails(false);
        }
    }

    function handleSemesterWahl(nummer: number) {
        setSelectedSemester(nummer);
        // TODO: Supabase insert hier einfügen
        setPlannerOpen(false);
    }

    const detailBoxen = [
        { name: "Prüfungsform", value: details?.pruefungsform ?? "—" },
        { name: "Benotet", value: details?.benotet !== undefined ? (details?.benotet ? "Ja" : "Nein") : "—" },
        { name: "Voraussetzungen", value: details?.voraussetzungen ?? "—" },
    ];

    const isWahlpflicht = (bereichpfad ?? "").toString().toLowerCase().includes("wahlpflicht");
    const moduleBorderClass = isWahlpflicht ? "border-l-mint-leaf border-r-mint-leaf" : "border-l-flag-red border-r-flag-red";

    return (
        <div className={`w-full flex flex-col border-y-2 border-x-4 border-border ${moduleBorderClass} bg-background dark:bg-card rounded-xl px-6 pt-4 transition-all duration-700 ${open ? "pb-6" : "pb-4"}`}>
            <header className="w-full flex justify-between items-center">
                <div className="flex w-fit gap-2.5">
                    <button onClick={() => setLiked(!liked)}>
                        {liked ? <CircleCheckBig className="text-mint-leaf" /> : <Circle />}
                    </button>
                    <div className="flex gap-6 items-center md:flex-row flex-col">
                        <h1 className="font-bold md:text-2xl text-xl">{name}</h1>
                        <div className="flex gap-2">
                            <div>{leistungspunkte} ECTS</div>
                            <div>•</div>
                            <span> {turnus}</span>
                            <div>•</div>
                            <p className="text-blue-bell dark:text-violet-ray">{bereichpfad}</p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 cursor-pointer pt-1" onClick={handleAusklappen}>
                    {open ? <ChevronUp /> : <ChevronDown />}
                </div>
            </header>

            <div className={`grid transition-all duration-700 ease-in-expo ${open ? "grid-rows-[1fr] mt-5" : "grid-rows-[0fr] mb-0"}`}>
                <div className="overflow-hidden">
                    <div className="flex flex-col gap-y-5">
                        {/* Lernergebnisse */}
                        <div>
                            {/* Desktop: immer sichtbar */}
                            <div className="hidden md:block">
                                <h2 className="font-semibold text-lg">Lernergebnisse</h2>
                                <p className="opacity-80">{details?.lernergebnisse ?? lernergebnisse ?? "—"}</p>
                            </div>

                            {/* Mobile: einklappbar */}
                            <div className="md:hidden">
                                <button onClick={() => setShowLernergebnisse(!showLernergebnisse)} className="w-full rounded-xl bg-[#E3E6EA] dark:bg-card border-2 border-border px-4 py-3 text-left">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="text-flag-red shrink-0" size={20} />

                                            <span className="font-medium">{showLernergebnisse ? "Lernergebnisse" : "Lernergebnisse anzeigen"}</span>
                                        </div>

                                        {showLernergebnisse ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>

                                    {showLernergebnisse && <p className="mt-3 text-sm leading-relaxed opacity-80">{details?.lernergebnisse ?? lernergebnisse ?? "—"}</p>}
                                </button>
                            </div>
                        </div>

                        {/* Prüfungselemente falls vorhanden */}
                        {Array.isArray(pruefungsform) && pruefungsform.length > 0 && (
                            <div>
                                <h2 className="font-semibold text-lg">Prüfungselemente</h2>
                                <ul className="list-disc list-inside opacity-80">
                                    {pruefungsform.map((el, i) => (
                                        <li key={i}>{el}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Detail Boxen */}
                        <div className="flex justify-between gap-2 md:flex-row flex-col">
                            {detailBoxen.map((detail, index) => (
                                <div key={index} className="bg-[#E3E6EA] dark:bg-[#16081f] flex border-2 border-border rounded-xl w-full items-center p-4 flex-col">
                                    <span>{detail.name}</span>
                                    <p className="font-bold">{detail.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Aktionen */}
                        <div className="flex items-start rounded-lg gap-2">
                            {/* Planer-Button mit Semester-Picker */}
                            <div className="flex-1 flex flex-col gap-2">
                                <button onClick={() => setPlannerOpen(!plannerOpen)} className="w-full bg-foreground text-background px-4 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-colors hover:opacity-90 dark:bg-[#35AE80]">
                                    <div className="flex items-center gap-2">
                                        <CalendarPlus className="w-5 h-5" />
                                        <span className="font-medium">{selectedSemester ? `${selectedSemester}. Semester gewählt` : 'Zum Planer hinzufügen'}</span>
                                    </div>
                                    {plannerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {/* Semester-Picker Dropdown */}
                                <div className={`grid transition-all duration-300 ease-in-out ${plannerOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <div className="bg-background dark:bg-card border border-border rounded-xl p-3 flex flex-col gap-1">
                                            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase px-2 pb-1">Semester wählen</p>
                                            {SEMESTER_LISTE.map((sem) => {
                                                const isWinter = sem.typ === "Wintersemester";
                                                return (
                                                    <button key={sem.nummer} onClick={() => handleSemesterWahl(sem.nummer)} className={`flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#E3E6EA] dark:hover:bg-[#16081f] transition-colors text-left ${selectedSemester === sem.nummer ? 'bg-[#E3E6EA] dark:bg-[#16081f]' : ''}`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-foreground">{sem.name}</span>
                                                        </div>
                                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isWinter ? 'text-blue-bell border-blue-bell/30 bg-blue-bell/10' : 'text-amber-500 border-amber-400/30 bg-amber-50 dark:bg-amber-500/10'}`}>{sem.typ}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Moses Link — nur so breit wie nötig */}
                            {details?.link ? (
                                <Link href={details.link} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-flag-red text-white px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap">
                                    zu Moses
                                    <SquareArrowOutUpRight className="justify-self-end shrink-0" />
                                </Link>
                            ) : (
                                <span className="bg-gray-300 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 opacity-50 cursor-not-allowed">zu Moses <SquareArrowOutUpRight className="shrink-0" /></span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulCard;