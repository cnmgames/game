"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface GameLayoutProps {
  title: string;
  emoji: string;
  children: ReactNode;
}

export default function GameLayout({ title, emoji, children }: GameLayoutProps) {
  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4 px-3.5 py-4 sm:gap-6 sm:px-6 sm:py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <span>←</span>
            <span className="hidden sm:inline">返回首页</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <h1 className="text-lg font-semibold text-white sm:text-xl">{title}</h1>
          </div>
          <div className="w-20" /> {/* 占位保持居中 */}
        </div>

        {/* 游戏内容 */}
        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}
