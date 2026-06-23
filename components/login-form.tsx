"use client";

import {createClient} from "@/lib/supabase/client";
import Image from "next/image";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {Mail, Lock, AlertCircle, Loader2} from 'lucide-react';

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentPropsWithoutRef<"div">) {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        let loginEmail = identifier;
        setIsLoading(true);
        setError(null);
        try {
            if (!identifier.includes("@")) {
                const {data: fetchedEmail, error: rpcError} = await supabase.rpc(
                    "get_email_by_username",
                    {passed_username: identifier}
                );
                if (rpcError || !fetchedEmail) {
                    throw new Error("Benutzername nicht gefunden.");
                }
                loginEmail = fetchedEmail;
            }

            const {error: signInError} = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: password,
            });

            if (signInError) {
                if (signInError.message.toLowerCase().includes("Ungültige Anmeldedaten") ||
                    signInError.message.toLowerCase().includes("Ungültige Anmeldedaten")) {
                    throw new Error("E-Mail/Benutzername oder Passwort ist falsch.");
                }
                throw signInError;
            }
            router.push("/protected/settings");

        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-items-start flex-col gap-6">
            <Link href="/" className="text-sm underline-offset-4 underline opacity-60">
                &larr; Zurück zur Startseite
            </Link>
            <div className="flex flex-col shadow-xl/30 p-6 rounded-2xl">
                <header className="flex flex-col gap-4">
                    <div className="flex justify-start items-center gap-6">
                        <div className="relative size-12">
                            <Image src="/logo/Compass-dark.svg" fill alt="logo-navis" loading="eager"
                                   className="dark:hidden"/>
                            <Image src="/logo/Compass-light.svg" fill alt="logo-navis" loading="eager"
                                   className="hidden dark:block"/>
                        </div>
                        <div className="relative w-24 h-8">
                            <Image src="/logo/Navis.svg" fill alt="logo-navis" loading="eager" className="dark:hidden"/>
                            <Image src="/logo/Navis-light.svg" fill alt="logo-navis" loading="eager"
                                   className="hidden dark:block"/>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5">
                        <h1 className="text-3xl font-bold">Anmelden</h1>
                        <p>Melde dich an, um deinen Studienplan zu verwalten</p>
                        <form onSubmit={handleLogin}>
                            <div className="flex flex-col gap-4">

                                {/* Error Alert */}
                                {error && (
                                    <div
                                        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-4 py-3">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500"/>
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                <Label htmlFor="identifier" className="font-bold">E-Mail oder Benutzername</Label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3 size-4 text-muted-foreground"/>
                                    <input
                                        id="identifier"
                                        className="flex h-10 w-full rounded-md border border-input pl-10 pr-3 text-sm outline-none"
                                        placeholder="m@example.com oder Benutzername"
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <Label htmlFor="password" className="font-bold">Passwort</Label>
                                    <Link href="/auth/forgot-password"
                                          className="ml-auto inline-block text-sm underline-offset-4 text-flag-red">
                                        Passwort vergessen?
                                    </Link>
                                </div>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 size-4 text-muted-foreground"/>
                                    <input
                                        id="password"
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground"
                                        placeholder="Dein Passwort"
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 bg-flag-red rounded-2xl p-3 font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-opacity"
                                >
                                    {isLoading && <Loader2 className="size-4 animate-spin text-white"/>}
                                    <span className="text-white">{isLoading ? "Anmelden..." : "Anmelden"}</span>
                                </button>

                                <div className="mt-4 text-center text-sm">
                                    Noch kein Account?{" "}
                                    <Link href="/auth/sign-up" className="text-flag-red font-bold">
                                        Jetzt registrieren
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </header>
            </div>
        </div>
    );
}