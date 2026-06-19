"use client";

import {createClient} from "@/lib/supabase/client";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import Image from "next/image";
import {Lock, User, Mail} from "lucide-react";

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

    const handleSignUp = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        if (password !== repeatPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const {error} = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                    },
                    emailRedirectTo: `${window.location.origin}/protected/settings`,
                },
            });
            if (error) throw error;
            router.push(`/auth/sign-up-success?email=${encodeURIComponent(email)}`);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // <div className={cn("flex flex-col gap-6", className)} {...props}>
        //     <Card>
        //         <CardHeader>
        //             <CardTitle className="text-2xl">Sign up</CardTitle>
        //             <CardDescription>Create a new account</CardDescription>
        //         </CardHeader>
        //         <CardContent>
        //             <form onSubmit={handleSignUp}>
        //                 <div className="flex flex-col gap-6">
        //                     <div className="grid gap-2">
        //                         <Label htmlFor="username">Username</Label>
        //                         <Input
        //                             id="username"
        //                             type="text"
        //                             placeholder="Your_Username"
        //                             required
        //                             value={username}
        //                             onChange={(e) => setUsername(e.target.value)}
        //                         />
        //                     </div>
        //                     <div className="grid gap-2">
        //                         <Label htmlFor="email">Email</Label>
        //                         <Input
        //                             id="email"
        //                             type="email"
        //                             placeholder="my@example.com"
        //                             required
        //                             value={email}
        //                             onChange={(e) => setEmail(e.target.value)}
        //                         />
        //                     </div>
        //                     <div className="grid gap-2">
        //                         <div className="flex items-center">
        //                             <Label htmlFor="password">Password</Label>
        //                         </div>
        //                         <Input
        //                             id="password"
        //                             type="password"
        //                             required
        //                             value={password}
        //                             onChange={(e) => setPassword(e.target.value)}
        //                         />
        //                     </div>
        //                     <div className="grid gap-2">
        //                         <div className="flex items-center">
        //                             <Label htmlFor="repeat-password">Repeat Password</Label>
        //                         </div>
        //                         <Input
        //                             id="repeat-password"
        //                             type="password"
        //                             required
        //                             value={repeatPassword}
        //                             onChange={(e) => setRepeatPassword(e.target.value)}
        //                         />
        //                     </div>
        //                     {error && <p className="text-sm text-red-500">{error}</p>}
        //                     <Button type="submit" className="w-full" disabled={isLoading}>
        //                         {isLoading ? "Creating an account..." : "Sign up"}
        //                     </Button>
        //                 </div>
        //                 <div className="mt-4 text-center text-sm">
        //                     Already have an account?{" "}
        //                     <Link href="/auth/login" className="underline underline-offset-4">
        //                         Login
        //                     </Link>
        //                 </div>
        //             </form>
        //         </CardContent>
        //     </Card>
        // </div>

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
                            />
                        </div>
                        <div className="relative w-24 h-8">
                            <Image
                                src="/logo/Navis.svg"
                                fill
                                alt="logo-navis"
                                loading="eager"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-5">
                        <h1 className="text-3xl font-bold">Registrieren</h1>
                        <p>Erstelle deinen Account und plane dein Studium</p>
                        <form onSubmit={handleSignUp}>
                            <div className="flex flex-col gap-4">
                                <Label htmlFor="username" className="font-bold">Benutzername</Label>
                                <div className="relative flex items-center">
                                    <User className="absolute left-3 size-4 text-muted-foreground"/>
                                    <input
                                        id="username"
                                        className="flex h-10 w-full rounded-md border border-input pl-10 pr-3 text-sm outline-none  "
                                        placeholder="Name"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <Label htmlFor="email" className="font-bold">Email</Label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3 size-4 text-muted-foreground"/>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="my@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input pl-10 pr-3 text-sm outline-none  "

                                    />
                                </div>
                                <Label htmlFor="password" className="font-bold">Passwort</Label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 size-4 text-muted-foreground"/>
                                    <input
                                        id="email"
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background outline-none file:border-0 file:bg-transparent  file:text-sm file:font-medium  placeholder:text-muted-foreground "
                                        placeholder="Passwort"
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
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background outline-none file:border-0 file:bg-transparent  file:text-sm file:font-medium  placeholder:text-muted-foreground "
                                        placeholder="Passwort"
                                        required
                                        type="password"
                                        value={repeatPassword}
                                        onChange={(e) => setRepeatPassword(e.target.value)}
                                    />
                                </div>
                                {error &&
                                    <p className="text-sm text-red-500">{error}</p>
                                }
                                <button type="submit"
                                        className="bg-flag-red rounded-2xl p-3 font-bold">
                                    <p className="text-white">{isLoading ? "Account wird erstellt..." : "Registrieren"}</p>
                                </button>
                                <div className="mt-4 text-center text-sm">
                                    Bereits registriert? {" "}
                                    <Link
                                        href="/auth/login"
                                        className=" text-flag-red font-bold"
                                    >
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
