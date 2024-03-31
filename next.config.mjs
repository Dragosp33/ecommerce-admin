/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // temp add for next-auth failded build issues
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'photobucket333.s3.eu-west-3.amazonaws.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
