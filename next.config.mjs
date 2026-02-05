/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Transpile shared workspace package for Next.js
  // This tells Next.js to compile TypeScript code in your shared folder
  transpilePackages: ['shared'],
  experimental: {
    // Allows importing files from outside the Next.js app directory
    // This is useful for monorepo setups where shared code lives at the root
    externalDir: true,
  },
}

export default nextConfig
