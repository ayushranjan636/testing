/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com', 'images.pexels.com'],
  },
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig