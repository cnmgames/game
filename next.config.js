/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  ...(isGithubPages
    ? {
        output: "export",
        images: { unoptimized: true },
        // 仓库名是 game，部署到 https://cnmgames.github.io/game/
        basePath: "/game",
      }
    : {}),
};

module.exports = nextConfig;
