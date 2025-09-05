import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import JavaScriptObfuscator from "webpack-obfuscator";
import CompressionPlugin from "compression-webpack-plugin";
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});
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
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },
  webpack(config, { dev, isServer }) {
    config.optimization.splitChunks.cacheGroups = {
      ...config.optimization.splitChunks.cacheGroups,
      dashboard: {
        test: /[\\/]components[\\/]initial-rendering[\\/]/,
        name: "dashboard",
        chunks: "all",
        enforce: true,
      },
    };
    if (!dev && !isServer) {
      config.plugins.push(
        new JavaScriptObfuscator(
          {
            compact: true,
            controlFlowFlattening: true,
            deadCodeInjection: true,
            debugProtection: true,
            disableConsoleOutput: true,
            identifierNamesGenerator: "hexadecimal",
            selfDefending: true,
          },
          ["vendor.js"]
        )
      );
      config.plugins.push(
        new CompressionPlugin({
          algorithm: "brotliCompress",
          filename: "[path][base].br",
          test: /\.(js|css|html|svg)$/,
          compressionOptions: { level: 11 },
          threshold: 10240,
          minRatio: 0.8,
        }),
        new CompressionPlugin({
          algorithm: "gzip",
          filename: "[path][base].gz",
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
export default withBundleAnalyzer(nextConfig);
