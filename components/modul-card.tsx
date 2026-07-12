"use client";

import {
    ChevronUp,
    ChevronDown,
    Circle,
    CircleCheckBig,
    SquareArrowOutUpRight,
    CalendarPlus,
    BookOpen
} from "lucide-react";
import { ladeDetailedModulAction } from "@/app/protected/modules/actions";
import Link from "next/link";
import { useState } from "react";
import ModulFeedback from "./modul-feedback";
import { handleModule, berechneTurnus } from "@/lib/utils";
import { moduleZuPlanerHinzufuegen, findeModulImPlaner } from '@/app/protected/planner/actions';

type ModulDetails = Partial<modulInfo> & {
    pruefungselemente?: string[];
};

const ModulCard = (props: modulInfo & {
    semesterListe: { id: string; semesterzahl: number; name: string }[];
    currentSemester: number | null;
    currentTurnus: string | null;
    no_deg?: boolean;
}) => {
    const [liked, setLiked] = useState(true);
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<ModulDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showLernergebnisse, setShowLernergebnisse] = useState(false);
    const [plannerOpen, setPlannerOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [imPlaner, setImPlaner] = useState(false);
    const [imPlanerSemester, setImPlanerSemester] = useState<string | null>(null);


    const {
        modul_id,
        name,
        leistungspunkte,
        turnus,
        bereichpfad,
        lernergebnisse,
        semesterListe,
        currentSemester,
        currentTurnus,
        no_deg = false,
    } = props;

    const angezeigterTurnus = turnus ?? undefined;

    const kurzerTurnus = angezeigterTurnus
        ?.toString()
        .replaceAll("Winter- und Sommersemester", "WiSe & SoSe")
        .replaceAll("Wintersemester", "WiSe")
        .replaceAll("Sommersemester", "SoSe");

    const pruefungselemente = Array.isArray(details?.pruefungselemente)
        ? details.pruefungselemente
        : [];

    async function handleAusklappen() {
        setOpen(!open);
        if (!open && !details) {
            setLoadingDetails(true);
            const data = await ladeDetailedModulAction(handleModule(modul_id), no_deg);
            if (data) {
                setDetails({
                    ...data,
                    benotet: data.benotet ?? undefined,
                    pruefungselemente: Array.isArray(data.pruefungselemente)
                        ? data.pruefungselemente
                        : [],
                });
            }
            const ergebnis = await findeModulImPlaner(String(modul_id));
            setImPlaner(ergebnis.imPlaner);
            setImPlanerSemester(ergebnis.semesterName);
            setLoadingDetails(false);
        }
    }

    async function handleSemesterWahl(semesterId: string) {
        if (!details) {
            console.error("Details noch nicht geladen.");
            return;
        }

        setSelectedSemester(semesterId);
        setPlannerOpen(false);

        const modulId = handleModule(modul_id);
        const mosesId = Number(modulId);

        const ergebnis = await moduleZuPlanerHinzufuegen(semesterId, {
            moses_id: mosesId,
            name: name,
            turnus: turnus ?? "",
            bereichpfad: bereichpfad ?? "",
            ects: leistungspunkte ?? 0,
            lernergebnisse: details.lernergebnisse ?? "",
            pruefungsform: typeof details.pruefungsform === "string" ? details.pruefungsform : "",
            benotet: details.benotet ?? false,
            voraussetzungen: details.voraussetzungen ?? "",
            moseslink: details.link ?? "",
        });

        if (!ergebnis.success) {
            console.error("Speichern fehlgeschlagen:", ergebnis.error);
        } else {
            console.log("Modul gespeichert:", ergebnis.modulId);
            setImPlaner(true);
            const gewaehltesSemester = semesterListe.find(s => s.id === semesterId);
            setImPlanerSemester(gewaehltesSemester?.name ?? null);
        }
    }

    const detailBoxen = [
        { name: "Prüfungsform", value: details?.pruefungsform ?? "—" },
        { name: "Benotet", value: details?.benotet !== undefined ? (details?.benotet ? "Ja" : "Nein") : "—" },
        { name: "Voraussetzungen", value: details?.voraussetzungen ?? "—" },
    ];

    const isWahlpflicht = (bereichpfad ?? "").toString().toLowerCase().includes("wahlpflicht");
    const moduleBorderClass = isWahlpflicht
        ? "border-l-mint-leaf border-r-mint-leaf"
        : "border-l-flag-red border-r-flag-red";

    return (
        <div className={`w-full min-w-0 flex flex-col border-y-2 border-x-4 border-border ${moduleBorderClass} bg-background dark:bg-card rounded-xl px-4 sm:px-6 pt-4 transition-all duration-700 ${open ? "pb-6" : "pb-4"}`}>
            <header className="flex w-full items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 gap-3">
                    <button onClick={() => setLiked(!liked)} className="mt-1 shrink-0">
                        {liked ? <CircleCheckBig className="text-mint-leaf" /> : <Circle />}
                    </button>

                    <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6">
                        <h1 className="break-words text-lg font-bold leading-tight md:text-2xl">
                            {name}
                        </h1>

                        <div className="flex flex-col gap-1 text-sm opacity-80 md:ml-auto md:items-end">
                            <div className="hidden xl:flex items-center gap-2 whitespace-nowrap">
                                <span>{leistungspunkte} ECTS</span>
                                <span>•</span>
                                <span>{angezeigterTurnus}</span>
                                <span>•</span>
                                <p className="text-blue-bell dark:text-violet-ray">
                                    {bereichpfad ?? "—"}
                                </p>
                            </div>

                            <div className="xl:hidden">
                                <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap">{leistungspunkte} ECTS</span>
                                    <span>•</span>
                                    <span className="whitespace-nowrap">{kurzerTurnus}</span>
                                </div>

                                <p className="mt-1 break-words text-blue-bell dark:text-violet-ray">
                                    {bereichpfad ?? "—"}
                                </p>
                            </div>
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
                        <div>
                            <div className="hidden md:block">
                                <h2 className="font-semibold text-lg">Lernergebnisse</h2>
                                <p className="opacity-80">
                                    {details?.lernergebnisse ?? lernergebnisse ?? "—"}
                                </p>
                            </div>

                            <div className="md:hidden">
                                <button
                                    onClick={() => setShowLernergebnisse(!showLernergebnisse)}
                                    className="w-full rounded-xl bg-[#E3E6EA] dark:bg-card border-2 border-border px-4 py-3 text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="text-flag-red shrink-0" size={20} />

                                            <span className="font-medium">
                                                {showLernergebnisse ? "Lernergebnisse" : "Lernergebnisse anzeigen"}
                                            </span>
                                        </div>

                                        {showLernergebnisse ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>

                                    {showLernergebnisse && (
                                        <p className="mt-3 text-sm leading-relaxed opacity-80">
                                            {details?.lernergebnisse ?? lernergebnisse ?? "—"}
                                        </p>
                                    )}
                                </button>
                            </div>
                        </div>

                        {pruefungselemente.length > 0 && (
                            <div>
                                <h2 className="font-semibold text-lg">Prüfungselemente</h2>
                                <ul className="list-disc list-inside opacity-80">
                                    {pruefungselemente.map((element, index) => (
                                        <li key={index}>{element}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {detailBoxen.map((detail, index) => (
                                <div
                                    key={index}
                                    className="bg-[#E3E6EA] dark:bg-[#16081f] flex border-2 border-border rounded-xl w-full items-center p-4 flex-col text-center"
                                >
                                    <span>{detail.name}</span>
                                    <p className="font-bold">{detail.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-stretch rounded-lg gap-2 md:flex-row md:items-start">
                            <div className="flex-1 flex flex-col gap-2">
                                <button
                                    onClick={() => !imPlaner && setPlannerOpen(!plannerOpen)}
                                    disabled={!details || imPlaner}
                                    className={`w-full bg-foreground text-background px-4 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-colors dark:bg-[#35AE80] ${(!details || imPlaner) ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <CalendarPlus className="w-5 h-5" />
                                        <span className="font-medium">
                                            {imPlaner
                                                ? `Bereits im Planer${imPlanerSemester ? ` - ${imPlanerSemester}` : ''}`
                                                : selectedSemester
                                                    ? `${semesterListe.find(s => s.id === selectedSemester)?.name ?? "Semester"} gewählt`
                                                    : "Zum Planer hinzufügen"}
                                        </span>
                                    </div>

                                    {!imPlaner && (
                                        plannerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                <div className={`grid transition-all duration-300 ease-in-out ${plannerOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                                    <div className="overflow-hidden">
                                        <div className="bg-background dark:bg-card border border-border rounded-xl p-3 flex flex-col gap-1">
                                            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase px-2 pb-1">
                                                Semester wählen
                                            </p>

                                            {semesterListe.length === 0 ? (
                                                <p className="text-sm text-muted-foreground px-2 py-2">
                                                    Noch keine Semester angelegt. Lege zuerst im Planer ein Semester an.
                                                </p>
                                            ) : (
                                                semesterListe.map((sem) => {
                                                    const semesterTurnus = berechneTurnus(sem.semesterzahl, currentSemester, currentTurnus);
                                                    const isWinter = semesterTurnus === "WiSe";
                                                    return (
                                                        <button
                                                            key={sem.id}
                                                            onClick={() => handleSemesterWahl(sem.id)}
                                                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#E3E6EA] dark:hover:bg-[#16081f] transition-colors text-left ${selectedSemester === sem.id ? "bg-[#E3E6EA] dark:bg-[#16081f]" : ""
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-medium text-foreground">{sem.name}</span>
                                                            </div>
                                                            {semesterTurnus && (
                                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isWinter
                                                                    ? 'text-blue-bell border-blue-bell/30 bg-blue-bell/10'
                                                                    : 'text-amber-500 border-amber-400/30 bg-amber-50 dark:bg-amber-500/10'
                                                                    }`}>
                                                                    {isWinter ? "Wintersemester" : "Sommersemester"}
                                                                </span>
                                                            )}
                                                        </button >
                                                    );
                                                })
                                            )}
                                        </div >
                                    </div >
                                </div >
                            </div >

                            {
                                details?.link ? (
                                    <Link
                                        href={details.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 bg-flag-red text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        zu Moses
                                        <SquareArrowOutUpRight className="justify-self-end shrink-0" />
                                    </Link>
                                ) : (
                                    <span className="shrink-0 bg-gray-300 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 opacity-50 cursor-not-allowed whitespace-nowrap">
                                        zu Moses
                                        <SquareArrowOutUpRight className="shrink-0" />
                                    </span>
                                )}
                        </div >

                        <ModulFeedback modulId={modul_id} modulName={name} />
                    </div >
                </div >
            </div >
        </div >
    );
};

export default ModulCard;