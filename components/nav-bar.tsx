"use client"

import Image from "next/image";
import Link from "next/link"
import {LogoutButton} from "@/components/logout-button";
import {useMediaQuery} from "react-responsive";
import {navBarLinks} from "@/constants";
import {X, Menu} from "lucide-react"
import {usePathname} from "next/navigation";
import {useState, useEffect, useCallback} from "react";
import {createClient} from '@/lib/supabase/client'
//Things to fix:

// 1) bug with navbar in mobile mode (profile + studiengangwahl shouldn't cover content or be interactive -> dowpdown should disable current page functions) 
// 2) bug with navbar in mobile mode, can't be transparent 

// Possible approaches:
// >If it's component client/server side caused -> check div wrappers
// >maybe freeze the page so it isnt interactive while dropdown menue is open
// -> can be solved to adding an absolute z coordinate?
// >add another event listener to check whether it is mobile to lock scroll?
// -> but mobile event listener exists, maybe incorp?
type Profile = {
    username: string | null
    studiengang: string | null
    avatar_url: string | null
}

const NavBar = () => {
    const isMobile = useMediaQuery({query: '(max-width: 600px)'});
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    const fetchProfileData = useCallback(async () => {
        const supabase = createClient()
        const {data: {user}} = await supabase.auth.getUser()
        if (!user) return

        const {data} = await supabase
            .from('profiles')
            .select('username, studiengang, avatar_url')
            .eq('id', user.id)
            .single()

        setProfile(data)
    }, [])
    useEffect(() => {
        fetchProfileData()
    }, [fetchProfileData])
    //omfg I knew I had to add an Eventlistener with fetch as I did with avatar, AI aint gonna replace me muhahah
    useEffect(() => {
        window.addEventListener("avatar-updated", fetchProfileData)
        window.addEventListener("studiengang-updated", fetchProfileData)
        return () => {
            window.removeEventListener("avatar-updated", fetchProfileData)
            window.removeEventListener("studiengang-updated", fetchProfileData)
        }
    }, [fetchProfileData])

    //console.log("CURRENT DB URL IS:", profile?.avatar_url);
    //z-50 works still gotta remove scrollable (add freeze) later
    return (
        <nav
            className={`z-50 overflow-hidden md:h-screen md:w-72 w-full px-4 p-4 flex flex-col md:border-r-2 fixed justify-between bg-background ${mobileOpen ? "h-screen" : "h-16"}`}>
            <div className="flex flex-col gap-4 w-full">
                <div className="w-full flex flex-row justify-between items-center pb-3 border-b-2 md:border-none">
                    <Link className="flex items-center gap-2" href="/protected/planner">
                        <div className="relative md:size-10 size-8">
                            <Image
                                src="/logo/Compass-dark.svg"
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
                                     className={`w-full flex flex-row gap-2 px-4 py-3 rounded-2xl ${isActive ? "text-flag-red bg-flag-red/5" : "text-foreground"}`}
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
                                src={profile?.avatar_url || "/default-avatar.png"}
                                alt="placeholder"
                                fill
                                className="rounded-4xl"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm font-semibold text-black">{profile?.username ?? '...'}</h3>
                            <p className="text-sm opacity-60">{profile?.studiengang ?? '...'}</p>
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
