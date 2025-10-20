const path = require('path');

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
    ],
    // Legacy domains support (will be deprecated)
    domains: ['images.unsplash.com', 'cdn.pixabay.com', 'images.pexels.com'],
  },
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  // 🆕 TAMBAHAN UNTUK POLOTNO
  transpilePackages: ['polotno'],

  // Webpack config untuk Polotno (jika diperlukan)
  webpack: (config, { isServer }) => {
    // Provide path alias so imports starting with `@/` resolve to `src/`
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@/prisma': path.resolve(__dirname, 'prisma'),
    };
    // Polotno compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
      };
    }

    return config;
  },

  experimental: {
    optimizePackageImports: ['polotno', 'lucide-react'],
  },
  async rewrites() {
    return [
      {
        source: '/account/kelas/:path*',
        destination: '/kelas/:path*',
      },
    ];
  },
};
