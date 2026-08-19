"use client";
import Link from "next/link";
import { useState, useCallback } from "react";

// 飞行棋事件格
const events = [
  { type: "start", text: "起点" },
  { type: "event", text: "对视10秒，不许笑" },
  { type: "event", text: "夸对方3个优点" },
  { type: "event", text: "拥抱30秒" },
  { type: "event", text: "说一句情话" },
  { type: "event", text: "亲一下对方额头" },
  { type: "event", text: "模仿对方一个动作" },
  { type: "event", text: "后背写字猜词" },
  { type: "event", text: "喂对方一口水" },
  { type: "event", text: "十指相扣1分钟" },
  { type: "event", text: "说第一次心动的瞬间" },
  { type: "event", text: "给对方按摩肩膀" },
  { type: "event", text: "深情告白30秒" },
  { type: "event", text: "交换一个小秘密" },
  { type: "event", text: "公主抱/背起对方" },
  { type: "event", text: "鼻尖碰鼻尖10秒" },
  { type: "event", text: "用眼神传达爱意" },
  { type: "event", text: "唱一句情歌" },
  { type: "event", text: "画一幅对方的速写" },
  { type: "event", text: "说最想一起做的事" },
  { type: "event", text: "感谢对方一件小事" },
  { type: "event", text: "许下一个小愿望" },
  { type: "event", text: "再来一次甜蜜拥抱" },
  { type: "end", text: "终点 🎉" },
];

export default function FlightGame() {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [turn, setTurn] = useState(1);
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("玩家1掷骰子开始游戏");
  const [currentEvent, setCurrentEvent] = useState("");

  const rollDice = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setDice(0);
    let count = 0;
    const rollAnim = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 8) {
        clearInterval(rollAnim);
        const final = Math.floor(Math.random() * 6) + 1;
        setDice(final);
        setRolling(false);

        if (turn === 1) {
          const newPos = Math.min(p1 + final, events.length - 1);
          setP1(newPos);
          if (newPos >= events.length - 1) {
            setMessage("🎉 玩家1 到达终点，获胜！");
            setCurrentEvent("");
          } else {
            setCurrentEvent(events[newPos].text);
            setMessage(`玩家1 掷出 ${final} 点，前进到第 ${newPos} 格`);
          }
          setTurn(2);
        } else {
          const newPos = Math.min(p2 + final, events.length - 1);
          setP2(newPos);
          if (newPos >= events.length - 1) {
            setMessage("🎉 玩家2 到达终点，获胜！");
            setCurrentEvent("");
          } else {
            setCurrentEvent(events[newPos].text);
            setMessage(`玩家2 掷出 ${final} 点，前进到第 ${newPos} 格`);
          }
          setTurn(1);
        }
      }
    }, 80);
  }, [rolling, turn, p1, p2]);

  const reset = () => {
    setP1(0);
    setP2(0);
    setTurn(1);
    setDice(0);
    setMessage("玩家1掷骰子开始游戏");
    setCurrentEvent("");
  };

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-pink-300 hover:text-pink-200 mb-6">
          ← 返回首页
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">✈️ 情侣飞行棋</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">经典飞行棋的情趣浪漫升级版，双人互动，步步甜蜜</p>
          </div>

          {/* 玩家状态 */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className={`rounded-2xl border p-3 text-center transition ${turn === 1 ? "border-pink-400/60 bg-pink-500/10" : "border-white/10 bg-white/5"}`}>
              <div className="text-xs text-white/60">玩家1</div>
              <div className="text-lg font-bold text-pink-300">位置 {p1}</div>
            </div>
            <div className={`rounded-2xl border p-3 text-center transition ${turn === 2 ? "border-purple-400/60 bg-purple-500/10" : "border-white/10 bg-white/5"}`}>
              <div className="text-xs text-white/60">玩家2</div>
              <div className="text-lg font-bold text-purple-300">位置 {p2}</div>
            </div>
          </div>

          {/* 棋盘 */}
          <div className="mb-6 grid grid-cols-6 gap-1.5 sm:gap-2">
            {events.map((e, i) => (
              <div
                key={i}
                className={`relative aspect-square rounded-lg border text-[10px] flex items-center justify-center text-center p-0.5 transition-all ${
                  i === p1 && i === p2
                    ? "border-yellow-400 bg-yellow-500/20"
                    : i === p1
                    ? "border-pink-400 bg-pink-500/20"
                    : i === p2
                    ? "border-purple-400 bg-purple-500/20"
                    : e.type === "end"
                    ? "border-green-400/50 bg-green-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-white/50">{i}</span>
                {i === p1 && <span className="absolute -top-1 -left-1 text-xs">🔴</span>}
                {i === p2 && <span className="absolute -top-1 -right-1 text-xs">🔵</span>}
              </div>
            ))}
          </div>

          {/* 事件提示 */}
          {currentEvent && (
            <div className="mb-6 rounded-2xl border border-pink-300/30 bg-pink-500/10 p-4 text-center">
              <div className="text-xs text-pink-300 mb-1">触发事件</div>
              <div className="text-lg font-semibold">{currentEvent}</div>
            </div>
          )}

          {/* 消息 */}
          <div className="mb-6 text-center text-sm text-white/80 sm:text-base">{message}</div>

          {/* 骰子和按钮 */}
          <div className="flex flex-col items-center gap-4">
            <div className={`text-7xl sm:text-8xl ${rolling ? "dice-rolling" : ""}`}>
              {dice > 0 ? diceFaces[dice] : "🎲"}
            </div>
            <div className="flex gap-3">
              <button
                onClick={rollDice}
                disabled={rolling}
                className="rounded-full bg-pink-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50"
              >
                {rolling ? "掷骰中..." : `玩家${turn}掷骰子`}
              </button>
              <button
                onClick={reset}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
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
