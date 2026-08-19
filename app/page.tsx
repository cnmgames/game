"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [online, setOnline] = useState(128456);
  const [showPWA, setShowPWA] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setOnline((prev) => {
        const delta = Math.floor(Math.random() * 120) - 50;
        const next = prev + delta;
        if (next < 98000) return 98000;
        if (next > 156000) return 156000;
        return next;
      });
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const games = [
    { emoji: "✈️", title: "情侣飞行棋", desc: "经典飞行棋的情趣浪漫升级版，专为情侣设计的增进感情的情趣游戏。", path: "/flight" },
    { emoji: "🎡", title: "真心话大冒险转盘", desc: "终极派对游戏。旋转转盘抽取题目，回答劲爆的真心话问题或接受刺激大胆的挑战。", path: "/truth" },
    { emoji: "🎲", title: "情趣骰子", desc: "喝酒助兴必备。挑战上家的点数，输了就喝酒或大冒险。", path: "/dice" },
    { emoji: "🦁", title: "火辣暗兽棋", desc: "翻牌、博弈、宽衣。心跳加速的策略对决。", path: "/beast" },
    { emoji: "🎰", title: "桃色老虎机", desc: "一拉定情。地点、动作、部位，随机组合你的下一个亲密时刻。先集满欲望条者胜。", path: "/slot" },
    { emoji: "💎", title: "午夜大富翁", desc: "绕着棋盘冒险，每一站都有欲望事件等待完成。", path: "/monopoly" },
  ];

  return (
    <>
      <div className="bg-aurora" />
      {showPWA && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-4 z-[70] inline-flex max-w-[calc(100vw-2rem)] sm:left-6">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl bg-red-400/35 opacity-20 pwa-btn-glow" />
          <button onClick={() => setShowPWA(false)} className="group relative z-10 inline-flex max-w-full items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/95 text-[13px] font-medium text-white/85 shadow-lg shadow-black/30 ring-1 ring-white/5 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-red-200/30 hover:bg-zinc-900/95 hover:text-white min-h-11 gap-2 px-3.5 py-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-100 ring-1 ring-red-200/15">📱</span>
            <span className="whitespace-nowrap">添加到主屏幕</span>
          </button>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-7 px-3.5 py-4 sm:gap-12 sm:px-6 sm:py-10 lg:gap-16 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-8 sm:rounded-3xl sm:p-8">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-pink-200 sm:px-4 sm:text-xs">18+ Experience</span>
            <div className="nav-pill">
              <span className="online-dot" />
              <span className="sm:hidden">{online.toLocaleString()}</span>
              <span className="hidden sm:inline">当前在线：{online.toLocaleString()}</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-2.5 text-white sm:space-y-4">
            <h1 className="text-[1.7rem] font-semibold leading-tight sm:text-5xl">燃情此刻，放肆尽兴</h1>
            <p className="text-sm leading-relaxed text-white/80 sm:text-lg">多款氛围火辣的私房游戏，专为敢玩敢爱的亲密情侣而设。</p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a href="#games" className="btn-primary md:hidden">开始探索</a>
              <a href="#games" className="hidden items-center gap-2 rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 md:inline-flex">开始探索</a>
            </div>
          </div>
        </div>

        <div id="games" className="space-y-4 sm:space-y-8">
          <div className="max-w-3xl space-y-1.5 text-white sm:space-y-3">
            <h2 className="text-xl font-semibold sm:text-3xl">游戏合集</h2>
            <p className="text-xs leading-relaxed text-white/70 sm:text-base">挑一款游戏，跟随指令，让欲望引路。</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {games.map((game, i) => (
              <Link key={game.path} href={game.path} className="game-card group fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="game-card-emoji">{game.emoji}</span>
                <div className="space-y-2 sm:space-y-4">
                  <span className="game-card-tag">{game.title}</span>
                  <p className="game-card-desc">{game.desc}</p>
                </div>
                <span className="game-card-link">进入游戏 <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-2 pt-8 text-center text-xs text-white/50 sm:text-sm">
          <p>请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
          <p>© 2024 ~ 2026 www.hoothin.com</p>
        </div>
      </div>
    </>
  );
}
