import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Prevent Next.js from treating the user's home dir as a workspace root
  // due to a pnpm-lock.yaml sitting two levels up.
  outputFileTracingRoot: path.resolve(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/properties',
        destination: '/listings',
        permanent: true,
      },
      {
        source: '/properties/:id',
        destination: '/listings/:id',
        permanent: true,
      },
      {
        source: '/properties/:id/owners',
        destination: '/listings/:id/owners',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
