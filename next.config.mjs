/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  images: {
    remotePatterns: [
      {
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    reactCompiler: {
      compilationMode: 'all',
    },
  },
}

export default nextConfig
