import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function PublicProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    await connection()
    const { username } = await params

    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, studiengang, avatar_url')
        .eq('username', username)
        .single()

    if (!profile) notFound()

    return (
        <div className="flex flex-col items-center gap-4 p-8">
            <div className="relative size-24">
                <Image
                    src={profile.avatar_url ?? 'https://picsum.photos/200'} //default avatar from Lennart 
                    alt={profile.username ?? 'Profile'}
                    fill
                    className="rounded-full object-cover"
                />
            </div>
            <h1 className="text-2xl font-bold">@{profile.username}</h1>
            <p className="opacity-60">{profile.studiengang}</p>
        </div>
    )
}