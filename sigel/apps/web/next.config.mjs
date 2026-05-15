/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async rewrites() {
    return [
      { source: '/api/gateway/:path*', destination: `${process.env.GATEWAY_URL ?? 'http://gateway:3000'}/api/v1/:path*` },
    ];
  },
};
export default nextConfig;
