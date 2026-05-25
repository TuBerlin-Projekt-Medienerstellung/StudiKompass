"use client";

import Link from "next/link";
import {useState} from 'react';
import { X , SquareArrowOutUpRight} from 'lucide-react';

//ist der Zugriff auf die Daten so richtig?
type modulInfo = {
    name: string;
    leistungspunkte: number;
    semester: string;
    modulArt: string;
    beschreibung: string;
    examform: string;
    arbeitsaufwand: string;
    link: string;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  modul: modulInfo| null;
};

const ModulCardModal = ({
  isOpen, //geöffnet oder nicht
  onClose,
  modul,
}: Props) => {
    
    const [checked, setChecked] = useState(false); //Modul abgeschlossen oder nicht
    
    if (!isOpen || !modul) return null;
    
    return (
        <div className="flex flex-col p-8 gap-6 border-y-2 border-x-4 rounded-xl">
            <header className="flex flex-col gap-y-2">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex justifycenter bg-flag-red/50 text-flag-red rounded-xl py-1 px-2 w-fit items-center justify-center">
                    {modul.modulArt}
                    </div>
                    
                    <button type="button">
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
                        Dozent? {/**Können wir das fetchen? */}
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
                <div className="bg-[#E3E6EA] flex border-2 rounded-xl w-full items-center p-4 flex-col">
                    <p>
                       Arbeitsaufwand 
                    </p>
                    <p className="font-semibold">
                        {modul.arbeitsaufwand}
                    </p>
                </div>
                <div className="bg-[#E3E6EA] flex border-2 rounded-xl w-full items-center p-4 flex-col">
                    <p>
                        Angebot
                    </p>
                    <p className="font-semibold">
                        {modul.semester}
                    </p>
                    
                </div>
                <div className="bg-[#E3E6EA] flex border-2 rounded-xl w-full items-center p-4 flex-col">
                    <p>
                        Prüfungsform
                    </p>
                    <p className="font-semibold">
                        {modul.examform}
                    </p>
                </div>
            </div>
            <div className="flex rounded-lg gap-2 flex-col md:flex-row">
                <button className="bg-mint-leaf text-white px-4 py-2 rounded-lg md:flex-1">
                    Als abgeschlossen markieren
                </button>
                <Link href={modul.link}
                    className="bg-flag-red text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 md:w-auto">
                    zu Moses
                    <SquareArrowOutUpRight/>
                </Link>
            </div>
        </div>
    )
}
export default ModulCardModal;
