/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para desenvolvimento normal
  // output: 'export', // Comentado temporariamente
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Desabilitar otimizações que não funcionam em Electron
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig