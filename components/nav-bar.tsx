"use client"

import Image from "next/image";
import Link from "next/link"
import {LogoutButton} from "@/components/logout-button";
import {ThemeSwitcher} from "@/components/theme-switcher";
import {useMediaQuery} from "react-responsive";
import {navBarLinks} from "@/constants";
import {X, Menu} from "lucide-react"
import {usePathname} from "next/navigation";
import {useState, useEffect, useCallback} from "react";
import {createClient} from '@/lib/supabase/client'
import InitialsAvatar from "@/components/initials-avatar";

//Things to fix:

// 1) bug with navbar in mobile mode (profile + Studiengangwahl shouldn't cover content or be interactive -> dropdown should disable current page functions)
// 2) bug with navbar in mobile mode, can't be transparent 

// Possible approaches:
// >If it's component client/server side caused -> check div wrappers
// >maybe freeze the page so it isn't interactive while dropdown menu is open
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
    const [email, setEmail] = useState<string | null>("")

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
        setEmail(user?.email ?? null)
    }, [])

    useEffect(() => {
        fetchProfileData()
    }, [fetchProfileData])

    //omfg I knew I had to add an Eventlistener with fetch as I did with avatar, AI ain't gonna replace me muhahah
    useEffect(() => {
        window.addEventListener("avatar-updated", fetchProfileData)
        window.addEventListener("studiengang-updated", fetchProfileData)
        return () => {
            window.removeEventListener("avatar-updated", fetchProfileData)
            window.removeEventListener("studiengang-updated", fetchProfileData)
        }
    }, [fetchProfileData])

    // scroll Lock
    useEffect(() => {
        if (!isMobile) return
        document.body.style.overflow = mobileOpen ? "hidden" : "unset"
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [mobileOpen, isMobile])

    //console.log("CURRENT DB URL IS:", profile?.avatar_url);
    //z-50 works still gotta remove scrollable (add freeze) later
    return (
        <nav className={`z-50 md:h-screen md:w-72 w-full px-4 p-4 flex flex-col md:border-r-2 border-border fixed bg-background 
    transition-[height] duration-300 ease-in-out 
    ${mobileOpen ? "h-screen overflow-y-auto pb-8" : "h-16 overflow-hidden"}`}>
            <div className={`flex flex-col flex-1 min-h-0 ${mobileOpen ? "overflow-y-auto" : ""}`}>
                <div
                    className="shrink-0 w-full flex flex-row justify-between items-center pb-3 border-b-2 border-border md:border-none">
                    <Link className="flex items-center gap-2" href="/protected/planner">
                        <div className="relative md:size-10 size-8">
                            <Image
                                src="/logo/Compass-dark.svg"
                                fill
                                alt="logo-kompass"
                                className="dark:hidden"
                            />
                            <Image
                                src="/logo/Compass-light.svg"
                                fill
                                alt="logo-kompass"
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
                    </Link>
                    {isMobile && (mobileOpen ? (<X onClick={() => setMobileOpen(false)}/>) : (
                        <Menu onClick={() => setMobileOpen(true)}/>))}
                </div>

                {/*Nav Link*/}
                <div className="flex flex-col justify-between flex-1 py-4">
                    <div
                        className="flex flex-col gap-2">
                        {navBarLinks.map((link) => {
                            const isActive = pathname === link.path || pathname.startsWith(link.path + "/")
                            console.log("pathname:", pathname, "| link.path:", link.path)
                            return <Link href={link.path}
                                         className={`w-full flex flex-row gap-2 px-4 py-3 rounded-2xl transition-colors ${isActive ? "text-flag-red bg-flag-red/5 dark:bg-flag-red/10" : "text-foreground hover:bg-accent"}`}
                                         key={link.name}
                                         onClick={() => setMobileOpen(false)}
                            >
                                <link.icon/>
                                {link.name}
                            </Link>
                        })}
                    </div>
                    <div className="w-full flex flex-col gap-3 pt-4">
                        <div className="flex flex-col pb-3">
                            <div className="flex flex-row gap-4 md:justify-start justify-center items-center">
                                <div className="relative size-10">

                                    {/* Initialien Avatar / Profilbild */}
                                    {profile?.avatar_url ? (
                                        <div className="relative size-12 shrink-0 rounded-full overflow-hidden">
                                            <Image
                                                src={profile.avatar_url}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="size-12 bg-flag-red rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            <InitialsAvatar email={email}/>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-semibold text-foreground">{profile?.username ?? '...'}</h3>
                                    <p className="text-sm opacity-60">{profile?.studiengang ?? '...'}</p>
                                </div>
                            </div>
                            <div>

                            </div>
                        </div>
                        <ThemeSwitcher/>
                        <LogoutButton/>
                    </div>
                </div>
            </div>
        </nav>
    )
}
export default NavBar