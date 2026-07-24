import type {MetadataRoute} from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Navis',
        short_name: 'Navis',
        description: 'Der Studierendkompass zum individuellen Planen und Organisieren seines Studienverlaufsplan',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/logo/PWA-logo-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo/PWA-logo-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
//https://supabase.com/docs/guides/realtime/postgres-changes?hl=en-DE
