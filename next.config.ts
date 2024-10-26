import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //api rewrite
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:5000/:path*',
  //     },
  //   ]
  // },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  output: 'standalone'
};

export default nextConfig;
