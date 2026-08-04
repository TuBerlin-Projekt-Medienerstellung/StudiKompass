"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
//I js took the studiengangwahl form and edited it a lil bit to js accept plain text..
export default function Stupo() {
    const [input, setInput] = useState("");
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     //security purposes
    //     const onlyNumbers = e.target.value.replace(/\D/g, "");
    //     setInput(onlyNumbers.slice(0, 4));
    // };
    const [savedStupo, setSavedStupo] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchStupo() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error: fetchError } = await supabase
                    .from("profiles")
                    .select("stupo_year")
                    .eq("id", user.id)
                    .single();

                if (fetchError) throw fetchError;

                const initialValue = data?.stupo_year || "";
                setInput(initialValue);
                setSavedStupo(initialValue);
            } catch (err: any) {
                console.error("Fehler beim Laden:", err);
                setError("Konnte Daten nicht laden.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchStupo();
    }, []);
    const handleSave = async () => {
        setIsSaving(true);
        setIsSuccess(false);
        setError(null);

        try{
            const supabase = createClient()
            const {data: {user}} = await supabase.auth.getUser()
            if (!user) throw new Error("Nicht angemeldet.");

            const valueToSave = input.trim();
            const { error: updateError } = await supabase.from("profiles").update({
                stupo_year: valueToSave,
            }).eq("id", user.id);

            if (updateError) throw updateError;
            setSavedStupo(valueToSave);
            setIsSuccess(true);

            window.dispatchEvent(new CustomEvent("studiengang-updated"));
            window.dispatchEvent(new CustomEvent("stupo-updated"));
        } catch (err: any) {
            console.error("Fehler beim Speichern:", err);
            setError(err.message || "Fehler beim Speichern der StuPo.");      
        } finally {
        setIsSaving(false);
        }
    };
    const isDisabled = isLoading || isSaving || input.trim() === savedStupo.trim();
    // const isValid = input.length === 4;
    return (
            <div className="w-full">
                <section className="w-full space-y-8">
                    <div className="rounded-xl border-2 bg-card shadow-sm p-6 gap 4">
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                        >
                            <div className="flex flex-row gap-4 pb-1 md:justify-start items-center">
                                <GraduationCap className="text-flag-red w-8 h-8 stroke-1.5" />
                                <h1 className="text-xl font-bold">Studien- und Prüfungsordnung</h1>
                            </div>

                            <div className="relative pt-1 pb-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setIsSuccess(false);
                                        setError(null);
                                    }}
                                    placeholder={isLoading ? "Lade..." : "z.B. Allg. PO der TU"}
                                    disabled={isLoading || isSaving}
                                    className="w-full border text-black dark:text-white rounded-md px-3 py-1.5 shadow-xs"
                                />
                            </div>
                            {error && <p className="text-sm text-flag-red">{error}</p>}
                            {isSuccess && (
                                <p className="text-sm text-mint-leaf">
                                    Erfolgreich gespeichert! ✓
                                </p>
                            )}
                            <Button
                                type="submit"
                                disabled={isDisabled} 
                                className="w-full text-primary-foreground bg-flag-red hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-6 py-2 transition-all"
                            >
                                {isSaving ? "Wird gespeichert..." : isLoading ? "Lädt..." : "Stupo speichern"}
                            </Button>
                        </form>
                    </div>
                </section>
            </div>
        );
    }