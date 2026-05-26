"use client"
import { useState, useEffect, useCallback } from "react"
import Profile from "@/components/fetch-profile"

export default function SettingsClient() {
    const [refresh, setRefresh] = useState(0)
    const bump = useCallback(() => setRefresh(r => r + 1), [])

    useEffect(() => {
        window.addEventListener("studiengang-updated", bump)
        return () => window.removeEventListener("studiengang-updated", bump)
    }, [bump])

    return <Profile refreshKey={refresh} />
}