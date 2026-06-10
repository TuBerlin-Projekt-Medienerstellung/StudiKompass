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

    {/*
    const {
        data: { user }
    } = await supabase.auth.getUser()

    const email = user?.email ?? null

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

    */}

    return (
        <div className="flex flex-col items-center gap-4 p-8">
            <div className="relative size-24">
                {/*
                <div className="relative size-30 bg-flag-red rounded-full flex items-center justify-center text-white text-4xl">
                    {getInitialsFromEmail(email)}
                </div>
                */}
            </div>
            <h1 className="text-2xl font-bold">@{profile.username}</h1>
            <p className="opacity-60">{profile.studiengang}</p>
        </div>
    )
}


{/*

<Image
    src={profile.avatar_url ?? 'https://picsum.photos/200'} //default avatar from Lennart
    alt={profile.username ?? 'Profile'}
    fill
    className="rounded-full object-cover"
/>

*/}