import Link from "next/link";
import Image from "next/image";
import {words} from "@/constants"
import Footer from "@/components/footer"

export const metadata = {
    title: 'Navis | TU Berlin',
    description: 'Dein Studium, perfekt organisiert.',
};
export default function Home() {
    return (
        <main
            className="flex flex-col justify-start min-h-screen text-zinc-950  ">
            {/* Background Stuff*/}
            <div className="-z-10">

                <div className="w-[999px] h-[971px] absolute bg-slate-400 rounded-full blur-[254.50px]"/>
                <div className="w-[849px] h-[825px] absolute right-0 bg-raspbarry-plum rounded-full blur-[254.50px]"/>
                <img
                    src="https://images.unsplash.com/photo-1534593963832-01c3595183bd?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                    className="absolute w-[1920px] h-[1080px] mix-blend-color-bur opacity-10"
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
            <section className="p-15">
                <div className="text-center max-w-3xl space-y-8 z-50">
                    {/*Title*/}
                    <h1 className="flex flex-row gap-6 w-96 items-center">
                        <div className="relative flex size-24">
                            <Image alt="logo" fill src="/logo/Compass-dark.svg" className="animate-spin-slow"/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="relative w-32 h-8">
                                <Image src="/logo/Navis.svg" fill alt="Navis"/>
                            </div>
                            <p className="text-sm opacity-60 text-start">Navigations- und Visualisierungssystem für
                                Studienplanung</p>
                        </div>
                    </h1>
                    <h2 className="flex flex-row justify-start md:text-9xl text-6xl relative z-10 pointer-events-none md:min-w-200 min-w-96">
                        Dein
                        <span
                            className="slide  absolute right-0 pt-0 h-full md:translate-y-1 translate-y-0 overflow-hidden">
                        <span className="wrapper text-flag-red font-bold">
                            {words.map((word, index) => (
                                <span key={index}
                                      className="flex items-center md:gap-3 gap-1 pb-2">
                                    <span>{word.text}</span>
                                </span>
                            ))}
                        </span>
                    </span>
                    </h2>


                    {/* What do we aim to do */}
                    <p className="text-zinc-900 opacity-70 text-lg md:text-xl text-start leading-relaxed">
                        Dein Studium, perfekt organisiert. Plane Module, tracke ECTS, entdecke Vorlagen aus der
                        Community
                        und hol dir den vollen Durchblick mit unseren Kurz-Tutorials. <br/>
                        <br/> Filter nach nur für dich relevanten Modulen; egal ob <span
                        className="text-zinc-950 italic">Wahlpflicht</span> oder <span
                        className="text-zinc-950 italic">Plicht</span>. <br/>
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
                            className="w-full sm:w-auto px-10 py-4 bg-zinc-500 hover:bg-zinc-400 text-black dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-white font-bold rounded-xl border border-zinc-800 transition-all hover:scale-105 active:scale-95"
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