import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        GROWW_API_KEY: process.env.GROWW_API_KEY,
        GROWW_API_SECRET: process.env.GROWW_API_SECRET,
    },
    output: 'standalone',
};

export default nextConfig;
