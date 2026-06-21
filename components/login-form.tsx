"use client";

import {createClient} from "@/lib/supabase/client";
import Image from "next/image";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {Mail, Lock} from 'lucide-react';

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentPropsWithoutRef<"div">) {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.SubmitEvent) => {
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
                {/*If the user logged in using his user (in the db queries under: Auth_with_user)*/
                }
                if (rpcError || !fetchedEmail) {
                    throw new Error("Benutzername nicht gefunden!");
                }

                loginEmail = fetchedEmail;
            }

            const {error: signInError} = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: password,

            });

            if (signInError) throw signInError;
            router.push("/protected/settings");
            {/*Update this route to redirect to an authenticated route. The user already has an active session.*/
            }

        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-items-start flex-col gap-6">
            <Link href="/" className="text-sm underline-offset-4 underline opacity-60">
                &larr; Züruck zur Startseite
            </Link>
            <div className="flex flex-col shadow-xl/30 p-6 rounded-2xl">
                <header className="flex flex-col gap-4">
                    <div className="flex justify-start items-center gap-6">
                        <div className="relative size-12">
                            <Image
                                src="/logo/Compass-dark.svg"
                                fill
                                alt="logo-navis"
                                loading="eager"
                                className="dark:hidden"
                            />
                            <Image
                                src="/logo/Compass-light.svg"
                                fill
                                alt="logo-navis"
                                loading="eager"
                                className="hidden dark:block"
                            />
                        </div>
                        <div className="relative w-24 h-8">
                            <Image
                                src="/logo/Navis.svg"
                                fill
                                alt="logo-navis"
                                loading="eager"
                                className="dark:hidden"
                            />
                            <Image
                                src="/logo/Navis-light.svg"
                                fill
                                alt="logo-navis"
                                loading="eager"
                                className="hidden dark:block"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-5">
                        <h1 className="text-3xl font-bold">Anmelden</h1>
                        <p>Melde dich an, um deinen Studienplan zu verwalten</p>
                        <form onSubmit={handleLogin}>
                            <div className="flex flex-col gap-4">
                                <Label htmlFor="identifier" className="font-bold">E-mail oder Benutzername</Label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3 size-4 text-muted-foreground"/>
                                    <input
                                        id="identifier"
                                        className="flex h-10 w-full rounded-md border border-input pl-10 pr-3 text-sm outline-none  "
                                        placeholder="m@example.com oder User name"
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <Label htmlFor="password" className="font-bold">Passwort</Label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="ml-auto inline-block text-sm underline-offset-4 text-flag-red"
                                    >
                                        Passwort vergessen?
                                    </Link>
                                </div>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 size-4 text-muted-foreground"/>
                                    <input
                                        id="password"
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background outline-none file:border-0 file:bg-transparent  file:text-sm file:font-medium  placeholder:text-muted-foreground "
                                        placeholder="m@example.com oder User name"
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <button type="submit"
                                        className="bg-flag-red rounded-2xl p-3 font-bold">
                                    <p className="text-white">{isLoading ? "Anmelden..." : "Anmelden"}</p>
                                </button>
                                <div className="mt-4 text-center text-sm">
                                    Noch kein Account?{" "}
                                    <Link
                                        href="/auth/sign-up"
                                        className=" text-flag-red font-bold"
                                    >
                                        Jetzt Registieren
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

