/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  // 部署到 GitHub Pages 时会自动启用静态导出（通过 GITHUB_PAGES 环境变量）
  // 如需本地静态导出，取消下面这行注释：
  // output: "export",
  ...(isGithubPages
    ? {
        output: "export",
        images: { unoptimized: true },
        // 如果部署到 https://用户名.github.io/仓库名/，需要设置 basePath：
        // basePath: "/你的仓库名",
        // assetPrefix: "/你的仓库名/",
      }
    : {}),
};

module.exports = nextConfig;
