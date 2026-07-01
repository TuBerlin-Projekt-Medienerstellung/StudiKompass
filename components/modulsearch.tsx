"use client" ;
import { useState } from "react"
import { ModulBasis } from '@/app/protected/modules/actions';

interface Props {
    modules: ModulBasis[];
    query: string;
    onQueryChange: (value: string) => void;
    // current?:string
}

export default function ModulSearch({modules, query, onQueryChange}:Props){
        const [selected, setSelected] = useState<{id:string, name:string} | null>(null)
        const filtered = modules.filter(m =>
        m.name?.toLowerCase().includes(query.toLowerCase())
        )
    return(
        <div className="bg-card border-y-2 border-x-4 border-border border-l-mint-leaf border-r-mint-leaf p-6 rounded-xl">
            <div className="space-y-4">
                <label className="block text-base font-semibold text-black dark:text-white mb-2">
                    Suche nach deinem Modul
                </label>

            {/* Das alte <select> ist weg, stattdessen Input + Liste */}
                    <div className="relative">

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                // optional: Fokus verlieren oder Auswahl setzen
                            }}
                        >
                            <input
                                type="text"
                                value={query}
                                onChange={e => {
                                    onQueryChange(e.target.value);
                                    setSelected(null) // wenn der User wieder tippt, Auswahl zurücksetzen
                                }}
                                placeholder="Modulsuche.."
                                className="w-full bg-zinc-200 dark:bg-zinc-800 border border-grey text-black dark:text-white rounded-lg px-4 py-2 outline-hidden"
                            />
                        </form>

                        {/* Liste nur sichtbar wenn: etwas getippt wurde UND noch nichts ausgewählt */}
                        {query.length > 0 && !selected && (
                            <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-700 rounded-lg">
                                {filtered.map((m, index) => {
                                    const displayName = m.name;
                                        
                                            
                                    return (
                                        <li
                                            key={m?.id?.toString() || index}
                                            onClick={() => {
                                                onQueryChange(m.name);   // Input zeigt den Namen
                                                setSelected({id: m.id.value.toString() ,name : displayName}) // merkt sich die Auswahl für handleSave
                                            }}
                                            className="px-4 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                        >
                                            {displayName}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
            </div>
        </div>
    )}
