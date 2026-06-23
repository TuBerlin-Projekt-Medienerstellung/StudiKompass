"use client";

import Link from "next/link";
import {useState, useEffect} from 'react';
import {X, SquareArrowOutUpRight, Circle, CircleCheckBig,} from 'lucide-react';
import {link} from "fs";
import {details} from "@/constants";

{/**wahrscheinlich neuer type notwendig um alle Infos aus Supabase zu holen, momentan noch modulInfo aus types.d.ts */
}

interface ModulInfoSupabase {
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

type Props = {
    isOpen: boolean;
    onClose: () => void;
    modul: modulInfo | null;
};

const ModulCardModal = ({
                            isOpen,
                            onClose,
                            modul,
                        }: Props) => {

    const [checked, setChecked] = useState(false);
    const [counter, setCount] = useState(0);

    const increase = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (counter < 4) {
            setCount(prev => prev + 1);
        }
    };

    const decrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (counter > 0) {
            setCount(prev => prev - 1);
        }
    };


    useEffect(() => {
        setChecked(false);
    }, [modul]);

    if (!modul || !isOpen) return null;

    {/** Eigentlich noch notwendig: Dozent, pruefungsform (nicht in modulInfo -> neuer type?) */
    }
    const {
        modul_id,
        name,
        leistungspunkte,
        semester,
        modulArt,
        link,
        beschreibung,

    } = modul;


    return (

        <div>
            {/**wird nur ausgeführt wenn modul =! NULL */}
            {modul && (
                <div
                    className={`fixed z-50 bg-card rounded-xl bottom-8 left-4 right-4 md:left-75 md:right-3 transition-transform transform duration-300 ease-out ${
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

                                <button type="button" onClick={onClose}>
                                    <X className="w-4 h-4"/>
                                </button>
                            </div>

                            {/* Name und Infos*/}
                            <div className="flex flex-col md:flex-row md:items-center justify-start gap-y-2 md:gap-x-6">
                                <h1 className="font-bold md:text-3xl text-xl tracking-tight">
                                    {modul.name}
                                </h1>
                                <div className="flex flex-row flex-wrap items-center gap-3 text-sm md:text-base md:pt-1">
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
                                        <div className="flex items-center gap-1 px-2 py-0.5 text-xs bg-muted border rounded-xl">
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
                        <div className="flex flex-col gap-2 rounded-lg">
                            <div className="flex rounded-lg gap-2 flex-col md:flex-row">
                                {/**Ob das Modul schon abgeschlossen ist -> speichert checked oder nicht checked aber noch nicht richtig :(*/}
                                <button
                                    onClick={() => setChecked(!checked)}
                                    className={`flex px-4 py-2 rounded-lg md:flex-1 justify-center ${
                                        checked
                                            ? 'bg-stone-grey text-black'
                                            : 'bg-mint-leaf text-white'
                                    }`}>
                                    {checked
                                        ? <span className="flex items-center gap-2"><Circle/>Als abgeschlossen markieren</span>
                                        : <span className="flex items-center gap-2"><CircleCheckBig/>Als abgeschlossen markiert</span>
                                    }
                                </button>
                                <Link href={modul.link}
                                      className="bg-flag-red text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 md:w-auto">
                                    zu Moses
                                    <SquareArrowOutUpRight/>
                                </Link>
                            </div>
                            <button className="bg-blue-bell text-white px-4 py-2 rounded-lg w-full">
                                Modul bewerten
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
export default ModulCardModal;
