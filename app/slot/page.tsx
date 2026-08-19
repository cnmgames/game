"use client";
import Link from "next/link";
import { useState, useRef } from "react";

const locations = ["卧室", "浴室", "厨房", "沙发", "阳台", "车内", "酒店", "天台"];
const actions = ["亲吻", "拥抱", "抚摸", "耳语", "依偎", "挑逗", "按摩", "凝视"];
const parts = ["嘴唇", "脖颈", "耳朵", "肩膀", "手背", "腰间", "发梢", "锁骨"];

export default function SlotGame() {
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [desire, setDesire] = useState(0);
  const [result, setResult] = useState("");
  const [winner, setWinner] = useState("");
  const intervals = useRef<(NodeJS.Timeout | null)[]>([null, null, null]);

  const allSpinning = spinning.every((s) => s);
  const anySpinning = spinning.some((s) => s);

  const spin = () => {
    if (anySpinning) return;
    setResult("");
    setWinner("");
    setSpinning([true, true, true]);

    const data = [locations, actions, parts];
    const finalValues = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      let count = 0;
      const targetCount = 15 + i * 8;
      intervals.current[i] = setInterval(() => {
        setReels((prev) => {
          const next = [...prev];
          next[i] = (next[i] + 1) % data[i].length;
          return next;
        });
        count++;
        if (count >= targetCount) {
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

          // 检查是否全部停止
          if (i === 2) {
            setTimeout(() => {
              const combo = `${locations[finalValues[0]]} · ${actions[finalValues[1]]} · ${parts[finalValues[2]]}`;
              setResult(combo);
              // 随机增加欲望值
              const gain = Math.floor(Math.random() * 15) + 5;
              setDesire((d) => {
                const nd = Math.min(d + gain, 100);
                if (nd >= 100) {
                  setWinner("🎉 欲望条已满！今晚属于你们！");
                }
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

  const data = [locations, actions, parts];

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-pink-300 hover:text-pink-200 mb-6">
          ← 返回首页
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">🎰 桃色老虎机</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">一拉定情，地点·动作·部位随机组合，先集满欲望条者胜</p>
          </div>

          {/* 欲望条 */}
          <div className="mb-6">
            <div className="mb-1 flex justify-between text-xs text-white/60">
              <span>欲望值</span>
              <span>{desire}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                style={{ width: `${desire}%` }}
              />
            </div>
          </div>

          {/* 老虎机 */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6">
            <div className="flex justify-center gap-2 sm:gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex h-24 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-lg font-bold sm:h-32 sm:w-28 sm:text-2xl ${
                    spinning[i] ? "animate-pulse" : ""
                  }`}
                >
                  <span className={spinning[i] ? "blur-[1px]" : ""}>
                    {data[i][reels[i]]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center text-xs text-white/40">地点 · 动作 · 部位</div>
          </div>

          {/* 结果 */}
          {result && (
            <div className="mb-6 rounded-2xl border border-pink-300/30 bg-pink-500/10 p-4 text-center fade-in-up">
              <div className="text-xs text-pink-300 mb-1">本次组合</div>
              <div className="text-lg font-semibold">{result}</div>
            </div>
          )}
          {winner && (
            <div className="mb-6 rounded-2xl border border-yellow-300/30 bg-yellow-500/10 p-4 text-center fade-in-up">
              <div className="text-lg font-bold text-yellow-300">{winner}</div>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex justify-center gap-3">
            <button
              onClick={spin}
              disabled={anySpinning}
              className="rounded-full bg-pink-500 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50"
            >
              {anySpinning ? "旋转中..." : "🎰 拉动拉杆"}
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
