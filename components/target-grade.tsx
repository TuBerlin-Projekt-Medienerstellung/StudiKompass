"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
    initialValue: number | null;
};

export default function TargetGradeInput({ initialValue }: Props) {
    const [value, setValue] = useState(initialValue?.toString() ?? "");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            const numberValue = Number(value);

            if (value === "" || Number.isNaN(numberValue)) return;
            if (numberValue < 1.0 || numberValue > 4.0) return;

            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            await supabase
                .from("profiles")
                .update({ target_grade: numberValue })
                .eq("id", user.id);

            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
        }, 1200);

        return () => clearTimeout(timeout);
    }, [value]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm">Wunschschnitt:</span>

            <input
                type="number"
                min="1"
                max="4"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm outline-none"
                placeholder="2.0"
            />

            {saved && (
                <span className="text-xs text-mint-leaf">
                    gespeichert
                </span>
            )}
        </div>
    );
}