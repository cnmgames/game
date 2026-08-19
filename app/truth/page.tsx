"use client";
import Link from "next/link";
import { useState } from "react";

const truthQuestions = [
  "第一次对我心动是什么时候？", "最喜欢我身上哪个部位？",
  "说一件你一直没敢告诉我的事", "我们之间最让你难忘的瞬间？",
  "如果可以重来，你还会选择我吗？", "你觉得我最大的优点是什么？",
  "最想和我一起去的地方？", "你心里我是什么样的人？",
  "最近一次因为我吃醋？", "说一个对我的小秘密",
];

const dares = [
  "深情对视30秒不许笑", "用撒娇语气说三句话",
  "给对方一个1分钟的拥抱", "模仿对方生气的样子",
  "亲一下对方鼻尖", "说五句不同的情话",
  "给对方按摩肩膀2分钟", "十指相扣说我爱你",
  "在对方耳边说一句撩人的话", "喂对方吃一口东西",
];

const colors = ["#ec4899", "#8b5cf6", "#3b82f6", "#14b8a6", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];

export default function TruthGame() {
  const [players, setPlayers] = useState(["玩家1", "玩家2", "玩家3"]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [mode, setMode] = useState<"truth" | "dare">("truth");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");

  const addPlayer = () => {
    if (players.length < 6) setPlayers([...players, `玩家${players.length + 1}`]);
  };
  const removePlayer = (i: number) => {
    if (players.length > 1) {
      const newPlayers = players.filter((_, idx) => idx !== i);
      setPlayers(newPlayers);
      if (currentPlayer >= newPlayers.length) setCurrentPlayer(0);
    }
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult("");
    setSelectedPlayer("");
    const extra = 5 + Math.floor(Math.random() * 3);
    const angle = Math.floor(Math.random() * 360);
    setRotation(rotation + extra * 360 + angle);
    setTimeout(() => {
      setSpinning(false);
      const picked = players[Math.floor(Math.random() * players.length)];
      setSelectedPlayer(picked);
      setCurrentPlayer(players.indexOf(picked));
      const pool = mode === "truth" ? truthQuestions : dares;
      setResult(pool[Math.floor(Math.random() * pool.length)]);
    }, 4200);
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4">
          <Link href="/" className="text-sm text-pink-300 hover:text-pink-200">← 返回游戏列表</Link>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-6 sm:rounded-3xl sm:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">真心话大冒险转盘</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">终极派对游戏。旋转转盘抽取题目，回答劲爆真心话或接受刺激大冒险</p>
          </div>

          {/* 当前回合 */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <div className="text-xs text-white/50">当前回合</div>
            <div className="text-lg font-semibold text-pink-300">{players[currentPlayer]}</div>
          </div>

          {/* 模式切换 */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setMode("truth")}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition ${mode === "truth" ? "bg-purple-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
            >真心话</button>
            <button
              onClick={() => setMode("dare")}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition ${mode === "dare" ? "bg-pink-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
            >大冒险</button>
          </div>

          {/* 转盘 */}
          <div className="relative mx-auto h-56 w-56 sm:h-72 sm:w-72">
            <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
              <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-pink-400" />
            </div>
            <svg viewBox="0 0 200 200" className="wheel-spin h-full w-full drop-shadow-2xl" style={{ transform: `rotate(${rotation}deg)` }}>
              {colors.map((color, i) => {
                const start = (i * 45 - 90) * Math.PI / 180;
                const end = ((i + 1) * 45 - 90) * Math.PI / 180;
                const x1 = 100 + 100 * Math.cos(start), y1 = 100 + 100 * Math.sin(start);
                const x2 = 100 + 100 * Math.cos(end), y2 = 100 + 100 * Math.sin(end);
                return <path key={i} d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`} fill={color} stroke="rgba(255,255,255,0.2)" />;
              })}
              <circle cx="100" cy="100" r="20" fill="#0f172a" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">GO</text>
            </svg>
          </div>

          {/* 结果 */}
          {result && (
            <div className="rounded-xl border border-pink-300/30 bg-pink-500/10 p-4 text-center fade-in-up">
              {selectedPlayer && <div className="text-xs text-pink-300 mb-1">转盘选中：{selectedPlayer}</div>}
              <div className={`mb-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${mode === "truth" ? "bg-purple-500/30 text-purple-200" : "bg-pink-500/30 text-pink-200"}`}>
                {mode === "truth" ? "真心话" : "大冒险"}
              </div>
              <div className="text-base font-semibold">{result}</div>
            </div>
          )}

          <div className="text-center">
            <button onClick={spin} disabled={spinning} className="rounded-full bg-pink-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50">
              {spinning ? "旋转中..." : "🎯 转盘选人"}
            </button>
          </div>

          {/* 玩家管理 */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">玩家人数（{players.length}）</span>
              <button onClick={addPlayer} className="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20">+ 新增玩家</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-sm">
                  <span>{p}</span>
                  <button onClick={() => removePlayer(i)} className="text-white/50 hover:text-red-400 ml-1">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* 题库管理 */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold mb-2">题库管理</div>
            <p className="text-xs text-white/50 mb-3">打开编辑器修改内建题目，或新增自定义题目</p>
            <div className="flex gap-2 flex-wrap">
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10">编辑系统真心题</button>
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10">编辑系统大冒险</button>
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
