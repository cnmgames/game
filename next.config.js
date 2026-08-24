/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "",
  trailingSlash: true,
  compress: true,
  poweredByHeader: false,
  // SWC压缩，更快更小
  swcMinify: true,
  // 生产环境优化
  productionBrowserSourceMaps: false,
  // 移除未使用的代码
  optimizeFonts: true,
  images: {
    unoptimized: true,
    formats: ["image/webp"],
    // 移动端设备尺寸
    deviceSizes: [360, 390, 414, 640, 750, 828, 1080, 1200],
  },
  // 实验性优化
  experimental: {
    // 优化CSS
    optimizeCss: false,
    // 客户端组件优化
    optimizePackageImports: ["lucide-react"],
  },
  // 静态资源缓存
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|webp|ico)",
        locale: false,
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:all*(js|css)",
        locale: false,
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
