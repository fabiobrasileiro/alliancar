/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cjsorrfgyfdblcvcalcj.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  // Configurações de performance para desenvolvimento
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Otimizações gerais
  reactStrictMode: true,
};

module.exports = nextConfig;
