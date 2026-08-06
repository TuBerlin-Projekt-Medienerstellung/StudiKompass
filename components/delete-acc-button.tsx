"use client";

import { deleteUserAction } from "@/app/protected/settings/actions";
import {Button} from "@/components/ui/button";
import {CardHeader, CardTitle} from "@/components/ui/card";
import {Trash2} from "lucide-react";
import {useState} from "react";

export default function DeleteAccount() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className=" p-6 rounded-xl border-2 bg-card text-card-foreground shadow-sm">
            <CardHeader className="flex flex-row gap-4 p-0.5 md:justify-start ">
                <Trash2 className="text-flag-red w-7 h-7 stroke-2"></Trash2>
                <CardTitle className="text-xl font-bold">Konto löschen</CardTitle>
            </CardHeader>
            <h2 className="text-base font-semibold text-black dark:text-zinc-500 mb-2 pt-3">
                Warnung! diese Aktion ist permanent.
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
                Das Löschen deines Kontos ist endgültig. Alle deine Daten werden sofort und unwiderruflich entfernt.
            </p>
            <Button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full bg-flag-red"
            >
                Konto löschen
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border p-6 rounded-xl max-w-md w-full shadow-lg flex flex-col gap-4 animate-in fade-in zoom-in-95">
                        <h3 className="text-lg font-bold text-card-foreground">
                            Bist du dir absolut sicher?
                        </h3>
                        <p className="text-sm text-zinc-500">
                            Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>
                        
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Abbrechen
                            </Button>
                            <form action={deleteUserAction}>
                                <Button
                                    type="submit"
                                    className="w-full bg-flag-red"
                                >
                                    Konto löschen
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
