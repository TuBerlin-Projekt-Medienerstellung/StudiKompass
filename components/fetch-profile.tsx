"use client"

import React, {useState, useEffect} from "react"
import {createClient} from "@/lib/supabase/client"
import {Trash2, User} from 'lucide-react';
import Image from "next/image";
import InitialsAvatar from "@/components/initials-avatar";


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

    const handleDelete = async () => {

        try {
            // Datei aus dem Storage löschen
            const {error: storageError} = await supabase.storage
                .from("avatars")
                .remove([`${userId}/avatar.png`]);

            if (storageError) throw storageError;

            // Datenbank-Eintrag auf NULL setzen
            const {error: dbError} = await supabase
                .from("profiles")
                .update({avatar_url: null})
                .eq("id", userId);

            if (dbError) throw dbError;

            // UI aktualisieren
            setProfile((prev: any) => ({...prev, avatar_url: null}));

            window.dispatchEvent(new CustomEvent("avatar-updated"));

            console.log("Bild erfolgreich gelöscht");
        } catch (error) {
            console.error("Fehler beim Löschen des Bildes:", error);
            alert("Das Bild konnte nicht gelöscht werden.");
        }
    };

    return (
        <div className="w-full flex flex-col gap-7">
            <div className="rounded-xl border-2 bg-card text-card-foreground shadow-sm p-6 gap-4 w-full">

                {/* Profil */}
                <div className="flex flex-row gap-4 pb-4 md:justify-start items-center w-full">
                    <User className="text-flag-red w-8 h-8 stroke-2"/>
                    <h1 className="text-xl font-bold">Profil</h1>
                </div>

                <div className="flex flex-col">
                    <div className="flex flex-row gap-1 md:gap-4 pb-1 justify-start items-center">

                        {/* Initialien Avatar / Profilbild */}
                        {profile?.avatar_url ? (
                            <div className="relative size-24 md:size-32 shrink-0 rounded-full overflow-hidden">    
                            <Image
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div
                                className="relative size-24 md:size-32 shrink-0 bg-flag-red rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                                <InitialsAvatar email={email}/>
                            </div>
                        )}


                        {/* Info */}
                        <div className="flex flex-col gap-1 flex-1 min-w-0 pl-5">
                            <span className="font-semibold text-md md:text-2xl break-words">{profile?.username ?? "—"}</span>
                            <span
                                className="text-sm md:text-xl text-muted-foreground break-words">{profile?.studiengang ?? "—"}</span>
                            <span className="text-sm md:text-xl  text-muted-foreground break-all">{email ?? "—"}</span>
                        </div>
                    </div>

                    {/* Upload / Change Picture */}
                    <div className=" mt-4 flex flex-row gap-1 justify-center md:justify-start items-center w-full">
                        <label
                            className="border-2 border-flag-red rounded-lg p-2 pl-6 pr-6 text-center cursor-pointer text-sm text-flag-red hover:underline w-full md:w-fit">
                            Bild ändern
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                className="hidden"
                            />
                        </label>
                        {/* Delete Picture */}
                        <button
                            onClick={handleDelete}
                            className="group p-2 hover:bg-accent-foreground rounded-lg transition-colors duration-200"
                            title="Profilbild entfernen"
                            aria-label="Profilbild entfernen">

                            <Trash2
                                className="text-flag-red w-6 h-6 stroke-2 group-hover:text-card transition-colors duration-200">
                            </Trash2>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
