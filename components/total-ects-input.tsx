"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type TotalEctsInputProps = {
    initialValue: number;
};

export default function TotalEctsInput({
    initialValue,
}: TotalEctsInputProps) {
    const supabase = createClient();
    const router = useRouter();

    const [totalEcts, setTotalEcts] = useState(
        initialValue.toString()
    );
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    async function handleSave() {
        const parsedTotalEcts = Number(totalEcts);

        setMessage(null);
        setHasError(false);

        if (
            !Number.isInteger(parsedTotalEcts) ||
            parsedTotalEcts <= 0
        ) {
            setMessage("Bitte gib eine gültige Gesamt-ECTS-Zahl ein.");
            setHasError(true);
            return;
        }

        setIsSaving(true);

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            setMessage("Der Nutzer konnte nicht ermittelt werden.");
            setHasError(true);
            setIsSaving(false);
            return;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                total_ects: parsedTotalEcts,
            })
            .eq("id", user.id);

        if (error) {
            console.error("Fehler beim Speichern der Gesamt-ECTS:", error);
            setMessage("Die Gesamt-ECTS konnten nicht gespeichert werden.");
            setHasError(true);
            setIsSaving(false);
            return;
        }

        setMessage("Gespeichert.");
        setHasError(false);
        setIsSaving(false);
        router.refresh();
    }

    return (
        <div className="space-y-2">
            <label
                htmlFor="total-ects"
                className="block text-sm font-medium"
            >
                Gesamt-ECTS
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    id="total-ects"
                    type="number"
                    min={1}
                    step={1}
                    value={totalEcts}
                    onChange={(event) => {
                        setTotalEcts(event.target.value);
                        setMessage(null);
                        setHasError(false);
                    }}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-flag-red sm:max-w-40"
                />

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-lg bg-flag-red px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving ? "Speichert …" : "Speichern"}
                </button>
            </div>

            {message && (
                <p
                    className={`text-sm ${
                        hasError
                            ? "text-red-600 dark:text-red-400"
                            : "text-mint-leaf"
                    }`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}