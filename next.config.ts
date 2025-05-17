
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
        'node:async_hooks': false, // Handle 'node:' prefixed import
        fs: false,
        'node:fs': false,
        tls: false,
        'node:tls': false,
        net: false,
        'node:net': false,
        http2: false,
        'node:http2': false,
        dns: false,
        'node:dns': false,
      };
    }
    return config;
  },
};

export default nextConfig;
