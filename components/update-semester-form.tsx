"use client";

import { cn } from "@/lib/utils";
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

    useEffect(() => {
        async function ladeSemester() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from("profiles")
                    .select("current_semester, max_semester")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;

                if (data?.current_semester) setCurrentSemester(String(data.current_semester));
                if (data?.max_semester) setMaxSemester(String(data.max_semester));
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

            const { error } = await supabase
                .from("profiles")
                .update({
                    current_semester: Number(currentSemester),
                    max_semester: Number(maxSemester),
                })
                .eq("id", user.id);

            if (error) throw error;
            setIsSuccess(true);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten.");
        } finally {
            setIsLoading(false);
        }
    }

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
                                        max={20}
                                        value={currentSemester}
                                        onChange={(e) => setCurrentSemester(e.target.value)}
                                    />
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
                                        onChange={(e) => setMaxSemester(e.target.value)}
                                    />
                                </div>
                                {error && <p className="text-sm text-flag-red">{error}</p>}
                                {isSuccess && (
                                    <p className="text-sm text-mint-leaf">
                                        Erfolgreich gespeichert! ✓
                                    </p>
                                )}
                                <Button type="submit" className="w-full bg-flag-red" disabled={isLoading}>
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