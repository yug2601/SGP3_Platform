import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading dev assets from specific origins (e.g., LAN IP)
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.224.128.55:3000",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
