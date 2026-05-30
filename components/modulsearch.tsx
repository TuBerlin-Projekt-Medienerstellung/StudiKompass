"use client" ;
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ModulBasis } from '@/app/protected/modules/actions';

interface Props {
    modules: ModulBasis[];
    // current?:string
}

export default function ModulSearch({modules}:Props){
        const [query, setQuery] = useState("")
        const [selected, setSelected] = useState<{id:number, name:string} | null>(null)
        const filtered = modules.filter(m =>
        m.name?.toLowerCase().includes(query.toLowerCase())
        )
    return(
        <div className="bg-white dark:bg-zinc-900 border border-zinc-600 dark:border-zinc-800 p-6 rounded-xl">
            <div className="space-y-4">
                <label className="block text-base font-semibold text-black dark:text-white mb-2">
                    Suche nach deinem Modul
                </label>

            {/* Das alte <select> ist weg, stattdessen Input + Liste */}
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value)
                                setSelected(null) // wenn der User wieder tippt, Auswahl zurücksetzen
                            }}
                            placeholder="Modulsuche.."
                            className="w-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-700 text-black dark:text-white rounded-lg px-4 py-2 outline-hidden"
                        />

                        {/* Liste nur sichtbar wenn: etwas getippt wurde UND noch nichts ausgewählt */}
                        {query.length > 0 && !selected && (
                            <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-700 rounded-lg">
                                {filtered.map((m, index) => {
                                    const displayName = m.name
                                            ? `${m.name} ()`
                                            : m.name
                                        
                                            
                                    return (
                                        <li
                                            key={m?.id?.toString() || index}
                                            onClick={() => {
                                                setQuery(displayName)    // Input zeigt den Namen
                                                setSelected({id: m.id ,name : displayName}) // merkt sich die Auswahl für handleSave
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
