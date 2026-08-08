import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    /**
     * The seeded portraits are hosted on rickandmortyapi.com. Next 16
     * deprecated `images.domains`; `remotePatterns` is the supported form and
     * is narrower, since it pins the protocol and path as well as the host.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rickandmortyapi.com',
        pathname: '/api/character/avatar/**',
      },
    ],
  },
};

export default nextConfig;
