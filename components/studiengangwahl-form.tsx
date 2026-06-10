"use client" ;
import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {GraduationCap, Pencil} from "lucide-react"
import {CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";

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
                <div className="rounded-xl border-2 bg-white shadow-sm p-6 gap 4">
                    <div className="space-y-4">
                            <div className="flex flex-row gap-4 pb-1 md:justify-start items-center">
                            <GraduationCap className="text-flag-red w-9 h-9 stroke-1.5"></GraduationCap>
                            <h1 className="text-xl font-bold">Studiengang</h1>
                        </div>

                        <Label htmlFor="password"> Studiengang: </Label>

                        {/* Das alte <select> ist weg, stattdessen Input + Liste */}
                        <div className="relative pt-1 pb-2">
                            <input
                                type="text"
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value)
                                    setSelected(null) // wenn der User wieder tippt, Auswahl zurücksetzen
                                }}
                                placeholder="Studiengang wählen..."
                                className="w-full border text-black rounded-md px-3 py-1.5 shadow-xs"
                            />

                            {/* Liste nur sichtbar wenn: etwas getippt wurde UND noch nichts ausgewählt */}
                            {query.length > 0 && !selected && (
                                <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border rounded-lg">
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
                                                className="px-4 py-2 cursor-pointer hover:bg-secondary"
                                            >
                                                {displayName}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Speichern-Button bleibt gleich, nur disabled wenn nichts ausgewählt */}
                        <Button type="button" className="w-full text-primary-foreground bg-flag-red"  onClick={handleSave} disabled={!selected}>
                                Speichere Studiengang
                        </Button>

                    </div>
                </div>
            </section>
        </div>
    )
}