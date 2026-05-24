// components/modul-card.tsx
"use client";

/**
 * ModulCard Komponente
 *
 * Zeigt eine einzelne Modulkarte mit Name, ECTS und Modulart.
 * Beim Ausklappen wird die modulId als Prop weitergegeben —
 * bereit für einen späteren Detail-Fetch (Beschreibung, Prüfungsform etc.)
 *
 * Bewusst schlank gehalten — nur Basisinformationen werden angezeigt.
 * Details werden erst beim Ausklappen geladen (noch nicht implementiert).
 */

import { ChevronUp, ChevronDown, Circle, CircleCheckBig } from 'lucide-react';
import { useState } from 'react';

interface ModulCardProps {
    id: number;            // Studiengangszuordnung ID — wird beim Ausklappen weitergegeben
    name: string;          // Modulname
    leistungspunkte: number; // ECTS
    modulArt: string;      // Erster Eintrag des bereichPfad, z.B. "Pflichtmodule"
    onAusklappen?: (modulId: number) => void; // Callback für Detail-Fetch — optional
}

const ModulCard = ({ id, name, leistungspunkte, modulArt, onAusklappen }: ModulCardProps) => {
    // Ob das Modul als "erledigt" markiert ist
    const [liked, setLiked] = useState(false);
    // Ob die Karte ausgeklappt ist
    const [open, setOpen] = useState(false);

    /**
     * Wird aufgerufen wenn der User auf den Ausklapp-Pfeil klickt.
     * Beim ersten Ausklappen wird onAusklappen(id) aufgerufen —
     * damit kann die übergeordnete Komponente die Details fetchen.
     */
    function handleAusklappen() {
        if (!open && onAusklappen) {
            // modulId weitergeben für späteren Detail-Fetch
            onAusklappen(id);
        }
        setOpen(!open);
    }

    return (
        <div className={`w-full flex flex-col border-y-2 border-x-4 rounded-xl px-6 pt-4 transition-all duration-700 ${open ? 'pb-6' : 'pb-4'}`}>
            <header className='w-full flex justify-between items-center'>
                <div className='flex w-fit gap-2.5'>
                    {/* Button: Modul als erledigt markieren */}
                    <button onClick={() => setLiked(!liked)}>
                        {liked ? <CircleCheckBig className="text-mint-leaf" /> : <Circle />}
                    </button>

                    <div className='flex gap-6 items-center md:flex-row flex-col'>
                        {/* Modulname */}
                        <h1 className='font-bold md:text-2xl text-xl'>{name}</h1>
                        <div className='flex gap-2'>
                            {/* ECTS */}
                            <div>{leistungspunkte} ECTS</div>
                            <span>•</span>
                            {/* Modulart — z.B. "Pflichtmodule" oder "Wahlpflichtmodule" */}
                            <p className='text-blue-bell'>{modulArt}</p>
                        </div>
                    </div>
                </div>

                {/* Ausklapp-Button */}
                <div className="cursor-pointer" onClick={handleAusklappen}>
                    {open ? <ChevronUp /> : <ChevronDown />}
                </div>
            </header>

            {/* Ausgeklappter Bereich — Platzhalter für Detail-Komponente */}
            <div className={`grid transition-all duration-700 ease-in-expo ${open ? 'grid-rows-[1fr] mt-5' : 'grid-rows-[0fr] mb-0'}`}>
                <div className='overflow-hidden'>
                    {/**
                     * TODO: Detail-Komponente einbinden
                     * Beim Ausklappen soll eine separate Komponente die Details fetchen:
                     * - Beschreibung (Lernergebnisse / Lehrinhalte)
                     * - Prüfungsform
                     * - Turnus
                     * - Link zu Moses
                     * - "Zum Planer hinzufügen" Button
                     * Die modulId wird via onAusklappen(id) weitergegeben.
                     */}
                    <p className="opacity-50 text-sm">
                        Details werden hier geladen... (modulId: {id})
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModulCard;