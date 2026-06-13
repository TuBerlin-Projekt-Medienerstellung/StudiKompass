import React from 'react'
import Image from "next/image"
import Link from "next/link"
import {Heart, Github} from 'lucide-react';

const Footer = () => {
    return (
        <section
            className="bg-violet-ray dark:bg-[#180020] flex flex-col gap-10 w-full py-10 px-4 md:px-30 min-h-fit text-white">
            <div className="flex flex-col md:flex-row gap-8 md:gap-0 justify-between">
                <div className="flex flex-col w-full md:w-96 gap-4">
                    <div className="flex flex-row items-center gap-4">
                        <div className="relative size-14">
                            <Image src="/logo/Compass-light.svg" alt="logo" fill/>
                        </div>
                        <div className="relative w-32 h-8 shrink-0">
                            <Image src="/logo/Navis-light.svg" alt="Navis" fill/>
                        </div>
                    </div>
                    <p className="opacity-80">Das intelligente Navigations- und Visualisierungssystem für
                        deine
                        Studienplanung. Entwickelt von
                        Studenten, für Studenten.</p>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold">Rechtliches</span>
                    <Link className="opacity-70" href="#">Impressum</Link>
                    <Link className="opacity-70" href="#">Datenschutz</Link>
                    <Link className="opacity-70" href="#">AGB</Link>
                </div>
            </div>

            {/*Line*/}
            <div className="h-0.5 w-full bg-background dark:bg-white my-4 opacity-70 dark:opacity-20"/>

            <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center">
                <div className="flex flex-row gap-3 items-center">
                    <p>Made with</p>
                    <Heart className="text-flag-red shrink-0"/>
                    <p> by students at TU Berlin</p>
                </div>
                <Link href="https://github.com/orgs/TuBerlin-Projekt-Medienerstellung/dashboard">
                    <Github/>
                </Link>
            </div>
        </section>
    )
}
export default Footer
