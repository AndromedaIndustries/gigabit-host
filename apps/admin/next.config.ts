import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ['pino', 'pino-pretty'],
};

export default nextConfig;
