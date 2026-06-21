import Link from "next/link";
import Image from "next/image";
import {words} from "@/constants"
import Footer from "@/components/footer"
import { ThemeSwitcher } from "../components/theme-switcher";

export const metadata = {
    title: 'Navis | TU Berlin',
    description: 'Dein Studium, perfekt organisiert.',
};
export default function Home() {
    return (
        <main className="relative z-0 flex flex-col justify-start min-h-screen text-zinc-950 dark:text-zinc-50 w-full overflow-x-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div
                    className="md:size-245 size-20 absolute left-0 -bottom-40 bg-slate-400 dark:bg-violet-ray/25 rounded-full blur-[254.50px]"/>

                <div
                    className="w-full h-80 md:w-212 md:h-206 absolute right-0 bg-raspbarry-plum dark:bg-raspbarry-plum/50 rounded-full blur-[254.50px]"/>
                <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-200/40 via-transparent to-raspbarry-plum/10 dark:from-violet-ray/10 dark:via-transparent dark:to-raspbarry-plum/10"
                />
            </div>

            {/*<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">*/}
            {/*    <div*/}
            {/*        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 dark:bg-emerald-900/20 blur-[120px] rounded-full"/>*/}
            {/*    <header*/}
            {/*        className="flex flex-col items-center space-y-4">/!*Uhhh..width and height are random, since we don't have a Logo yet..*!/*/}
            {/*        <Image*/}
            {/*            src="/Kompass_bild.png"*/}
            {/*            alt="LOGO"*/}
            {/*            width={69}*/}
            {/*            height={69}*/}
            {/*            className="hover:animate-spin"*/}

            {/*        />/!*Idk.. I thought it would look cool if it spun on hover*!/*/}
            {/*    </header>*/}
            {/*</div>*/}
            <section className="relative z-10 p-4 md:p-15 w-full">
                    <div className="absolute right-4 top-4 z-50 md:right-8 md:top-8">
                        <ThemeSwitcher />
                    </div>
                    <div className="h-8 md:h-11" />
                <div className="text-center max-w-3xl space-y-8 z-50">
                    {/*Title*/}
                    <h1 className="flex flex-row gap-4 md:gap-6 w-full items-center">
                        <div className="relative flex size-16 md:size-24 shrink-0">
                            <Image alt="logo" fill src="/logo/Compass-dark.svg" className="dark:hidden"/>
                            <Image alt="logo" fill src="/logo/Compass-light.svg" className="hidden dark:block"/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="relative w-24 md:w-32 h-8">
                                <Image src="/logo/Navis.svg" fill alt="Navis" className="dark:hidden"/>
                                <Image src="/logo/Navis-light.svg" fill alt="Navis" className="hidden dark:block"/>
                            </div>
                            <p className="text-xs md:text-sm opacity-60 text-start">Navigations- und
                                Visualisierungssystem für
                                Studienplanung</p>
                        </div>
                    </h1>

                    <div className="relative w-full">
                        <h2 className="flex flex-row justify-start md:text-9xl text-6xl relative z-10 pointer-events-none w-full">
                            Dein
                            <span
                                className="slide absolute -right-1 md:-right-4 pt-0 h-full md:translate-y-1 translate-y-0 overflow-hidden">
                                <span className="wrapper text-flag-red font-bold">
                            {words.map((word, index) => (
                                <span key={index} className="flex items-center md:gap-3 gap-1 pb-2">
                                    <span>{word.text}</span>
                                </span>
                            ))}
                        </span>
                    </span>
                        </h2>
                    </div>


                    {/* What do we aim to do */}
                    <p className="text-zinc-900 dark:text-zinc-200 opacity-70 text-base md:text-xl text-start leading-relaxed">
                        Dein Studium, perfekt organisiert. Plane Module, tracke ECTS, entdecke Vorlagen aus der
                        Community
                        und hol dir den vollen Durchblick mit unseren Kurz-Tutorials. <br/>
                        <br/> Filter nach nur für dich relevanten Modulen; egal ob <span
                        className="text-zinc-950 dark:text-zinc-50 italic">Wahlpflicht</span> oder <span
                        className="text-zinc-950 dark:text-zinc-50 italic">Pflicht</span>. <br/>
                        Einfach mit der Campus-Mail einloggen und loslegen.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-4">
                        <Link
                            href="/auth/login"
                            className="w-full sm:w-auto px-10 py-4 bg-flag-red shadow-[0px_4px_6px_-4px_rgba(231,0,11,0.20)] text-white  font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                        >
                            Login
                        </Link> {/*I dunno red is the official theme.. but green just looks so much better. Ig the team can vote: bg-rose-600/ bg-red-500?*/}
                        <Link
                            href="/auth/sign-up"
                            className="w-full sm:w-auto px-10 py-4 bg-white/70 hover:bg-white text-zinc-950 dark:bg-[#16081f] dark:hover:bg-[#210b31] dark:text-white font-bold rounded-xl border border-zinc-300 dark:border-violet-ray/40 transition-all hover:scale-105 active:scale-95"
                        > Create Account
                        </Link>
                    </div>
                </div>

            </section>


            {/* Footer*/}
            <Footer/>
        </main>
    );
}
