/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cjsorrfgyfdblcvcalcj.supabase.co',
      'localhost' // para desenvolvimento local
    ],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  eslint: {
    // Evita que o build falhe por erros de ESLint (Vercel bot)
    ignoreDuringBuilds: true,
  },
  turbopack: {
    // Ajuda a resolver o aviso de múltiplos lockfiles
    root: __dirname,
  },
};

module.exports = nextConfig;
