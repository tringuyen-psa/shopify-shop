import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure webpack to handle extension interference
  webpack: (config, { dev, isServer }) => {
    if (!isServer && dev) {
      // Ignore browser extension modules that cause hydration issues
      config.resolve.alias = {
        ...config.resolve.alias,
        'chrome-extension': false,
        'webextension': false,
      };
    }
    return config;
  },
};

export default nextConfig;
