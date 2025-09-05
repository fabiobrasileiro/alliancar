/** @type {import('next').NextConfig} */
const nextConfig = {
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
