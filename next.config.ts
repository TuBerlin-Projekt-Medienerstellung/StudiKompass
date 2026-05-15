import type {NextConfig} from "next";

const nextConfig: NextConfig = {

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
