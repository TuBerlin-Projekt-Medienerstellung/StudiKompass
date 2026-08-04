"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type TargetGradeInputProps = {
    initialValue: number | null;
};

export default function TargetGradeInput({
    initialValue,
}: TargetGradeInputProps) {
    const supabase = createClient();
    const router = useRouter();

    const [targetGrade, setTargetGrade] = useState(
        initialValue !== null
            ? initialValue.toString()
            : ""
    );
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    async function handleSave() {
    const normalizedTargetGrade = targetGrade.trim().replace(",", ".");

    const parsedTargetGrade =
        normalizedTargetGrade === ""
            ? null
            : Number(normalizedTargetGrade);

    setMessage(null);
    setHasError(false);

    if (
        parsedTargetGrade !== null &&
        (
            !Number.isFinite(parsedTargetGrade) ||
            parsedTargetGrade < 1 ||
            parsedTargetGrade > 4
        )
    ) {
        setMessage("Bitte gib eine gültige Zielnote zwischen 1,0 und 4,0 ein.");
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
            target_grade: parsedTargetGrade,
        })
        .eq("id", user.id);

    if (error) {
        console.error("Fehler beim Speichern der Zielnote:", error);
        setMessage("Die Zielnote konnte nicht gespeichert werden.");
        setHasError(true);
        setIsSaving(false);
        return;
    }

    setMessage(
        parsedTargetGrade === null
            ? "Zielnote entfernt."
            : "Gespeichert."
    );
    setHasError(false);
    setIsSaving(false);
    router.refresh();
}

    return (
        <div className="space-y-2">
            <label
                htmlFor="target-grade"
                className="block text-sm font-medium"
            >
                Zielnote
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    id="target-grade"
                    type="number"
                    min={1}
                    max={4}
                    step={0.1}
                    value={targetGrade}
                    onChange={(event) => {
                        setTargetGrade(event.target.value);
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