import type {NextConfig} from "next";
import os from "os";

// Lokale IP dynamisch ermitteln
const interfaces = os.networkInterfaces();
let localIP = "localhost";
for (const iface of Object.values(interfaces)) {
    for (const alias of iface ?? []) {
        if (alias.family === "IPv4" && !alias.internal) {
            localIP = alias.address;
        }
    }
}

const nextConfig: NextConfig = {
    // cacheComponents: true,
    images: {
        remotePatterns: [
            //{protocol: "https", hostname: "picsum.photos" },
            {protocol: "https", hostname: "hoxmogylxrsmohfdwelm.supabase.co"},

        ]
    },
    allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', '*', '172.20.10.4'],
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
