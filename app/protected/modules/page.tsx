"use client"; // für UseState

import ModulCard from "@/components/modul-card";
import {Plus, Search, Funnel} from 'lucide-react';
import {modulInfo} from "@/constants";
import {useState} from "react"; //speichern was ausgewählt wurde

export default function ModulesPage() {
    const [selectedModulArt, setSelectedModulArt] = useState("");

    const gefilterteModule = modulInfo.filter((modul) => {    // erzeugen einer gefilterten Liste um nur die richtigen anzu zeigen 
        if (selectedModulArt === "") return true;

        return modul.modulArt === selectedModulArt;
    });

    return (
        <section className="flex flex-col gap-3">
            <header className="flex md:justify-between md:flex-row flex-col items-center md:items-start gap-6">
                <div className="w-full text-left">
                    <h1 className="font-bold text-3xl">Modulkatalog</h1>
                    <p className="opacity-70">Durchsuche und Verwalte verfügbare Module</p>
                </div>
                <button
                    className="hidden md:flex bg-flag-red font-bold gap-2 text-white justify-center items-center px-3 rounded-2xl w-64 h-11">
                    <Plus/>
                    Costum-Modul
                </button>
            </header>
            <div className="h-1"></div>

            <div className="rounded-2xl bg-white border-y-2 border-x-4 p-4 mb-2">
                <div className="flex flex-col gap-4 md:flex-row">
                    <div
                        className="focus-within:border-blue-bell transition-colors border-2 rounded-2xl flex w-full md:flex-1 py-3 px-5 gap-3 pointer-events-auto">
                        <label htmlFor="search"> <Search/></label>
                        <input className="w-full focus:outline-none" type="text" id="search"
                               placeholder="Module durchsuchen"/>
                    </div>

                    <div className="flex gap-4">
                        <button
                            className="flex md:hidden bg-flag-red text-white justify-center items-center rounded-2xl w-12 h-12 shrink-0">
                            <Plus/>
                        </button>

                        <div className="border-2 rounded-2xl py-3 px-4 flex items-center justify-center md:justify-start flex-1 md:w-auto gap-2 relative">
                            <Funnel className="shrink-0" />

                            <select
                                className="absolute inset-0 opacity-0 cursor-pointer md:static md:opacity-100 md:w-full focus:outline-none"
                                name="types"
                                id="types"
                            >
                                <option value="" className="italic">-Auswahl-</option>
                                <option value="Elektronik">Elektronik</option>
                                <option value="Informatik">Informatik</option>
                                <option value="Mathematik">Mathematik</option>
                            </select>
                        </div>

                        <div className="border-2 rounded-2xl py-3 px-4 flex items-center justify-center md:justify-start flex-1 md:w-auto gap-2 relative">
                            <Funnel className="shrink-0" />

                            <select // Auswahl -> speicher in liste 
                                className="absolute inset-0 opacity-0 cursor-pointer md:static md:opacity-100 md:w-full focus:outline-none"
                                name="kindOfModul"
                                id="kindOfModul"
                                value={selectedModulArt}
                                onChange={(e) => setSelectedModulArt(e.target.value)}
                            >
                                <option value="" className="italic">-Auswahl-</option>
                                <option value="Pflichtmodul">Pflichtmodul</option>
                                <option value="Wahlpflichtmodul">Wahlpflichtmodul</option>
                                <option value="Wahlmodul">Wahlmodul</option>
                                <option value="Projektmodul">Projektmodul</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

{/** nur die richtige Anzahl anzeigen **/}
            <p className="text-sm font-medium text-muted-foreground mb-4">
                {gefilterteModule.length} Module gefunden 
            </p>

            {/** Hier drüber iterieren **/}
            <div className="w-full flex flex-col gap-4">
                {gefilterteModule.map((info, index) =>
                    <ModulCard key={index} {...info}/>
                )}
            </div>

        </section>
    );
}