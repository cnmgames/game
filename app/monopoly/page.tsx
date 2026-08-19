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
  const [message, setMessage] = useState("掷骰子开始冒险");
  const [currentEvent, setCurrentEvent] = useState("");
  const [skipTurn, setSkipTurn] = useState(false);
  const [extraTurn, setExtraTurn] = useState(false);

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

        let newPos = Math.min(pos + final, boardEvents.length - 1);
        setPos(newPos);
        setMessage(`掷出 ${final} 点，前进到第 ${newPos} 格`);

        const event = boardEvents[newPos];
        if (event.type === "end") {
          setCurrentEvent("🎉 恭喜到达终点！你们完成了午夜大冒险！");
        } else if (event.type === "reward" && event.text.includes("前进")) {
          setCurrentEvent(event.text);
          setTimeout(() => {
            const bonusPos = Math.min(newPos + 2, boardEvents.length - 1);
            setPos(bonusPos);
            setMessage(`奖励前进2格，到第 ${bonusPos} 格`);
            if (boardEvents[bonusPos].type === "end") {
              setCurrentEvent("🎉 恭喜到达终点！");
            } else {
              setCurrentEvent(boardEvents[bonusPos].text);
            }
          }, 1000);
        } else if (event.type === "reward" && event.text.includes("再来")) {
          setCurrentEvent(event.text);
          setExtraTurn(true);
        } else if (event.type === "penalty" && event.text.includes("后退")) {
          setCurrentEvent(event.text);
          setTimeout(() => {
            const penaltyPos = Math.max(newPos - 1, 0);
            setPos(penaltyPos);
            setMessage(`后退1格，到第 ${penaltyPos} 格`);
          }, 1000);
        } else if (event.type === "penalty" && event.text.includes("停")) {
          setCurrentEvent(event.text);
          setSkipTurn(true);
        } else {
          setCurrentEvent(event.text);
        }
      }
    }, 80);
  };

  const reset = () => {
    setPos(0);
    setDice(0);
    setMessage("掷骰子开始冒险");
    setCurrentEvent("");
    setSkipTurn(false);
    setExtraTurn(false);
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-pink-300 hover:text-pink-200 mb-6">
          ← 返回首页
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">💎 午夜大富翁</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">绕着棋盘冒险，每一站都有欲望事件等待完成</p>
          </div>

          {/* 位置 */}
          <div className="mb-4 text-center">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
              当前位置：<span className="font-bold text-pink-300">{pos}</span> / {boardEvents.length - 1}
            </span>
          </div>

          {/* 棋盘 */}
          <div className="mb-6 grid grid-cols-4 gap-1.5 sm:gap-2">
            {boardEvents.map((e, i) => (
              <div
                key={i}
                className={`relative aspect-square rounded-lg border p-1 text-center text-[9px] sm:text-[11px] flex items-center justify-center transition-all ${
                  i === pos
                    ? "border-pink-400 bg-pink-500/30 ring-2 ring-pink-400/50 scale-105"
                    : e.color
                } border-white/10`}
              >
                <span className="leading-tight">{e.text}</span>
                {i === pos && (
                  <span className="absolute -top-2 -right-2 text-base">📍</span>
                )}
              </div>
            ))}
          </div>

          {/* 事件 */}
          {currentEvent && (
            <div className="mb-6 rounded-2xl border border-pink-300/30 bg-pink-500/10 p-4 text-center fade-in-up">
              <div className="text-xs text-pink-300 mb-1">触发事件</div>
              <div className="text-lg font-semibold">{currentEvent}</div>
            </div>
          )}

          {/* 消息 */}
          <div className="mb-6 text-center text-sm text-white/80 sm:text-base">{message}</div>

          {/* 骰子 */}
          <div className="flex flex-col items-center gap-4">
            <div className={`text-7xl sm:text-8xl ${rolling ? "dice-rolling" : ""}`}>
              {dice > 0 ? diceFaces[dice] : "🎲"}
            </div>
            <div className="flex gap-3">
              <button
                onClick={roll}
                disabled={rolling}
                className="rounded-full bg-pink-500 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50"
              >
                {rolling ? "掷骰中..." : "🎲 掷骰子前进"}
              </button>
              <button
                onClick={reset}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                重新开始
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
