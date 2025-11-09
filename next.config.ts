import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Webpack optimizations for Vercel
  webpack: (config, { isServer }) => {
    // Optimize for serverless functions
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push(
        'socket.io-client',
        'recharts',
        /^socket\.io-client/,
        /^recharts/
      )
    }

    // Add fallbacks for both client and server
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      child_process: false,
    };
    
    return config;
  },
};

export default nextConfig;
