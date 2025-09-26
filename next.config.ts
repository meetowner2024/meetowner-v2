import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.meetowner.in",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
    {
      protocol: "https",
      hostname: "images.unsplash.com", 
      pathname: "/**",
    },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },{
        protocol: "https",
        hostname: "**",  
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**",   
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },
  webpack(config) {
    config.optimization.splitChunks.cacheGroups = {
      ...config.optimization.splitChunks.cacheGroups,
      dashboard: {
        test: /[\\/]components[\\/]initial-rendering[\\/]/,
        name: "dashboard",
        chunks: "all",
        enforce: true,
      },
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;