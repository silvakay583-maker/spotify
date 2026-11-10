/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  devIndicators: false,
  allowedDevOrigins: [
    'ais-dev-ew3wkuf6gsej3cd5dd2g6i-1835567534.us-west2.run.app',
    'ais-pre-ew3wkuf6gsej3cd5dd2g6i-1835567534.us-west2.run.app',
    'ais-dev-kdwnb5qnocksbiupfvxu6r-169883713574.us-east1.run.app',
    'ais-pre-kdwnb5qnocksbiupfvxu6r-169883713574.us-east1.run.app',
    'localhost:3000',
    '127.0.0.1:3000',
    '*.run.app',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tradenetlease.com',
        pathname: '/**',
      },
    ],
  },
};
module.exports = nextConfig;
