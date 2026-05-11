"use client"

import Image from "next/image";
import Link from "next/link"
import {LogoutButton} from "@/components/logout-button";
import {useMediaQuery} from "react-responsive";
import {navBarLinks} from "@/constants";
import {X, Menu} from "lucide-react"
import {usePathname} from "next/navigation";
import {useState} from "react";

const NavBar = () => {
    const isMobile = useMediaQuery({query: '(max-width: 600px)'});
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav
            className={`overflow-hidden md:h-screen md:w-72 w-full px-4 p-4 flex flex-col md:border-r-2 fixed justify-between ${mobileOpen ? "h-screen bg-background" : "h-16"}`}>
            <div className="flex flex-col gap-4 w-full">
                <div className="w-full flex flex-row justify-between items-center pb-3 border-b-2 md:border-none">
                    <Link className="flex items-center gap-2" href="/protected/planner">
                        <div className="relative md:size-10 size-8">
                            <Image
                                src="/logo/Kompass.svg"
                                fill
                                alt="logo-kompass"
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
                    </Link>
                    {isMobile && (mobileOpen ? (<X onClick={() => setMobileOpen(false)}/>) : (
                        <Menu onClick={() => setMobileOpen(true)}/>))}
                </div>
                <div className="flex flex-col gap-2">
                    {navBarLinks.map((link) => {
                        const isActive = pathname === link.path
                        return <Link href={link.path}
                                     className={`w-full flex flex-row gap-2 px-4 py-3 rounded-2xl ${isActive ? "text-oxblood bg-oxblood/5" : "text-foreground"}`}
                                     key={link.name}
                                     onClick={() => setMobileOpen(false)}
                        >
                            <link.icon/>
                            {link.name}
                        </Link>
                    })}
                </div>
            </div>
            <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col">
                    <div className="flex flex-row gap-4 md:justify-start justify-center items-center">
                        <div className="relative size-10">
                            <Image
                                src="https://picsum.photos/200"
                                alt="placeholder"
                                fill
                                className="rounded-4xl"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h3>Max Mustermann</h3>
                            <p className="opacity-60">Informatik B. Sc.</p>
                        </div>
                    </div>
                    <div>

                    </div>
                </div>
                <LogoutButton/>
            </div>
        </nav>
    )
}
export default NavBar
