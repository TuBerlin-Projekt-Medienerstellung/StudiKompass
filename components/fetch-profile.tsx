"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function Settings() {
    const [email, setEmail] = useState<string | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const [userId, setUserId] = useState<string | null>(null) // ← added
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setUserId(user.id) // ← added

            const { data } = await supabase
                .from('profiles')
                .select('username, studiengang, avatar_url')
                .eq('id', user.id)
                .single()

            setProfile(data)
            setEmail(user.email ?? null)
        }
        fetchData()
    }, [])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !userId) return

        await supabase.storage
            .from("avatars")
            .upload(`${userId}/avatar.png`, file, { upsert: true })

        const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(`${userId}/avatar.png`)

        await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", userId)

        setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }))
    }

    return (
        <div>
            <Image
                src={profile?.avatar_url ?? "/default-avatar.png"}
                alt="avatar"
                width={100}
                height={100}
                className="rounded-full"
            />
            <input type="file" accept="image/*" onChange={handleUpload} />
            <p>{email}</p>
            <p>{profile?.username}</p>
            <p>{profile?.studiengang}</p>
        </div>
    )
}