"use client";
import Link from "next/link";
import { useState, useRef } from "react";

// 扑克牌样式的数据
const locations = [
  { card: "4♥", suit: "♥", text: "阳台" },
  { card: "2♦", suit: "♦", text: "沙发" },
  { card: "8♣", suit: "♣", text: "厨房" },
  { card: "K♦", suit: "♦", text: "床上" },
  { card: "2♦", suit: "♦", text: "浴室" },
  { card: "9♣", suit: "♣", text: "阳台" },
  { card: "9♣", suit: "♣", text: "沙发" },
  { card: "Q♠", suit: "♠", text: "厨房" },
  { card: "5♠", suit: "♠", text: "床上" },
  { card: "10♠", suit: "♠", text: "浴室" },
];

const actions = [
  { card: "4♣", suit: "♣", text: "亲吻" },
  { card: "A♦", suit: "♦", text: "按摩" },
  { card: "2♠", suit: "♠", text: "舔舐" },
  { card: "3♠", suit: "♠", text: "轻咬" },
  { card: "2♣", suit: "♣", text: "抚摸" },
  { card: "3♣", suit: "♣", text: "挠痒痒" },
  { card: "7♣", suit: "♣", text: "拥抱" },
  { card: "2♦", suit: "♦", text: "吹气" },
  { card: "9♥", suit: "♥", text: "轻捏" },
  { card: "Q♣", suit: "♣", text: "轻拍" },
];

const parts = [
  { card: "4♥", suit: "♥", text: "脖子" },
  { card: "A♣", suit: "♣", text: "耳朵" },
  { card: "2♥", suit: "♥", text: "大腿" },
  { card: "2♦", suit: "♦", text: "嘴唇" },
  { card: "3♦", suit: "♦", text: "胸口" },
  { card: "5♥", suit: "♥", text: "腰间" },
  { card: "6♠", suit: "♠", text: "手背" },
  { card: "7♦", suit: "♦", text: "发梢" },
  { card: "8♥", suit: "♥", text: "锁骨" },
  { card: "J♠", suit: "♠", text: "脚踝" },
];

const suitColors: Record<string, string> = {
  "♥": "text-red-400",
  "♦": "text-red-400",
  "♣": "text-white",
  "♠": "text-white",
};

export default function SlotGame() {
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [desire, setDesire] = useState(0);
  const [result, setResult] = useState("");
  const [winner, setWinner] = useState("");
  const intervals = useRef<(NodeJS.Timeout | null)[]>([null, null, null]);

  const anySpinning = spinning.some((s) => s);
  const data = [locations, actions, parts];
  const labels = ["地点", "动作", "部位"];

  const spin = () => {
    if (anySpinning) return;
    setResult("");
    setWinner("");
    setSpinning([true, true, true]);

    const finalValues = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      let count = 0;
      const target = 15 + i * 8;
      intervals.current[i] = setInterval(() => {
        setReels((prev) => {
          const next = [...prev];
          next[i] = (next[i] + 1) % data[i].length;
          return next;
        });
        count++;
        if (count >= target) {
          if (intervals.current[i]) clearInterval(intervals.current[i]!);
          const final = Math.floor(Math.random() * data[i].length);
          finalValues[i] = final;
          setReels((prev) => {
            const next = [...prev];
            next[i] = final;
            return next;
          });
          setSpinning((prev) => {
            const next = [...prev];
            next[i] = false;
            return next;
          });

          if (i === 2) {
            setTimeout(() => {
              const combo = `${locations[finalValues[0]].text} · ${actions[finalValues[1]].text} · ${parts[finalValues[2]].text}`;
              setResult(combo);
              const gain = Math.floor(Math.random() * 15) + 5;
              setDesire((d) => {
                const nd = Math.min(d + gain, 100);
                if (nd >= 100) setWinner("🎉 欲望条已满！今晚属于你们！");
                return nd;
              });
            }, 300);
          }
        }
      }, 80 + i * 30);
    }
  };

  const reset = () => {
    setDesire(0);
    setResult("");
    setWinner("");
    setReels([0, 0, 0]);
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-2xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-pink-300 hover:text-pink-200">← 返回游戏列表</Link>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-6 sm:rounded-3xl sm:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">🎰 桃色老虎机</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">一拉定情。地点、动作、部位，随机组合你的下一个亲密时刻</p>
          </div>

          {/* 玩家和欲望条 */}
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm">玩家1</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>欲望值</span>
                <span>{desire}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500" style={{ width: `${desire}%` }} />
              </div>
            </div>
          </div>

          {/* 老虎机滚轮 - 扑克牌样式 */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="flex justify-center gap-2 sm:gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="text-xs text-white/50">{labels[i]}</div>
                  <div className={`relative flex h-36 w-16 flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 sm:h-44 sm:w-20 ${spinning[i] ? "animate-pulse" : ""}`}>
                    {/* 扑克牌样式 */}
                    <div className={`text-lg font-bold ${suitColors[data[i][reels[i]].suit]} sm:text-xl`}>
                      {data[i][reels[i]].card}
                    </div>
                    <div className="mt-1 text-xs text-white/80 sm:text-sm">{data[i][reels[i]].text}</div>
                    {/* 上下遮罩 */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/60 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 结果 */}
          {result && (
            <div className="rounded-xl border border-pink-300/30 bg-pink-500/10 p-4 text-center fade-in-up">
              <div className="text-xs text-pink-300 mb-1">本次组合</div>
              <div className="text-base font-semibold">{result}</div>
            </div>
          )}
          {winner && (
            <div className="rounded-xl border border-yellow-300/30 bg-yellow-500/10 p-4 text-center fade-in-up">
              <div className="text-lg font-bold text-yellow-300">{winner}</div>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button onClick={spin} disabled={anySpinning} className="rounded-full bg-pink-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50">
              {anySpinning ? "旋转中..." : "🎰 拉动拉杆"}
            </button>
            <button onClick={reset} className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">重置</button>
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
