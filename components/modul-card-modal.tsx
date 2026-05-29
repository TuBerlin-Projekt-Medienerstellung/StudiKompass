"use client";

import Link from "next/link";
import {useState, useEffect} from 'react';
import { X , SquareArrowOutUpRight, Circle, CircleCheckBig,} from 'lucide-react';


type ModulInfo = {
    name: string;
    leistungspunkte: number;
    semester: string;
    modulArt: string;
    beschreibung: string;
    examform: string;
    arbeitsaufwand: string;
    link: string;
    dozent: string;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  modul: ModulInfo | null;
};

const ModulCardModal = ({
  isOpen, //geöffnet oder nicht
  onClose,
  modul,
}: Props) => {
    
    const [checked, setChecked] = useState(false); //Modul abgeschlossen oder nicht
    
    {/**damit setChecked für jedes Modul einzeln aufgerufen wird*/}
    useEffect(() => {
    setChecked(false);
    }, [modul]);
    
    return (

        <div>
            {/**wird nur ausgeführt wenn modul =! NULL */}
            {modul && (
        <div className={`fixed bottom-0 bottom-0 left-0 md:left-72 right-0 flex justify-center transition-transform transform duration-300 ease-out ${
        isOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}>
            <div
            className="w-full bg-white flex flex-col p-8 gap-6 border-y-2 border-x-2 rounded-t-xl">
                <header className="flex flex-col gap-y-2">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex justifycenter bg-flag-red/50 text-flag-red rounded-xl py-1 px-2 w-fit items-center justify-center">
                        {modul.modulArt}
                        </div>
                        
                        <button type="button" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </button>

                    </div>
                    
                    <h1 className="font-bold md:text-2xl text-xl">
                        {modul.name}
                    </h1>
                    <div className="flex flex-row justify-items-start gap-4">
                        <p className="text-flag-red">
                            {modul.leistungspunkte} ECTS
                        </p>
                        <div>•</div>
                        <p>
                            {modul.semester}
                        </p>
                        <div>•</div>
                        <p>
                            {modul.dozent}
                        </p>
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
                    <div className="bg-stone-grey flex border-2 rounded-xl w-full items-center p-4 flex-col">
                        <p>
                        Arbeitsaufwand 
                        </p>
                        <p className="font-semibold">
                            {modul.arbeitsaufwand}
                        </p>
                    </div>
                    <div className="bg-stone-grey flex border-2 rounded-xl w-full items-center p-4 flex-col">
                        <p>
                            Angebot
                        </p>
                        <p className="font-semibold">
                            {modul.semester}
                        </p>
                        
                    </div>
                    <div className="bg-stone-grey flex border-2 rounded-xl w-full items-center p-4 flex-col">
                        <p>
                            Prüfungsform
                        </p>
                        <p className="font-semibold">
                            {modul.examform}
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
