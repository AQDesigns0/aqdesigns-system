/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true, // Allow local file uploads without optimization
  },
}

module.exports = nextConfig
