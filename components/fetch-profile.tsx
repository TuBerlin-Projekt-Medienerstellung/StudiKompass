"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from 'lucide-react';


export default function Settings({ refreshKey }: { refreshKey: number }) {
    const [email, setEmail] = useState<string | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient() // single instance

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setUserId(user.id)

            const { data } = await supabase
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

        const { error } = await supabase.storage
            .from("avatars")
            .upload(`${userId}/avatar.png`, file, { upsert: true })

        if (error) {
            console.error("Upload error:", error.message)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(`${userId}/avatar.png`)

        // Cache-bust so the browser fetches the new image
        const freshUrl = `${publicUrl}?t=${Date.now()}`

        await supabase
            .from("profiles")
            .update({ avatar_url: freshUrl })
            .eq("id", userId)

        setProfile((prev: any) => ({ ...prev, avatar_url: freshUrl }))
        window.dispatchEvent(new CustomEvent("avatar-updated"));
    }

    const getInitialsFromEmail = (email) => {
        if (!email) return "-"; // Fallback, falls keine E-Mail vorhanden ist

        try {
            const namePart = email.split('@')[0];
            const parts = namePart.split('.');
            const firstInitial = parts[0] ? parts[0][0] : '';
            const secondInitial = parts[1] ? parts[1][0] : '';

            return (firstInitial + secondInitial).toUpperCase();
        } catch (error) {
            return "-";
        }
    };


    return (
        <div className="w-full flex flex-col gap-7">
            <div className="rounded-xl border-2 bg-card text-card-foreground shadow-sm  p-6 gap-4">

            {/* Profil */}
            <div className="flex flex-row gap-4 pb-4 md:justify-start items-center">
            <User className="text-flag-red w-9 h-9 stroke-2"/>
            <h1 className="text-xl font-bold">Profil</h1>
            </div>

            <div className="flex flex-col">
                <div className="flex flex-row gap-4 md:justify-start justify-center items-center">

                    {/* Initialien Avatar */}
                    <div className="relative size-30 bg-flag-red rounded-full flex items-center justify-center text-white text-4xl">
                        {getInitialsFromEmail(email)}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-1">
                        <span className="pl-5 font-semibold text-xl">{profile?.username ?? "—"}</span>
                        <span className="pl-5 text-base text-muted-foreground">{profile?.studiengang ?? "—"}</span>
                        <span className="pl-5 text-base text-muted-foreground">{email ?? "—"}</span>
                    </div>
                </div>

                {/* Upload */}
                <div className="pt-6">
                <label className="border-2 border-flag-red rounded-lg p-2 pl-5 pr-5 mt-3 cursor-pointer text-sm text-flag-red hover:underline w-fit">
                    Bild ändern
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>
            </div>
            </div>
        </div>
        </div>
    )
}