import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function PublicProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    noStore()
    const { username } = await params

    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, studiengang, avatar_url')
        .eq('username', username)
        .single()

    if (!profile) notFound()

    const {
        data: { user }
    } = await supabase.auth.getUser()

    return (
        <div className="flex flex-col items-center gap-4 p-8">

            {/* Initialien Avatar / Profilbild */}
            {profile?.avatar_url ? (
                <div className="relative w-29 h-29 rounded-full overflow-hidden">
                    <Image
                        src={profile.avatar_url}
                        alt="Profile"
                        fill
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className="relative size-30 bg-flag-red rounded-full flex items-center justify-center text-white text-4xl">
                    hier sollen Initialien stehen
                </div>
            )}

            <h1 className="text-2xl font-bold">@{profile.username}</h1>
            <p className="opacity-60">{profile.studiengang}</p>
        </div>
    )
}