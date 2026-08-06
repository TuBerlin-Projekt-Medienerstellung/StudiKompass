"use client";

import {cn} from "@/lib/utils";
import { updatePassword } from "@/app/protected/settings/actions";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {Pencil} from "lucide-react";
// The user should be able to confirm their password change
export function UpdatePasswordForm({
                                       className,
                                       ...props
                                   }: React.ComponentPropsWithoutRef<"div">) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
// this is the new logic for confirmation, similar to the acc delete button, but also it triggers this card version warning that says there would be a local logout
//instead of the current 404 page not found
    const handle_Submit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!password.trim()) return;
        setError(null);
        setShowConfirm(true);
    };
//only removed supabase and changed submission event to allow mouse 
    const handleForgotPassword = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await updatePassword(password);
            if (result?.error) setError(result.error);
            setShowConfirm(false);
            // Update this route to redirect to an authenticated route. The user already has an active session.
            router.push("/protected");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Es ist ein Fehler aufgetreten.");
            setShowConfirm(false);
        } finally {
            setIsLoading(false);
        }
    };
    if (showConfirm) {
        return (
            <div className={cn(className)} {...props}>
                <Card>
                    <CardHeader className="flex flex-row gap-4 pb-4 md:justify-start items-center">
                        <Pencil className="text-flag-red w-8 h-8 stroke-2" />
                        <CardTitle className="text-xl font-bold">
                            Passwort wirklich ändern?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <CardDescription className="text-zinc-500">
                            Möchtest du dein Passwort wirklich ändern? Du wirst anschließend auf diesem Gerät abgemeldet und musst dich neu einloggen.
                        </CardDescription>

                        {error && <p className="text-sm text-flag-red">{error}</p>}

                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-1/2"
                                disabled={isLoading}
                                onClick={() => setShowConfirm(false)}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                type="button"
                                className="w-full sm:w-1/2 bg-flag-red"
                                disabled={isLoading}
                                onClick={handleForgotPassword}
                            >
                                {isLoading ? "Speichern..." : "Bestätigen & Abmelden"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn(className)} {...props}>
            <Card>
                <CardHeader className="flex flex-row gap-4 pb-4 md:justify-start items-center">
                    <Pencil className="text-flag-red w-8 h-8 stroke-2"></Pencil>
                    <CardTitle className="text-xl font-bold">Passwort zurücksetzen</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-zinc-500 pb-5">
                        Bitte gib das neue Passwort ein.
                    </CardDescription>
                    <form onSubmit={handle_Submit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Neues Passwort:</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Passwort eingeben..."
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-sm text-flag-red">{error}</p>}
                            <Button type="submit" className="w-full bg-flag-red" disabled={isLoading || !password.trim()}>
                                {isLoading ? "Speichern..." : "Speichere neues Passwort"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
