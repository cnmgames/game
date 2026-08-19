"use client";
import Link from "next/link";
import { useState } from "react";

const penalties = [
  "喝一杯酒",
  "做10个深蹲",
  "说一句情话",
  "亲对方一下",
  "喝半杯水",
  "给对方按摩30秒",
  "唱一句歌",
  "模仿动物叫",
];

export default function DiceGame() {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [previous, setPrevious] = useState<number | null>(null);
  const [message, setMessage] = useState("掷骰子开始游戏，挑战上家点数");
  const [history, setHistory] = useState<number[]>([]);

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let count = 0;
    const anim = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(anim);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setDice1(d1);
        setDice2(d2);
        setRolling(false);
        const total = d1 + d2;
        setHistory((h) => [total, ...h].slice(0, 5));

        if (previous !== null) {
          if (total > previous) {
            setMessage(`掷出 ${d1}+${d2}=${total} 点，超过上家 ${previous}！安全过关 ✅`);
          } else if (total === previous) {
            setMessage(`掷出 ${d1}+${d2}=${total} 点，追平上家！再来一次 🎲`);
          } else {
            const penalty = penalties[Math.floor(Math.random() * penalties.length)];
            setMessage(`掷出 ${d1}+${d2}=${total} 点，低于上家 ${previous}，惩罚：${penalty} ❌`);
          }
        } else {
          setMessage(`掷出 ${d1}+${d2}=${total} 点，作为基准，下一位挑战！`);
        }
        setPrevious(total);
      }
    }, 70);
  };

  const reset = () => {
    setPrevious(null);
    setHistory([]);
    setMessage("掷骰子开始游戏，挑战上家点数");
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-pink-300 hover:text-pink-200 mb-6">
          ← 返回首页
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">🎲 情趣骰子</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">喝酒助兴必备，挑战上家点数，输了接受惩罚</p>
          </div>

          {/* 上家点数 */}
          <div className="mb-6 text-center">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
              上家点数：<span className="font-bold text-pink-300">{previous ?? "—"}</span>
            </span>
          </div>

          {/* 骰子 */}
          <div className="mb-8 flex justify-center gap-6">
            <div className={`text-8xl sm:text-9xl ${rolling ? "dice-rolling" : ""}`}>
              {diceFaces[dice1]}
            </div>
            <div className={`text-8xl sm:text-9xl ${rolling ? "dice-rolling" : ""}`} style={{ animationDelay: "0.1s" }}>
              {diceFaces[dice2]}
            </div>
          </div>

          {/* 消息 */}
          <div className="mb-6 min-h-[60px] rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm sm:text-base">
            {message}
          </div>

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="mb-6 text-center text-xs text-white/50">
              历史：{history.join(" → ")}
            </div>
          )}

          {/* 按钮 */}
          <div className="flex justify-center gap-3">
            <button
              onClick={roll}
              disabled={rolling}
              className="rounded-full bg-pink-500 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50"
            >
              {rolling ? "掷骰中..." : "🎲 掷骰子"}
            </button>
            <button
              onClick={reset}
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              重置
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
