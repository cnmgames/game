/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  ...(isGithubPages
    ? {
        output: "export",
        images: { unoptimized: true },
        basePath: "/game",
        assetPrefix: "/game/",
      }
    : {}),
};

module.exports = nextConfig;