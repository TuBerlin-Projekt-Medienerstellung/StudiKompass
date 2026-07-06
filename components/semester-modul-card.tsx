"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SquareArrowOutUpRight, Grip, Trash2, ChevronDown, ChevronUp, Circle, CircleCheckBig } from 'lucide-react';
import { useState, useEffect } from "react";
import { handleModule } from "@/lib/utils";
import { ladeDetailedModulAction } from "@/app/protected/modules/actions";
import { getTries, saveTries, saveGrade, saveStatus, deleteGrade, loescheModul } from "@/app/protected/planner/actions";

type Props = {
    modul: modulInfo;
    proWoche: boolean;
    onToggleAufwand: () => void;
};

type ModulDetails = {
    beschreibung?: string;
    [key: string]: unknown;
};

const SemesterModulCard = ({ modul, proWoche, onToggleAufwand }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [details, setDetails] = useState<ModulDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [checked, setChecked] = useState<boolean>(modul.abgeschlossen ?? false);
    const [counter, setCount] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [noteInput, setNoteInput] = useState<number>(modul.note ?? 2.3);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [gewichtung, setGewichtung] = useState<boolean>(modul.gewichtung === 1);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
        } = useSortable({ id: handleModule(modul.modul_id) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    async function handleAusklappen(e: React.MouseEvent) {
        e.stopPropagation();

        const nextOpenState = !isOpen;
        setIsOpen(nextOpenState);

        if (nextOpenState && !details) {
            setLoadingDetails(true);
            setErrorMsg(null);
            const data = await ladeDetailedModulAction(handleModule(modul.modul_id));
            if (data) {
                setDetails(data as ModulDetails);
            }
            setLoadingDetails(false);
        }
    }

    const increaseTries = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setErrorMsg(null);
        if (counter < 4) {
            const nextValue = counter + 1;
            const result = await saveTries(handleModule(modul.modul_id), nextValue);
            if (result.success) {
                setCount(nextValue);
            } else {
                setErrorMsg(result.error || "Ein Fehler ist aufgetreten.");
            }
        }
    };

    const decreaseTries = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setErrorMsg(null);
        if (counter > 0) {
            const nextValue = counter - 1;
            const result = await saveTries(handleModule(modul.modul_id), nextValue);
            if (result.success) {
                setCount(nextValue);
            } else {
                setErrorMsg(result.error || "Ein Fehler ist aufgetreten.");
            }
        }
    };

    const decreaseNote = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (noteInput > 0.7) {
            setNoteInput(Number((noteInput - 0.1).toFixed(1)));
        }
    };

    const increaseNote = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (noteInput < 4.0) {
            setNoteInput(Number((noteInput + 0.1).toFixed(1)));
        }
    };

    // Lädt die Daten zum Modul, sobald die Karte geöffnet wird
    useEffect(() => {
        const fetchVersuche = async () => {
            const gespeicherteVersuche = await getTries(handleModule(modul.modul_id));
            setCount(gespeicherteVersuche ?? 0);
        };

        if (isOpen) {
            fetchVersuche();
        }

        if (modul.note !== undefined && modul.note !== null) {
            setNoteInput(modul.note);
        }
        if (modul.gewichtung !== undefined && modul.gewichtung !== null) {
            setGewichtung(modul.gewichtung === 1);
        }

        if (modul.abgeschlossen !== undefined && modul.abgeschlossen !== null) {
            setChecked(modul.abgeschlossen);
        }

    }, [isOpen, modul.modul_id, modul.note, modul.gewichtung, modul.abgeschlossen]);

    function berechneArbeitsaufwand(): string {
        const aufwand = modul.arbeitsaufwand;
        if (!aufwand || aufwand <= 0) return "—";

        const istJob = modul.leistungspunkte === 0;

        if (istJob) {
            // Job: gespeichert ist Stunden/Woche
            return proWoche ? `${aufwand} h/Woche` : `${aufwand * 15} h/Semester`;
        } else {
            // Modul: gespeichert ist Stunden/Semester
            return proWoche ? `${Math.round(aufwand / 15)} h/Woche` : `${aufwand} h/Semester`;
        }
    }

    return (
        <div ref={setNodeRef} style={style}>
            <div
                onClick={handleAusklappen}
                className={`px-6 py-4 rounded-2xl border-x-4 border-y-2 border-flag-red flex flex-col gap-2 cursor-pointer bg-card transition-all duration-300 ${isOpen ? "shadow-md" : ""}`}>

                {/* Eingeklappte Version des Moduls */}
                <div className="flex w-full items-start gap-3">
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        className="mt-2 shrink-0 text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Grip />
                    </button>

                    <div className="min-w-0 flex-1">
                        <h1 className="break-words text-base font-bold leading-snug sm:text-lg">
                            {modul.name}
                        </h1>

                        <div className="mt-2 flex flex-col gap-1 text-sm opacity-80">

                            {/* ECTS und Turnus immer nebeneinander */}
                            <div className="flex items-center gap-3">
                                <span className="text-flag-red whitespace-nowrap">
                                    {modul.leistungspunkte} ECTS
                                </span>

                                <span className="text-xs sm:text-sm">
                                    {modul.turnus}
                                </span>
                            </div>

                            {/* Moses-Link immer darunter */}
                            <Link
                                className="flex w-fit items-center gap-1 text-blue-bell hover:underline"
                                href={modul.link || "#"}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Moses
                                <SquareArrowOutUpRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-start gap-2 pt-1">
                        <button
                            type="button"
                            className="text-muted-foreground"
                            onClick={handleAusklappen}
                        >
                            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        <button
                            type="button"
                            className="hover:text-flag-red transition-colors"
                            onClick={async (e) => {
                                e.stopPropagation();
                                const result = await loescheModul(handleModule(modul.modul_id));
                                if (result.success) {
                                    window.location.reload();
                                } else {
                                    setErrorMsg(result.error || "Modul konnte nicht gelöscht werden.");
                                }
                            }}
                        >
                            <Trash2 />
                        </button>
                    </div>
                </div>


                                {/* Ausgeklappte Karte - Details */}
                <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}>
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-6 text-card-foreground"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-2">
                                <div className="flex flex-row flex-wrap items-center gap-3 text-sm">
                                    <div className="bg-flag-red text-card rounded-xl py-1 px-2 w-fit text-xs font-semibold">
                                        {modul.bereichpfad || "-"}
                                    </div>
                                    <div className="text-muted-foreground">•</div>

                                    {/* Counter für Fehlversuche */}
                                    <div className="flex items-center gap-2">
                                        <p className="text-flag-red font-medium">Versuche:</p>
                                        <div className="flex items-center gap-1 px-2 py-0.5 text-xs bg-muted border rounded-xl">
                                            <button className="px-1 font-bold hover:opacity-70" onClick={decreaseTries}>-</button>
                                            <span className="font-semibold w-4 text-center">{counter}</span>
                                            <button className="px-1 font-bold hover:opacity-70" onClick={increaseTries}>+</button>
                                        </div>
                                    </div>
                                </div>
                                {errorMsg && <p className="text-flag-red text-xs">{errorMsg}</p>}
                            </div>

                            {/* Beschreibung */}
                            <div>
                                <h2 className="font-semibold text-base mb-1">Beschreibung</h2>
                                <p className="text-sm opacity-80 leading-relaxed">
                                    {loadingDetails ? (
                                        <span className="italic opacity-50">Beschreibung wird geladen...</span>
                                    ) : (
                                        modul.lernergebnisse || details?.beschreibung || "Keine Beschreibung vorhanden."
                                    )}
                                </p>
                            </div>

                            {/* Infokästen */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 w-full">
                                <div
                                    className="bg-muted flex border rounded-xl items-center p-3 flex-col text-center justify-center cursor-pointer select-none"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleAufwand();
                                    }}
                                    title="Klicken zum Umrechnen (Semester / Woche)">
                                    <p className="text-lg opacity-70">
                                        Arbeitsaufwand
                                    </p>
                                    <p className="font-semibold text-md">
                                        {berechneArbeitsaufwand()}
                                    </p>
                                </div>

                                <div className="bg-muted flex border rounded-xl items-center p-3 flex-col text-center justify-center">
                                    <p className="text-lg opacity-70">Angebot</p>
                                    <p className="font-semibold text-md">{modul.turnus}</p>
                                </div>

                                <div className="bg-muted flex border rounded-xl items-center p-3 flex-col text-center justify-center">
                                    <p className="text-lg opacity-70">Prüfungsform</p>
                                    <p className="font-semibold text-md">{modul.pruefungsform}</p>
                                </div>

                                <div className="bg-muted flex border rounded-xl items-center p-3 flex-col text-center justify-center">
                                    <p className="text-lg opacity-70 mb-2">Bewertung</p>
                                    <div className="font-semibold text-sm w-full flex justify-center">
                                        {!modul.benotet ? (
                                            <span className="text-gray-500 font-normal text-md">nicht benotet</span>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 w-full max-w-xs md:max-w-none">

                                                <div className="flex flex-col items-center gap-2 w-full justify-center">

                                                    {/* Noten-Auswahl */}
                                                    <div className="flex items-center justify-between md:justify-center gap-2 px-3 py-1 text-xs bg-background border rounded-xl flex-1 md:flex-none">
                                                        <button className="px-1 font-bold hover:opacity-70 disabled:opacity-30 text-sm" onClick={decreaseNote} disabled={noteInput <= 0.7}>-</button>
                                                        <span className="font-semibold w-7 text-center">{noteInput.toFixed(1)}</span>
                                                        <button className="px-1 font-bold hover:opacity-70 disabled:opacity-30 text-sm" onClick={increaseNote} disabled={noteInput >= 4.0}>+</button>
                                                    </div>

                                                    {/* Gewichtungs-Toggle */}
                                                    <div
                                                        title="Welche Noten (nicht) in den Gesamtschnitt einfließen, steht in der StuPo zum Studiengang."
                                                        className="flex items-center justify-between md:justify-center gap-3 px-3 py-2 bg-background border rounded-xl flex-1 md:flex-none select-none">
                                                        <span className="text-xs font-normal opacity-70 whitespace-nowrap">
                                                            {gewichtung ? "normal gewichtet" : "nicht gewichtet"}
                                                        </span>
                                                        <button
                                                            onClick={() => setGewichtung(!gewichtung)}
                                                            className={`${gewichtung ? "bg-mint-leaf" : "bg-muted border shadow-inner"} relative inline-flex h-3.5 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none items-center`}>
                                                            <span
                                                                className={`${gewichtung ? "translate-x-3.5 bg-background" : "translate-x-0.5 bg-muted-foreground/60"} pointer-events-none inline-block h-2.5 w-2.5 transform rounded-full shadow transition duration-200 ease-in-out`}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row gap-2">
                                                    {/* Sichern Button */}
                                                    <button
                                                        disabled={isSavingNote}
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            setIsSavingNote(true);
                                                            setErrorMsg(null);

                                                            try {
                                                                const result = await saveGrade(handleModule(modul.modul_id), noteInput, gewichtung);

                                                                if (result.success) {
                                                                    console.log("Erfolgreich gespeichert!");
                                                                } else {
                                                                    setErrorMsg(result.error || "Fehler beim Speichern.");
                                                                }
                                                            } catch (error) {
                                                                console.error("Fehler beim Speichern der Note:", error);
                                                                setErrorMsg("Ein unerwarteter Fehler ist aufgetreten.");
                                                            } finally {
                                                                setIsSavingNote(false);
                                                            }
                                                        }}
                                                        className="w-auto p-1.5 text-xs bg-flag-red text-white font-medium rounded-xl hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                                                        {isSavingNote ? "..." : "Sichern"}
                                                    </button>

                                                    {/* Note löschen */}
                                                    <button
                                                        disabled={isSavingNote}
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            setIsSavingNote(true);
                                                            setErrorMsg(null);

                                                            try {
                                                                const result = await deleteGrade(handleModule(modul.modul_id));

                                                                if (result.success) {
                                                                    console.log("Erfolgreich gelöscht!");
                                                                } else {
                                                                    setErrorMsg(result.error || "Fehler beim Löschen.");
                                                                }
                                                            } catch (error) {
                                                                console.error("Fehler beim Löschen der Note:", error);
                                                                setErrorMsg("Ein unerwarteter Fehler ist aufgetreten.");
                                                            } finally {
                                                                setIsSavingNote(false);
                                                            }
                                                        }}
                                                        className="w-auto p-1.5 text-xs bg-flag-red text-white font-medium rounded-xl hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                                                        {isSavingNote ? "..." : "Note löschen"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Buttons unten */}
                            <div className="flex gap-2 flex-col md:flex-row w-full items-stretch text-sm">

                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const nextCheckedState = !checked;
                                        setChecked(nextCheckedState);
                                        setErrorMsg(null);

                                        try {
                                            const result = await saveStatus(handleModule(modul.modul_id), nextCheckedState);
                                            if (!result.success) {
                                                setChecked(checked);
                                                setErrorMsg(result.error || "Status konnte nicht gespeichert werden.");
                                            }
                                        } catch (error) {
                                            setChecked(checked);
                                            console.error("Fehler beim Speichern des Status:", error);
                                            setErrorMsg("Unerwarteter Fehler beim Aktualisieren.");
                                        }
                                    }}
                                    className={`flex p-3 rounded-lg w-full md:flex-1 items-center justify-center gap-2 transition-colors ${checked ? 'bg-mint-leaf text-white' : 'bg-mint-leaf/40 text-gray-500'}`}>
                                    {checked ? <CircleCheckBig className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    {checked ? "Als abgeschlossen markiert" : "Als abgeschlossen markieren"}
                                </button>

                                <button className="bg-blue-bell text-white p-3 rounded-lg w-full md:flex-1">
                                    Modul bewerten
                                </button>

                                <Link
                                    href={modul.link || "#"}
                                    target="_blank"
                                    className="bg-flag-red text-white p-3 rounded-lg flex items-center justify-center gap-2 w-full md:flex-1">
                                    <span>
                                        zu Moses
                                    </span>
                                    <SquareArrowOutUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SemesterModulCard;