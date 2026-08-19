"use client";
import Link from "next/link";
import { useState, useRef } from "react";

const truthQuestions = [
  "第一次对我心动是什么时候？",
  "最喜欢我身上哪个部位？",
  "说一件你一直没敢告诉我的事",
  "我们之间最让你难忘的瞬间是？",
  "如果可以重来，你还会选择我吗？",
  "你觉得我最大的优点是什么？",
  "最想和我一起去的地方是哪里？",
  "你心里我是什么样的人？",
  "最近一次因为我吃醋是什么时候？",
  "说一个你对我的小秘密",
  "最满意我们关系的哪一点？",
  "如果只能留一样我的东西，你留什么？",
];

const dares = [
  "深情对视30秒不许笑",
  "用撒娇的语气说三句话",
  "给对方一个长达1分钟的拥抱",
  "模仿对方生气的样子",
  "亲一下对方的鼻尖",
  "说五句不同的情话",
  "给对方按摩肩膀2分钟",
  "用嘴唇在对方脖子上写字让对方猜",
  "公主抱/背起对方做5个深蹲",
  "喂对方吃一口东西",
  "十指相扣说我爱你",
  "在对方耳边轻声说一句撩人的话",
];

// 转盘颜色
const colors = [
  "#ec4899", "#8b5cf6", "#3b82f6", "#14b8a6",
  "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6",
];

export default function TruthGame() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ type: string; text: string } | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const randomAngle = Math.floor(Math.random() * 360);
    const newRotation = rotation + extraSpins * 360 + randomAngle;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      // 根据最终角度判断停在哪个区域
      const normalized = newRotation % 360;
      const segment = Math.floor(normalized / 45);
      const isTruth = segment % 2 === 0;
      const pool = isTruth ? truthQuestions : dares;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setResult({ type: isTruth ? "真心话" : "大冒险", text: picked });
    }, 4200);
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
            <h1 className="text-2xl font-bold sm:text-4xl">🎡 真心话大冒险转盘</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">旋转转盘抽取题目，回答劲爆真心话或接受刺激大冒险</p>
          </div>

          {/* 转盘 */}
          <div className="relative mx-auto mb-8 h-64 w-64 sm:h-80 sm:w-80">
            {/* 指针 */}
            <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
              <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-pink-400 drop-shadow-lg" />
            </div>
            {/* 转盘本体 */}
            <svg
              ref={wheelRef}
              viewBox="0 0 200 200"
              className="wheel-spin h-full w-full drop-shadow-2xl"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {colors.map((color, i) => {
                const startAngle = i * 45;
                const endAngle = startAngle + 45;
                const startRad = (startAngle - 90) * (Math.PI / 180);
                const endRad = (endAngle - 90) * (Math.PI / 180);
                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);
                const largeArc = 0;
                return (
                  <path
                    key={i}
                    d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={color}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />
                );
              })}
              {/* 中心圆 */}
              <circle cx="100" cy="100" r="20" fill="#0f172a" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">GO</text>
            </svg>
          </div>

          {/* 结果 */}
          {result && (
            <div className="mb-6 rounded-2xl border border-pink-300/30 bg-pink-500/10 p-5 text-center fade-in-up">
              <div className={`mb-2 inline-block rounded-full px-4 py-1 text-xs font-bold ${
                result.type === "真心话" ? "bg-purple-500/30 text-purple-200" : "bg-pink-500/30 text-pink-200"
              }`}>
                {result.type}
              </div>
              <div className="text-lg font-semibold leading-relaxed sm:text-xl">{result.text}</div>
            </div>
          )}

          {/* 按钮 */}
          <div className="text-center">
            <button
              onClick={spin}
              disabled={spinning}
              className="rounded-full bg-pink-500 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50"
            >
              {spinning ? "旋转中..." : "🎯 转动转盘"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
