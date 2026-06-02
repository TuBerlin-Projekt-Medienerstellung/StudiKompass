"use client"

import {useState, useEffect} from "react"
import Image from "next/image"
import {createClient} from "@/lib/supabase/client"
import {User} from 'lucide-react';

export default function Settings({refreshKey}: { refreshKey: number }) {
    const [email, setEmail] = useState<string | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient() // single instance

    useEffect(() => {
        const fetchData = async () => {
            const {data: {user}} = await supabase.auth.getUser()
            if (!user) return

            setUserId(user.id)

            const {data} = await supabase
                .from('profiles')
                .select('username, studiengang, avatar_url')
                .eq('id', user.id)
                .single()

            setProfile(data)
            setEmail(user.email ?? null)
        }
        fetchData()
    }, [refreshKey])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !userId) return

        const {error} = await supabase.storage
            .from("avatars")
            .upload(`${userId}/avatar.png`, file, {upsert: true})

        if (error) {
            console.error("Upload error:", error.message)
            return
        }

        const {data: {publicUrl}} = supabase.storage
            .from("avatars")
            .getPublicUrl(`${userId}/avatar.png`)

        // Cache-bust so the browser fetches the new image
        const freshUrl = `${publicUrl}?t=${Date.now()}`

        await supabase
            .from("profiles")
            .update({avatar_url: freshUrl})
            .eq("id", userId)

        setProfile((prev: any) => ({...prev, avatar_url: freshUrl}))
        window.dispatchEvent(new CustomEvent("avatar-updated"));
    }

    return (
        <div className="w-full flex flex-col gap-5 border-3 p-5 rounded-2xl">
            <header className="flex flex-col gap-3">
                <span className="flex gap-3 text-flag-red">
                    <User/>
                    <p className="text-black">Profile</p>
                </span>
                <div className="flex flex-row gap-3">
                    <div className="relative size-20">
                        <Image
                            src={profile?.avatar_url || "/default-avatar.png"}
                            alt="avatar"
                            fill
                            unoptimized // required for external Supabase URLs unless you add them to next.config
                            className="rounded-full object-cover"
                        />

                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="image-update"
                               className="font-bold text-flag-red border-2 rounded-2xl border-flag-red px-2 py-3 w-30 flex-center">
                            Bild ändern
                            <input id="image-update" type="file" onChange={handleUpload} hidden/>
                        </label>
                        <p>JPG, PNG oder GIF (max. 2MB)</p>
                    </div>
                </div>
            </header>
            <div className="flex flex-col gap-4 md:justify-start justify-center items-start w-full">
                <div className="flex flex-col w-full gap-2">
                    <h3>Name</h3>
                    <span
                        className="font-semibold text-xl border-2 rounded-2xl py-3 px-4 w-full">{profile?.username ?? "—"}</span>
                </div>
                <div className="flex flex-col w-full gap-2">
                    <h3>Email</h3>
                    <span className="font-semibold text-xl border-2 rounded-2xl py-3 px-4 w-full">{email ?? "—"}</span>

                </div>


            </div>
        </div>
    )
}