"use client";

import {cn} from "@/lib/utils";
import {createClient} from "@/lib/supabase/client";
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

export function UpdatePasswordForm({
                                       className,
                                       ...props
                                   }: React.ComponentPropsWithoutRef<"div">) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleForgotPassword = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            const {error} = await supabase.auth.updateUser({password});
            if (error) throw error;
            // Update this route to redirect to an authenticated route. The user already has an active session.
            router.push("/protected");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Es ist ein Fehler aufgetreten.");
        } finally {
            setIsLoading(false);
        }
    };

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
                    <form onSubmit={handleForgotPassword}>
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
                            <Button type="submit" className="w-full bg-flag-red" disabled={isLoading}>
                                {isLoading ? "Speichern..." : "Speichere neues Passwort"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
