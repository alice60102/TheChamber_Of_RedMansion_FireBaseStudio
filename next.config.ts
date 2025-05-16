
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent bundling of Node.js specific modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false, // Tells Webpack to provide an empty module for async_hooks on the client
        fs: false, // Tells Webpack to provide an empty module for fs on the client
        tls: false, // Tells Webpack to provide an empty module for tls on the client
        net: false, // Tells Webpack to provide an empty module for net on the client
      };
      // Explicitly alias the problematic module to its browser-safe counterpart for client builds
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/context-async-hooks': '@opentelemetry/context-base',
      };
    }
    return config;
  },
};

export default nextConfig;
