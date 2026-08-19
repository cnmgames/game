/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/game",
  trailingSlash: true,
  images: { unoptimized: true },
};
module.exports = nextConfig;
