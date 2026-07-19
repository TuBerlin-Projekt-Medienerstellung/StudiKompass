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
    async headers() {
        return [
            {
                source: "/manifest.webmanifest",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*",
                    },
                ],
            },
        ];
    },
    //manifest.webmanifest	blocked	  Access-Control-Allow-Origin	Missing Header	in console -> CORS Problem
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
//use webpack so the sw generation works, bc apparently it was changed with turbopack. I only need this on production anyway
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/i,
            use: ["@svgr/webpack"],
        });
        return config;
    },
};

export default withPWA(nextConfig);
