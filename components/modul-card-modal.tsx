"use client";

import Link from "next/link";
import {useState, useEffect} from 'react';
import {X, SquareArrowOutUpRight, Circle, CircleCheckBig,} from 'lucide-react';
import {getTries, saveTries} from "@/app/protected/planner/actions";

{/**wahrscheinlich neuer type notwendig um alle Infos aus Supabase zu holen, momentan noch modulInfo aus types.d.ts */}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    modul: modulInfo | null;
};

const ModulCardModal = ({ isOpen, onClose, modul }: Props) => {

    const [checked, setChecked] = useState(false);
    const [counter, setCount] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const increase = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setErrorMsg(null);

        if (counter < 4 && modul && modul.modul_id) {
            const nextValue = counter + 1;
            const result = await saveTries(modul.modul_id, nextValue);

            if (result.success) {
                setCount(nextValue);
            } else {
                setErrorMsg(result.error || "Ein Fehler ist aufgetreten.");
            }
        }
    };

    const decrease = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setErrorMsg(null);

        if (counter > 0 && modul && modul.modul_id) {
            const nextValue = counter - 1;

            const result = await saveTries(modul.modul_id, nextValue);

            if (result.success) {
                setCount(nextValue);
            } else {
                setErrorMsg(result.error || "Ein Fehler ist aufgetreten.");
            }
        }
    };

    useEffect(() => {
        const fetchVersuche = async () => {
            if (!modul || !modul.modul_id) return;
            const gespeicherteVersuche = await getTries(modul.modul_id);
            setCount(gespeicherteVersuche ?? 0);
        };

        if (isOpen && modul?.modul_id) {
            fetchVersuche();
            setErrorMsg(null);
        } else if (!isOpen) {
            setCount(0);
        }
        setChecked(false);

    }, [modul?.modul_id, isOpen]);

    if (!modul || !isOpen) return null;

    {/** Eigentlich noch notwendig: Dozent, pruefungsform (nicht in modulInfo -> neuer type?)  */}

    const {
        leistungspunkte,
        modulArt,
    } = modul;

    return (

        <div>
            {/**wird nur ausgeführt wenn modul =! NULL */}
            {modul && (
                <div
                    className={`fixed z-50 bg-card rounded-xl bottom-3 left-3 right-3 md:left-75 md:right-3 transition-transform transform duration-300 ease-out ${
                        isOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
                    }`}>
                    <div
                        className="w-full bg-card flex flex-col p-8 gap-6 border-2 rounded-xl shadow-xl">
                        <header className="flex flex-col gap-y-4">

                            {/* Obere Zeile mit ModulArt und Schließen-Button */}
                            <div className="flex flex-row items-center justify-between">
                                <div
                                    className="flex bg-flag-red text-card rounded-xl py-1 px-2 w-fit items-center justify-center">
                                    {modulArt}
                                </div>

                                {/* Fehlermeldung, falls Modul nicht in Datenbank existiert */}
                                {errorMsg && (
                                    <div className="w-full text-flag-red text-sm font-medium mt-1 ml-4">
                                        {errorMsg}
                                    </div>
                                )}

                                <button type="button"
                                        onClick={onClose}
                                        className="hover:opacity-70 transition-opacity">
                                    <X className="w-4 h-4"/>
                                </button>
                            </div>

                            {/* Name und Infos*/}
                            <div className="flex flex-col md:flex-row md:items-center justify-start gap-y-2 md:gap-x-6">
                                <h1 className="font-bold md:text-3xl text-xl tracking-tight">
                                    {modul.name}
                                </h1>
                                <div
                                    className="flex flex-row flex-wrap items-center gap-3 text-sm md:text-base md:pt-1">
                                    <p className="text-flag-red font-medium">
                                        {leistungspunkte} ECTS
                                    </p>
                                    <div className="text-muted-foreground">•</div>
                                    <p className="font-medium">
                                        {modul.semester}
                                    </p>
                                    <div className="text-muted-foreground">•</div>

                                    {/* Counter für Fehlversuche */}
                                    <div className="flex items-center gap-2">
                                        <p className="text-flag-red font-medium">Versuche:</p>
                                        <div
                                            className="flex items-center gap-1 px-2 py-0.5 text-xs bg-muted border rounded-xl">
                                            <button
                                                className="flex items-center justify-center font-bold rounded-lg text-card-foreground hover:opacity-80 transition-all px-1"
                                                onClick={decrease}
                                            >-
                                            </button>
                                            <span className="font-semibold text-center text-card-foreground">
                                                {counter}
                                            </span>
                                            <button
                                                className="flex items-center justify-center font-bold rounded-lg text-card-foreground hover:opacity-80 transition-all px-1"
                                                onClick={increase}
                                            >+
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <div>
                            <h2 className="font-semibold text-lg">
                                Beschreibung
                            </h2>
                            <p>
                                {modul.beschreibung}
                            </p>
                        </div>
                        <div className="flex flex-col justify-between gap-2 md:flex-row">
                            <div className="bg-muted flex border-2 rounded-xl w-full items-center p-4 flex-col">
                                <p>
                                    Arbeitsaufwand
                                </p>
                                <p className="font-semibold">
                                    {modul.modulArt}
                                </p>
                            </div>
                            <div className="bg-muted flex border-2 rounded-xl w-full items-center p-4 flex-col">
                                <p>
                                    Angebot
                                </p>
                                <p className="font-semibold">
                                    {modul.semester}
                                </p>

                            </div>
                            <div className="bg-muted flex border-2 rounded-xl w-full items-center p-4 flex-col">
                                <p>
                                    Prüfungsform
                                </p>
                                <p className="font-semibold">
                                    {/**{modul.pruefungsform} */}
                                </p>
                            </div>
                        </div>

                        {/**Ob das Modul schon abgeschlossen ist -> speichert checked oder nicht checked aber noch nicht richtig :(*/}

                        <div className="w-full rounded-lg">
                            <div className="flex gap-3 flex-col flex-wrap md:flex-row w-full items-stretch">

                                {/* Modul Abgeschlossen */}
                                <button
                                    onClick={() => setChecked(!checked)}
                                    className={`flex px-3 py-4 rounded-lg w-full md:flex-1 items-center justify-center whitespace-nowrap transition-colors text-sm md:text-base ${
                                        checked
                                            ? 'bg-mint-leaf/40 text-gray-500 dark:text-gray-300'
                                            : 'bg-mint-leaf text-white'
                                    }`}>
                                    {checked ? (
                                        <span className="flex items-center gap-2 text-center">
                                            <CircleCheckBig className="w-4 h-4 shrink-0"/>
                                             Als abgeschlossen markiert
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 text-center">
                                             <Circle className="w-4 h-4 shrink-0"/>
                                             Als abgeschlossen markieren
                                        </span>
                                    )}
                                </button>

                                {/* Modul Bewerten */}
                                <button
                                    className="bg-blue-bell text-white px-3 py-4 rounded-lg w-full md:flex-1 flex items-center justify-center whitespace-nowrap text-sm md:text-base">
                                    Modul bewerten
                                </button>

                                {/* Link zu Moses */}
                                <Link href={modul.link}
                                      className="bg-flag-red text-white px-3 py-4 rounded-lg flex items-center justify-center gap-2 w-full md:flex-1 whitespace-nowrap text-sm md:text-base">
                                    <span>zu Moses</span>
                                    <SquareArrowOutUpRight className="w-4 h-4 shrink-0"/>
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default ModulCardModal;
