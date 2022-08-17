/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  async redirects() {
    return [
      // {
      //   source: "/admin",
      //   destination: "/",
      //   permanent: false,
      // },
    ];
  },
};

module.exports = nextConfig;
