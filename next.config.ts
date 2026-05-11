import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        remotePatterns: [
            {
                hostname: "picsum.photos",
            }
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
