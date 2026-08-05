"use client";

import { cn, berechneTurnus } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { getSemesters, updateSemesterTable } from "@/app/protected/planner/actions";

const TURNUS_OPTIONS = [
    {value: "", label: "Bitte wählen..."},
    {value: "WiSe", label: "Wintersemester (WiSe)"},
    {value: "SoSe", label: "Sommersemester (SoSe)"},
];

export function UpdateSemesterForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [currentSemester, setCurrentSemester] = useState<string>("");
    const [maxSemester, setMaxSemester] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [turnusQuery, setTurnusQuery] = useState<string>("");
    const [selectedTurnus, setSelectedTurnus] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);
    const [originalCurrent, setOriginalCurrent] = useState<number | null>(null);
    const [originalTurnus, setOriginalTurnus] = useState<string | null>(null);
    const [autoUpdate, setAutoUpdate] = useState<boolean>(false);
    const [originalMax, setOriginalMax] = useState<string | null>(null);


    const filteredTurnus = TURNUS_OPTIONS.filter((opt) =>
        opt.label.toLowerCase().includes(turnusQuery.toLowerCase())
    );
    useEffect(() => {
        async function ladeSemester() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from("profiles")
                    .select("current_semester, max_semester, current_turnus, auto_semester_update_enabled")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;

                if (data?.current_semester) setCurrentSemester(String(data.current_semester));
                if (data?.max_semester) {
                    setMaxSemester(String(data.max_semester));
                    setOriginalMax(String(data.max_semester));
                }
                if (data?.current_turnus) {
                    setSelectedTurnus(data.current_turnus);
                    const match = TURNUS_OPTIONS.find(t => t.value === data.current_turnus);
                    if (match) setTurnusQuery(match.label);
                }

                // Anker für die Turnus-Automatik merken
                setOriginalCurrent(data?.current_semester ?? null);
                setOriginalTurnus(data?.current_turnus ?? null);
                setAutoUpdate(data?.auto_semester_update_enabled ?? false);
            } catch (e) {
                console.error("Fehler beim Laden der Semesterdaten:", e);
            } finally {
                setIsLoadingData(false);
            }
        }
        ladeSemester();
    }, []);

    function validiereEingabe(): boolean {
        const current = Number(currentSemester);
        const max = Number(maxSemester);

        if (!currentSemester || !maxSemester) {
            setError("Bitte beide Felder ausfüllen.");
            return false;
        }
        if (Number.isNaN(current) || Number.isNaN(max)) {
            setError("Bitte gültige Zahlen eingeben.");
            return false;
        }
        if (!Number.isInteger(current) || !Number.isInteger(max)) {
            setError("Bitte nur ganze Zahlen eingeben.");
            return false;
        }
        if (current < 1 || max < 1) {
            setError("Semesterzahlen müssen mindestens 1 sein.");
            return false;
        }
        if (current > max) {
            setError("Das aktuelle Semester kann nicht größer als das maximale sein.");
            return false;
        }
        if (max > 20) {
            setError("Das maximale Semester darf nicht größer als 20 sein.");
            return false;
        }
        if (!selectedTurnus) {
            setError("Bitte einen Turnus wählen.");
            return false;
        }
        return true;
    }

    async function handleSpeichern(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsSuccess(false);

        if (!validiereEingabe()) return;

        setIsLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Nicht eingeloggt.");

            const max = Number(maxSemester);

            // Prüfen wie viele Semester schon im Planer existieren
            const vorhandeneSemester = await getSemesters();
            const anzahlVorhanden = vorhandeneSemester?.length ?? 0;

            // Fehlerfall A: mehr Semester vorhanden als max → nichts speichern
            if (max < anzahlVorhanden) {
                setError(
                    `Du hast bereits ${anzahlVorhanden} Semester im Planer. ` +
                    `Bitte lösche überzählige zuerst im Planer, bevor du die Anzahl reduzierst.`
                );
                setIsLoading(false);
                return;
            }

            // profiles updaten (max + current)
            const { error } = await supabase
                .from("profiles")
                .update({
                    current_semester: Number(currentSemester),
                    max_semester: max,
                    auto_semester_update_enabled: autoUpdate,
                    current_turnus: selectedTurnus,
                })
                .eq("id", user.id);

            if (error) throw error;

            // Fehlende Semesterzeilen anlegen (von anzahlVorhanden+1 bis max)
            for (let nummer = anzahlVorhanden + 1; nummer <= max; nummer++) {
                await updateSemesterTable(nummer);
            }

            setIsSuccess(true);

            setOriginalCurrent(Number(currentSemester));
            setOriginalTurnus(selectedTurnus);
            setOriginalMax(maxSemester);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten.");
        } finally {
            setIsLoading(false);
        }
    }

    // Prüfen: Hat sich etwas ggü der gespeicherten Werte geändert?
    const isUnchanged =
        currentSemester === (originalCurrent !== null ? String(originalCurrent) : "") && selectedTurnus === (originalTurnus ?? "") && maxSemester === (originalMax ?? "");
    const isDisabled = isLoading || isUnchanged;

    return (
        <div className={cn(className)} {...props}>
            <Card>
                <CardHeader className="flex flex-row gap-4 pb-4 md:justify-start items-center">
                    <CalendarDays className="text-flag-red w-8 h-8 stroke-2" />
                    <CardTitle className="text-xl font-bold">Semesterplanung</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-zinc-500 pb-5">
                        Gib dein aktuelles Semester und deine geplante Studiendauer ein.
                    </CardDescription>
                    {isLoadingData ? (
                        <p className="text-sm text-zinc-500">Wird geladen ...</p>
                    ) : (
                        <form onSubmit={handleSpeichern}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="current_semester">Aktuelles Semester</Label>
                                    <Input
                                        id="current_semester"
                                        type="number"
                                        placeholder="z.B. 1"
                                        min={1}
                                        max={
                                            Number(maxSemester) >= 1 && Number(maxSemester) <= 20
                                                ? Number(maxSemester)
                                                : 20
                                        }
                                        value={currentSemester}
                                        onChange={(e) => {
                                            const rohWert = e.target.value;
                                            setCurrentSemester(rohWert);
                                            setIsSuccess(false);
                                            setError(null);

                                            const neuesCurrent = Number(rohWert);

                                            // Turnus nur mitwandern lassen, wenn die Eingabe gültig ist (Fallbacks)
                                            if (
                                                Number.isInteger(neuesCurrent) &&
                                                neuesCurrent >= 1 &&
                                                neuesCurrent <= 20 &&
                                                originalCurrent !== null &&
                                                originalTurnus !== null
                                            ) {
                                                const neuerTurnus = berechneTurnus(neuesCurrent, originalCurrent, originalTurnus);
                                                if (neuerTurnus) {
                                                    setSelectedTurnus(neuerTurnus);
                                                    const match = TURNUS_OPTIONS.find(t => t.value === neuerTurnus);
                                                    if (match) setTurnusQuery(match.label);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="turnus">Turnus des aktuellen Semesters</Label>
                                    <div className="relative pt-1 pb-2">
                                        <input
                                            id="turnus"
                                            type="text"
                                            readOnly
                                            value={turnusQuery || "Bitte wählen..."}
                                            onClick={() => setIsOpen((prev) => !prev)}
                                            placeholder="Turnus wählen..."
                                            className="w-full border text-black dark:text-white rounded-md px-3 py-1.5 shadow-xs"
                                        />
                                        {isOpen && (
                                            <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-card text-card-foreground border rounded-lg">
                                                {TURNUS_OPTIONS.map((item) => (
                                                    <li
                                                        key={item.value}
                                                        onClick={() => {
                                                            setTurnusQuery(item.label);
                                                            setSelectedTurnus(item.value);
                                                            setIsOpen(false);
                                                            setIsSuccess(false);
                                                            setError(null);
                                                        }}
                                                        className="px-4 py-2 cursor-pointer hover:bg-secondary"
                                                    >
                                                        {item.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="max_semester">Studiendauer / Maximale Semesteranzahl</Label>
                                    <Input
                                        id="max_semester"
                                        type="number"
                                        placeholder="z.B. 6"
                                        min={1}
                                        max={20}
                                        value={maxSemester}
                                        onChange={(e) => {
                                            setMaxSemester(e.target.value);
                                            setIsSuccess(false);
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="autoUpdate"
                                        checked={autoUpdate}
                                        onChange={(e) => setAutoUpdate(e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="autoUpdate">
                                        Automatisches Erhöhen des aktuellen Semesters zum Start des Wintersemesters (01.10.) und des Sommersemesters (01.04.)
                                    </Label>
                                </div>
                                {error && <p className="text-sm text-flag-red">{error}</p>}
                                {isSuccess && (
                                    <p className="text-sm text-mint-leaf">
                                        Erfolgreich gespeichert! ✓
                                    </p>
                                )}
                                <Button type="submit" className="w-full bg-flag-red" disabled={isDisabled}>
                                    {isLoading ? "Wird gespeichert..." : "Speichern"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}