import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "情侣互动小游戏合集 | 约会之夜必备",
  description: "专为情侣夫妻伴侣设计的在线互动派对游戏，情侣飞行棋、真心话大冒险、情趣骰子等，适合约会之夜，加深感情联系。",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1f2937] text-zinc-100 antialiased">
        {/* 背景装饰 */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
