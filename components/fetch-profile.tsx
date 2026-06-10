"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

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

    return (
        <div className="w-full flex flex-col gap-3">
            <div className="flex flex-col">
                <div className="flex flex-row gap-4 md:justify-start justify-center items-center">
                    {/* Avatar */}
                    <div className="relative size-32">
                        <Image
                            src={profile?.avatar_url || "/default-avatar.png"}
                            alt="avatar"
                            fill
                            unoptimized // required for external Supabase URLs unless you add them to next.config
                            className="rounded-3xl object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col">
                        <span className="font-semibold text-xl">{profile?.username ?? "—"}</span>
                        <span className="text-base text-muted-foreground">{profile?.studiengang ?? "—"}</span>
                        <span className="text-base text-muted-foreground">{email ?? "—"}</span>
                    </div>
                </div>

                {/* Upload */}
                <label className="mt-3 cursor-pointer text-sm text-blue-500 hover:underline w-fit">
                    Change avatar
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    )
}