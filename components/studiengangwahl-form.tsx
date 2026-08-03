"use client";
import {useState} from "react"
import {createClient} from "@/lib/supabase/client"
import {GraduationCap} from "lucide-react"
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";

export default function StudiengangForm({degrees, current}: {
    degrees: any[]
    current: string
}) {

    const [query, setQuery] = useState(current || "")
    const [savedStudiengang, setSavedStudiengang] = useState(current || "")
    const [selected, setSelected] = useState<{ id: number, name: string } | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const filtered = degrees.filter(deg =>
        deg.name?.toLowerCase().includes(query.toLowerCase())
    )
    const formatType = (typeName: string) => {
        if (typeName === "Bachelor of Science") return "B.Sc."
        if (typeName === "Master of Science") return "M.Sc."
        return typeName
    }
    const handleSave = async () => {
        if (!selected) return
        setIsSaving(true)
        setIsSuccess(false)
        setError(null)

        try {
            const supabase = createClient()
            const {data: {user}} = await supabase.auth.getUser()

            if (!user) throw new Error("Nicht angemeldet.")

            const { error: updateError } = await supabase.from("profiles").update({
                studiengang: selected.name,
                studiengang_id: selected.id
            }).eq("id", user.id)

            if (updateError) throw updateError

            setSavedStudiengang(selected.name)
            setSelected(null)
            setIsSuccess(true)

            window.dispatchEvent(new CustomEvent("studiengang-updated"))
        } catch (err: any) {
            console.error("Fehler beim Speichern:", err)
            setError(err.message || "Fehler beim Speichern des Studiengangs.")
        } finally {
            setIsSaving(false)
        }
    }
    const isDisabled = !selected || selected.name === savedStudiengang || isSaving;

    return (
        <div className="w-full">
            <section className="w-full space-y-8">
                <div className="rounded-xl border-2 bg-card shadow-sm p-6 gap 4">
                    <div className="space-y-4">
                        <div className="flex flex-row gap-4 pb-1 md:justify-start items-center">
                            <GraduationCap className="text-flag-red w-8 h-8 stroke-1.5"></GraduationCap>
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
                                    setIsSuccess(false) // verstecken, wenn getippt wird
                                    setError(null)
                                }}
                                placeholder="Studiengang wählen..."
                                className="w-full border text-black dark:text-white rounded-md px-3 py-1.5 shadow-xs"
                            />

                            {/* Liste nur sichtbar wenn: etwas getippt wurde UND noch nichts ausgewählt */}
                            {query.length > 0 && !selected && (
                                <ul className="absolute z-16 w-full mt-1 max-h-60 overflow-y-auto bg-card border rounded-lg">
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
                                                    setSelected({id: deg.id, name: displayName}) // merkt sich die Auswahl für handleSave
                                                    setIsSuccess(false) // verstecken, wenn neue Auswahl geklickt wird
                                                    setError(null)
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
                        {error && <p className="text-sm text-flag-red">{error}</p>}
                        {isSuccess && (
                                    <p className="text-sm text-mint-leaf">
                                        Erfolgreich gespeichert! ✓
                                    </p>
                                )}
                        
                        {/* Speichern-Button bleibt gleich, nur disabled wenn nichts ausgewählt */}

                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isDisabled}
                            className="w-full text-primary-foreground bg-flag-red hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-6 py-2 transition-all"
                        >
                            {isSaving ? "Wird gespeichert..." : "Studiengang speichern"}
                        </Button>

                    </div>
                </div>
            </section>
        </div>
    )
}
