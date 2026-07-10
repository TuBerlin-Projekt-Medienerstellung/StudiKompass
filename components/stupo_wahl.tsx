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
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    useEffect(() => {
        async function fetchStupo() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setIsLoading(false); return; }

            const { data } = await supabase
                .from("profiles")
                .select("stupo_year")
                .eq("id", user.id)
                .single();

            if (data?.stupo_year) setInput(data.stupo_year);
            setIsLoading(false);
        }
        fetchStupo();
    }, []);
    const handleSave = async () => {
        if (!input.trim()) return;
        const supabase = createClient()
        const {data: {user}} = await supabase.auth.getUser()
        if (!user) return
        const { error } = await supabase.from("profiles").update({
            stupo_year: input.trim(),
        }).eq("id", user.id);

        if (!error) {
            window.dispatchEvent(new CustomEvent("studiengang-updated"));
        } else {
            console.error("Fehler beim Speichern:", error);
        }
        window.dispatchEvent(new CustomEvent("stupo-updated"))
        }
    // const isValid = input.length === 4;
    return (
            <div className="w-full">
                <section className="w-full space-y-8">
                    <div className="rounded-xl border-2 bg-card shadow-sm p-6 gap 4">
                        <div className="space-y-4">
                            <div className="flex flex-row gap-4 pb-1 md:justify-start items-center">
                                <GraduationCap className="text-flag-red w-8 h-8 stroke-1.5" />
                                <h1 className="text-xl font-bold">Studien- und Prüfungsordnung</h1>
                            </div>

                            <div className="relative pt-1 pb-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isLoading ? "Lade..." : "z.B. Allg. PO der TU"}
                                    disabled={isLoading}
                                    className="w-full border text-black dark:text-white rounded-md px-3 py-1.5 shadow-xs"
                                />
                            </div>

                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={!input.trim() || isLoading} 
                                className="w-full text-primary-foreground bg-flag-red hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-6 py-2 transition-all"
                            >
                                {isLoading ? "Lädt..." : "Stupo speichern"}
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }