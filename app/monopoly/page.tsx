"use client";
import Link from "next/link";
import { useState } from "react";

const boardEvents = [
  { type: "start", text: "起点", color: "bg-green-500/20 border-green-400/50" },
  { type: "event", text: "互夸3个优点", color: "bg-pink-500/10" },
  { type: "event", text: "拥抱30秒", color: "bg-purple-500/10" },
  { type: "reward", text: "前进2格 🎁", color: "bg-yellow-500/10" },
  { type: "event", text: "说一句情话", color: "bg-pink-500/10" },
  { type: "event", text: "亲一下额头", color: "bg-purple-500/10" },
  { type: "penalty", text: "后退1格 ⬅️", color: "bg-red-500/10" },
  { type: "event", text: "按摩肩膀1分钟", color: "bg-pink-500/10" },
  { type: "event", text: "深情对视20秒", color: "bg-purple-500/10" },
  { type: "reward", text: "再来一次 🎲", color: "bg-yellow-500/10" },
  { type: "event", text: "交换小秘密", color: "bg-pink-500/10" },
  { type: "event", text: "喂对方一口水", color: "bg-purple-500/10" },
  { type: "event", text: "十指相扣1分钟", color: "bg-pink-500/10" },
  { type: "penalty", text: "停一轮 ⏸️", color: "bg-red-500/10" },
  { type: "event", text: "唱一句情歌", color: "bg-purple-500/10" },
  { type: "end", text: "终点 🏆", color: "bg-yellow-500/20 border-yellow-400/50" },
];

export default function MonopolyGame() {
  const [pos, setPos] = useState(0);
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("双骰出击，囤积亲密互动");
  const [currentEvent, setCurrentEvent] = useState("");
  const [skipTurn, setSkipTurn] = useState(false);
  const [showDev, setShowDev] = useState(true);

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  const roll = () => {
    if (rolling) return;
    if (skipTurn) {
      setMessage("这一轮被跳过了，再掷一次继续！");
      setSkipTurn(false);
      return;
    }
    setRolling(true);
    setCurrentEvent("");
    let count = 0;
    const anim = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 8) {
        clearInterval(anim);
        const final = Math.floor(Math.random() * 6) + 1;
        setDice(final);
        setRolling(false);
        const newPos = Math.min(pos + final, boardEvents.length - 1);
        setPos(newPos);
        setMessage(`掷出 ${final} 点，前进到第 ${newPos} 格`);
        const event = boardEvents[newPos];
        if (event.type === "end") {
          setCurrentEvent("🎉 恭喜到达终点！你们完成了午夜大冒险！");
        } else if (event.type === "reward" && event.text.includes("前进")) {
          setCurrentEvent(event.text);
          setTimeout(() => {
            const bp = Math.min(newPos + 2, boardEvents.length - 1);
            setPos(bp);
            setMessage(`奖励前进2格，到第 ${bp} 格`);
            if (boardEvents[bp].type === "end") setCurrentEvent("🎉 恭喜到达终点！");
            else setCurrentEvent(boardEvents[bp].text);
          }, 1000);
        } else if (event.type === "reward") {
          setCurrentEvent(event.text);
        } else if (event.type === "penalty" && event.text.includes("后退")) {
          setCurrentEvent(event.text);
          setTimeout(() => {
            const pp = Math.max(newPos - 1, 0);
            setPos(pp);
            setMessage(`后退1格，到第 ${pp} 格`);
          }, 1000);
        } else if (event.type === "penalty") {
          setCurrentEvent(event.text);
          setSkipTurn(true);
        } else {
          setCurrentEvent(event.text);
        }
      }
    }, 80);
  };

  const reset = () => {
    setPos(0); setDice(0); setMessage("双骰出击，囤积亲密互动");
    setCurrentEvent(""); setSkipTurn(false);
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-pink-300 hover:text-pink-200">← 返回游戏列表</Link>
          <div className="hidden md:flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 border border-white/10">
            <span className="rounded-full px-3 py-1 text-sm bg-white text-gray-900">简体</span>
            <span className="rounded-full px-3 py-1 text-sm text-white/70">En</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-6 sm:rounded-3xl sm:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">💎 午夜大富翁</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">双骰出击，囤积亲密互动，在夜色棋盘上建立你的刺激帝国</p>
          </div>

          {/* 开发中提示 */}
          {showDev && (
            <div className="rounded-xl border border-yellow-300/30 bg-yellow-500/10 p-3 text-center text-sm text-yellow-200">
              ⚠️ 功能开发中，当前为体验版。完整版本欢迎加入 Discord 催更
              <button onClick={() => setShowDev(false)} className="ml-2 text-xs underline">知道了</button>
            </div>
          )}

          <div className="text-center">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm">当前位置：<span className="font-bold text-pink-300">{pos}</span> / {boardEvents.length - 1}</span>
          </div>

          {/* 棋盘 */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {boardEvents.map((e, i) => (
              <div key={i} className={`relative aspect-square rounded-lg border p-1 text-center text-[9px] sm:text-[11px] flex items-center justify-center transition-all ${
                i === pos ? "border-pink-400 bg-pink-500/30 ring-2 ring-pink-400/50 scale-105" : e.color
              } border-white/10`}>
                <span className="leading-tight">{e.text}</span>
                {i === pos && <span className="absolute -top-2 -right-2 text-base">📍</span>}
              </div>
            ))}
          </div>

          {currentEvent && (
            <div className="rounded-xl border border-pink-300/30 bg-pink-500/10 p-4 text-center fade-in-up">
              <div className="text-xs text-pink-300 mb-1">触发事件</div>
              <div className="text-base font-semibold">{currentEvent}</div>
            </div>
          )}

          <div className="text-center text-sm text-white/80">{message}</div>

          <div className="flex flex-col items-center gap-4">
            <div className={`text-6xl sm:text-7xl ${rolling ? "dice-rolling" : ""}`}>{dice > 0 ? diceFaces[dice] : "🎲"}</div>
            <div className="flex gap-3">
              <button onClick={roll} disabled={rolling} className="rounded-full bg-pink-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 hover:bg-pink-400 disabled:opacity-50">
                {rolling ? "掷骰中..." : "🎲 掷骰子前进"}
              </button>
              <button onClick={reset} className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">重新开始</button>
            </div>
          </div>

          {/* Discord 催更 */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center">
            <p className="text-sm text-white/60 mb-2">完整功能开发中，欢迎加入 Discord 催更</p>
            <button className="rounded-full bg-indigo-500 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-400">加入 Discord</button>
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
