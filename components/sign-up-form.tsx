"use client";

import {createClient} from "@/lib/supabase/client";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import Image from "next/image";
import {Lock, User, Mail, AlertCircle, Loader2} from "lucide-react";

export function SignUpForm({
                               className,
                               ...props
                           }: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        if (password !== repeatPassword) {
            setError("Die Passwörter stimmen nicht überein.");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
            setIsLoading(false);
            return;
        }

        try {
            const {error} = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {username},
                    emailRedirectTo: `${window.location.origin}/protected/settings`,
                },
            });
            if (error) throw error;
            router.push(`/auth/sign-up-success?email=${encodeURIComponent(email)}`);
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
                        <h1 className="text-3xl font-bold">Registrieren</h1>
                        <p>Erstelle deinen Account und plane dein Studium</p>
                        <form onSubmit={handleSignUp}>
                            <div className="flex flex-col gap-4">

                                {/* Error Alert */}
                                {error && (
                                    <div
                                        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-4 py-3">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500"/>
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                <Label htmlFor="username" className="font-bold">Benutzername</Label>
                                <div className="relative flex items-center">
                                    <User className="absolute left-3 size-4 text-muted-foreground"/>
                                    <input
                                        id="username"
                                        className="flex h-10 w-full rounded-md border border-input pl-10 pr-3 text-sm outline-none"
                                        placeholder="Dein Benutzername"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>

                                <Label htmlFor="email" className="font-bold">E-Mail</Label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3 size-4 text-muted-foreground"/>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="my@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input pl-10 pr-3 text-sm outline-none"
                                    />
                                </div>

                                <Label htmlFor="password" className="font-bold">Passwort</Label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 size-4 text-muted-foreground"/>
                                    <input
                                        id="password"
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground"
                                        placeholder="Mindestens 6 Zeichen"
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <Label htmlFor="repeat-password" className="font-bold">Passwort wiederholen</Label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 size-4 text-muted-foreground"/>
                                    <input
                                        id="repeat-password"
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground"
                                        placeholder="Passwort wiederholen"
                                        required
                                        type="password"
                                        value={repeatPassword}
                                        onChange={(e) => setRepeatPassword(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-2 bg-flag-red rounded-2xl p-3 font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-opacity"
                                >
                                    {isLoading && <Loader2 className="size-4 animate-spin text-white"/>}
                                    <span
                                        className="text-white">{isLoading ? "Account wird erstellt..." : "Registrieren"}</span>
                                </button>

                                <div className="mt-4 text-center text-sm">
                                    Bereits registriert?{" "}
                                    <Link href="/auth/login" className="text-flag-red font-bold">
                                        Jetzt anmelden
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