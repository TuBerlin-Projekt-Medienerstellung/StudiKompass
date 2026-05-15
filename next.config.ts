import type {NextConfig} from "next";

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

export default nextConfig;
