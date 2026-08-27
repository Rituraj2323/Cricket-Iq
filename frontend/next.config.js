/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/players/:path*',
        destination: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/players/:path*' : '/api/players/:path*',
      },
      {
        source: '/recommend/:path*',
        destination: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/recommend/:path*' : '/api/recommend/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
