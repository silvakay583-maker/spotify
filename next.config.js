/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  allowedDevOrigins: [
    'ais-dev-kdwnb5qnocksbiupfvxu6r-169883713574.us-east1.run.app',
    'ais-pre-kdwnb5qnocksbiupfvxu6r-169883713574.us-east1.run.app',
    'localhost:3000',
    '*.run.app',
  ],
};
module.exports = nextConfig;
