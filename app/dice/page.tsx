"use client";
import Link from "next/link";
import { useState } from "react";

const penalties = [
  "喝一杯酒", "做10个深蹲", "说一句情话", "亲对方一下",
  "喝半杯水", "给对方按摩30秒", "唱一句歌", "模仿动物叫",
  "脱一件外套", "发一条撒娇语音",
];

export default function DiceGame() {
  const [players, setPlayers] = useState(["酒友1", "酒友2"]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dice, setDice] = useState(1);
  const [diceCount, setDiceCount] = useState(1);
  const [previous, setPrevious] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("掷骰子开始游戏，挑战上家点数");
  const [stage, setStage] = useState(1);
  const [stageProgress, setStageProgress] = useState(0);
  const [penaltyPool, setPenaltyPool] = useState(0);

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let count = 0;
    const anim = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(anim);
        const final = Math.floor(Math.random() * 6) + 1;
        setDice(final);
        setRolling(false);
        const total = final * diceCount;

        if (previous !== null) {
          if (total > previous) {
            setMessage(`掷出 ${total} 点，超过上家 ${previous}！安全过关 ✅`);
            setStageProgress((p) => {
              const np = p + 1;
              if (np >= 5) {
                setStage((s) => s + 1);
                return 0;
              }
              return np;
            });
          } else if (total === previous) {
            setMessage(`掷出 ${total} 点，追平上家！再来一次 🎲`);
          } else {
            const penalty = penalties[Math.floor(Math.random() * penalties.length)];
            setMessage(`掷出 ${total} 点，低于上家 ${previous}，惩罚：${penalty} ❌`);
            setPenaltyPool((p) => p + 1);
          }
        } else {
          setMessage(`掷出 ${total} 点，作为基准，下一位挑战！`);
        }
        setPrevious(total);
        setCurrentIdx((i) => (i + 1) % players.length);
      }
    }, 70);
  };

  const reset = () => {
    setPrevious(null);
    setMessage("掷骰子开始游戏，挑战上家点数");
    setStage(1);
    setStageProgress(0);
    setPenaltyPool(0);
    setCurrentIdx(0);
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-2xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-pink-300 hover:text-pink-200">← 返回游戏列表</Link>
          <div className="hidden md:flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 border border-white/10">
            <span className="rounded-full px-3 py-1 text-sm bg-white text-gray-900">简体</span>
            <span className="rounded-full px-3 py-1 text-sm text-white/70">En</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-6 sm:rounded-3xl sm:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">情趣骰子</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">喝酒助兴必备。挑战上家的点数，输了就喝酒或大冒险</p>
          </div>

          {/* 状态栏 */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/50">当前回合</div>
              <div className="text-sm font-semibold text-pink-300">{players[currentIdx]}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/50">当前骰子数</div>
              <div className="text-sm font-semibold">{diceCount}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/50">上家点数</div>
              <div className="text-sm font-semibold text-pink-300">{previous ?? "—"}</div>
            </div>
          </div>

          {/* 骰子 */}
          <div className="flex justify-center">
            <div className={`text-8xl sm:text-9xl ${rolling ? "dice-rolling" : ""}`}>{diceFaces[dice]}</div>
          </div>

          {/* 消息 */}
          <div className="min-h-[50px] rounded-xl border border-white/10 bg-black/20 p-3 text-center text-sm">{message}</div>

          {/* 按钮 */}
          <div className="flex justify-center gap-3">
            <button onClick={roll} disabled={rolling} className="rounded-full bg-pink-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50">
              {rolling ? "掷骰中..." : "🎲 掷骰子"}
            </button>
            <button onClick={reset} className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">重置</button>
          </div>

          {/* 酒局玩家 */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold mb-2">酒局玩家</div>
            <div className="flex flex-wrap gap-2">
              {players.map((p, i) => (
                <span key={i} className={`rounded-full px-3 py-1 text-sm ${i === currentIdx ? "bg-pink-500/30 text-pink-200" : "bg-white/10 text-white/70"}`}>🍺 {p}</span>
              ))}
            </div>
          </div>

          {/* 惩罚库和阶段 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center">
              <div className="text-xs text-white/50 mb-1">惩罚库</div>
              <div className="text-2xl font-bold text-red-400">{penaltyPool}</div>
              <button className="mt-2 text-xs text-pink-300 hover:text-pink-200">点击管理惩罚库</button>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center">
              <div className="text-xs text-white/50 mb-1">阶段 {stage}</div>
              <div className="text-2xl font-bold text-green-400">{stageProgress}/5</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-green-500 transition-all" style={{ width: `${(stageProgress / 5) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/40">
          请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。
          <br />© 2024 ~ 2026 www.hoothin.com
        </div>
      </div>
    </>
  );
}
