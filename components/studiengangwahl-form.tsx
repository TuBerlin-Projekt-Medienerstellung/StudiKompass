"use client" ;
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function StudiengangForm({degrees, current}: {
    degrees: any[]
    current: string
    }){
        const [query, setQuery] = useState(current)
        const [selected, setSelected] = useState<{id:number, name:string} | null>(null)
        const filtered = degrees.filter(deg =>
        deg.name?.toLowerCase().includes(query.toLowerCase())
        )
        const formatType = (typeName: string) => {
            if (typeName === "Bachelor of Science") return "B.Sc."
            if (typeName === "Master of Science") return "M.Sc."
            return typeName  
        }
        const handleSave = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        if (!user || !selected) return
        await supabase.from("profiles").update({ studiengang: selected.name, studiengang_id: selected.id }).eq("id", user.id)
        window.dispatchEvent(new CustomEvent("studiengang-updated")) 
    }
    return(
        <div className="w-full">
            <section className="w-full space-y-8">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-600 dark:border-zinc-800 p-6 rounded-xl">
                    <div className="space-y-4">
                        <label className="block text-base font-semibold text-black dark:text-white mb-2">
                            Studiengangwahl
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
                                placeholder="Studiengang wählen..."
                                className="w-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-700 text-black dark:text-white rounded-lg px-4 py-2 outline-hidden"
                            />

                            {/* Liste nur sichtbar wenn: etwas getippt wurde UND noch nichts ausgewählt */}
                            {query.length > 0 && !selected && (
                                <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-700 rounded-lg">
                                    {filtered.map((deg, index) => {
                                        const typeName = deg?.studiengangart?.name ?? ""
                                        const displayName = typeName
                                            ? `${deg.name} (${formatType(typeName)})`
                                            : deg.name
                                        
                                            
                                        return (
                                            <li
                                                key={deg?.id?.toString() || index}
                                                onClick={() => {
                                                    setQuery(displayName)    // Input zeigt den Namen
                                                    setSelected({id: deg.id ,name : displayName}) // merkt sich die Auswahl für handleSave
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

                        {/* Speichern-Button bleibt gleich, nur disabled wenn nichts ausgewählt */}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!selected}
                            className="text-base bg-zinc-400 hover:bg-zinc-200 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-bold transition-all"
                        >
                            Studiengang speichern
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}