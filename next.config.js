/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s11.flagcounter.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Simplified webpack config
  webpack: (config, { isServer }) => {
    // Add all node_modules to externals for server
    if (isServer) {
      const nodeModules = ["pino-pretty", "encoding"]
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        (context, request, callback) => {
          if (nodeModules.includes(request) || /^pino-/.test(request)) {
            return callback(null, "commonjs " + request)
          }
          callback()
        },
      ]
    }
    return config
  },
}

module.exports = nextConfig
