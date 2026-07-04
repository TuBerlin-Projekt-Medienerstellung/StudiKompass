"use client";

import { ChevronUp, ChevronDown, Circle, CircleCheckBig, SquareArrowOutUpRight, CalendarPlus } from 'lucide-react';
import { ladeDetailedModulAction } from '@/app/protected/modules/actions';
import Link from "next/link";
import { useState } from 'react';
import ModulFeedback from "./modul-feedback";
import { handleModule } from "@/lib/utils";
import { moduleZuPlanerHinzufuegen, findeModulImPlaner } from '@/app/protected/planner/actions';



const ModulCard = (props: modulInfo & {
    semesterListe: { id: string; semesterzahl: number; name: string }[]
}) => {

    const [liked, setLiked] = useState(true);
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<Partial<modulInfo> | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [plannerOpen, setPlannerOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [imPlaner, setImPlaner] = useState(false);
    const [imPlanerSemester, setImPlanerSemester] = useState<string | null>(null);

    async function handleAusklappen() {
        setOpen(!open);
        if (!open && !details) {
            setLoadingDetails(true);
            const data = await ladeDetailedModulAction(handleModule(modul_id));
            if (data) {
                setDetails({ ...data, benotet: data.benotet ?? undefined });
            }
            const ergebnis = await findeModulImPlaner(String(modul_id));
            setImPlaner(ergebnis.imPlaner);
            setImPlanerSemester(ergebnis.semesterName);

            setLoadingDetails(false);
        }
    }

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
        semesterListe,
    } = props;

    async function handleSemesterWahl(semesterId: string) {
        // Sicherheit: ohne Details nicht speichern
        if (!details) {
            console.error("Details noch nicht geladen.");
            return;
        }

        setSelectedSemester(semesterId);
        setPlannerOpen(false);

        const ergebnis = await moduleZuPlanerHinzufuegen(semesterId, {
            moses_id: Number(handleModule(modul_id)),
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
            // TODO: dem Nutzer eine Fehlermeldung anzeigen
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

    const isWahlpflicht = bereichpfad.toLowerCase().includes("wahlpflicht");
    const moduleBorderClass = isWahlpflicht
        ? "border-l-flag-red border-r-flag-red dark:border-l-emerald-400 dark:border-r-emerald-400"
        : "border-l-flag-red border-r-flag-red dark:border-l-flag-red dark:border-r-flag-red";

    return (
        <div
            className={`w-full flex flex-col border-y-2 border-x-4 border-border ${moduleBorderClass} bg-background dark:bg-card rounded-xl px-6 pt-4 transition-all duration-700 ${open ? 'pb-6' : 'pb-4'}`}>
            <header className='w-full flex justify-between items-center'>
                <div className='flex w-fit gap-2.5'>
                    <button onClick={() => setLiked(!liked)}>
                        {liked ? <CircleCheckBig className="text-mint-leaf" /> : <Circle />}
                    </button>
                    <div className='flex gap-6 items-center md:flex-row flex-col'>
                        <h1 className='font-bold md:text-2xl text-xl'>{name}</h1>
                        <div className='flex gap-2'>
                            <div>{leistungspunkte} ECTS</div>
                            <div>•</div>
                            <span> {turnus}</span>
                            <div>•</div>
                            <p className='text-blue-bell dark:text-violet-ray'>{bereichpfad}</p>
                        </div>
                    </div>
                </div>
                <div className="cursor-pointer" onClick={handleAusklappen}>
                    {open ? <ChevronUp /> : <ChevronDown />}
                </div>
            </header>

            <div
                className={`grid transition-all duration-700 ease-in-expo ${open ? 'grid-rows-[1fr] mt-5' : 'grid-rows-[0fr] mb-0'}`}>
                <div className='overflow-hidden'>
                    <div className='flex flex-col gap-y-5'>
                        {/* Lernergebnisse */}
                        <div>
                            <h2 className='font-semibold text-lg'>Lernergebnisse</h2>
                            <p className='opacity-80'>{details?.lernergebnisse ?? lernergebnisse ?? "—"}</p>
                        </div>

                        {/* Prüfungselemente falls vorhanden */}
                        {Array.isArray(pruefungsform) && pruefungsform.length > 0 && (
                            <div>
                                <h2 className='font-semibold text-lg'>Prüfungselemente</h2>
                                <ul className='list-disc list-inside opacity-80'>
                                    {pruefungsform.map((el, i) => (
                                        <li key={i}>{el}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Detail Boxen */}
                        <div className='flex justify-between gap-2 md:flex-row flex-col'>
                            {/** Hier fetchen für die Details, gerade werden dummy daten von constants gefetchtet **/}
                            {detailBoxen.map((detail, index) => (
                                <div key={index}
                                    className='bg-[#E3E6EA] dark:bg-[#16081f] flex border-2 border-border rounded-xl w-full items-center p-4 flex-col'>
                                    <span>{detail.name}</span>
                                    <p className='font-bold'>{detail.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Aktionen */}
                        <div className='flex items-start rounded-lg gap-2'>
                            {/* Planer-Button mit Semester-Picker */}
                            <div className='flex-1 flex flex-col gap-2'>
                                <button
                                    onClick={() => !imPlaner && setPlannerOpen(!plannerOpen)}
                                    disabled={!details || imPlaner}
                                    className={`w-full bg-foreground text-background px-4 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-colors dark:bg-[#35AE80] ${(!details || imPlaner) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                                        }`}
                                >
                                    <div className='flex items-center gap-2'>
                                        <CalendarPlus className='w-5 h-5' />
                                        <span className='font-medium'>
                                            {imPlaner
                                                ? `Bereits im Planer${imPlanerSemester ? ` - ${imPlanerSemester}` : ''}`
                                                : selectedSemester
                                                    ? `${semesterListe.find(s => s.id === selectedSemester)?.name ?? "Semester"} gewählt`
                                                    : 'Zum Planer hinzufügen'}
                                        </span>
                                    </div>
                                    {!imPlaner && (plannerOpen ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />)}
                                </button>

                                {/* Semester-Picker Dropdown */}
                                <div
                                    className={`grid transition-all duration-300 ease-in-out ${plannerOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className='overflow-hidden'>
                                        <div
                                            className='bg-background dark:bg-card border border-border rounded-xl p-3 flex flex-col gap-1'>
                                            <p className='text-xs font-semibold text-muted-foreground tracking-widest uppercase px-2 pb-1'>
                                                Semester wählen
                                            </p>
                                            {semesterListe.length === 0 ? (
                                                <p className='text-sm text-muted-foreground px-2 py-2'>
                                                    Noch keine Semester angelegt. Lege zuerst im Planer ein Semester an.
                                                </p>
                                            ) : (
                                                semesterListe.map((sem) => {
                                                    // TODO: Turnus korrekt aus Studienstart ableiten (aktuell nur ungerade=Winter Annahme)
                                                    const isWinter = sem.semesterzahl % 2 === 1;
                                                    return (
                                                        <button
                                                            key={sem.id}
                                                            onClick={() => handleSemesterWahl(sem.id)}
                                                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#E3E6EA] dark:hover:bg-[#16081f] transition-colors text-left ${selectedSemester === sem.id ? 'bg-[#E3E6EA] dark:bg-[#16081f]' : ''}`}
                                                        >
                                                            <div className='flex items-center gap-3'>
                                                                <span className='font-medium text-foreground'>{sem.name}</span>
                                                            </div>
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isWinter
                                                                ? 'text-blue-bell border-blue-bell/30 bg-blue-bell/10'
                                                                : 'text-amber-500 border-amber-400/30 bg-amber-50 dark:bg-amber-500/10'
                                                                }`}>
                                                                {isWinter ? "Wintersemester" : "Sommersemester"}
                                                            </span>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Moses Link — nur so breit wie nötig */}
                            {details?.link ? (
                                <Link
                                    href={details.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className='shrink-0 bg-flag-red text-white px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap'
                                >
                                    zu Moses
                                    <SquareArrowOutUpRight className='justify-self-end' />
                                </Link>
                            ) : (
                                <span
                                    className='bg-gray-300 text-white w-1/6 px-4 py-2 rounded-lg flex items-center justify-center gap-2 opacity-50 cursor-not-allowed'>
                                    zu Moses
                                    <SquareArrowOutUpRight />
                                </span>
                            )}
                        </div>
                        <ModulFeedback modulId={modul_id} modulName={name} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulCard;