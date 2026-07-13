import type {NextConfig} from "next";
import withPWAInit from "@ducanh2912/next-pwa";
//https://ducanh-next-pwa.vercel.app/docs/next-pwa/getting-started adapt for ts
const withPWA= withPWAInit({
    dest: "public",
    cacheOnFrontEndNav: false,
    aggressiveFrontEndNavCaching: false,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV==="development",
});
const nextConfig: NextConfig = {
    // cacheComponents: true,
    images:{
        remotePatterns:[    
            //{protocol: "https", hostname: "picsum.photos" },
            {protocol: "https", hostname: "hoxmogylxrsmohfdwelm.supabase.co" },
                
        ]
    },

    turbopack: {
        rules: {
            "*.svg": {
                loaders: ["@svgr/webpack"],
                as: "*.js",
            },
        },
    },
};

export default withPWA(nextConfig);
