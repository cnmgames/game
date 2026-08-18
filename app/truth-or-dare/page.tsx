"use client";

import { useState, useRef } from "react";
import GameLayout from "@/components/GameLayout";
import { truthQuestions, dareChallenges } from "@/lib/gameData";

// 转盘扇区配置
const wheelSegments = [
  { label: "真心话", color: "#ec4899", type: "truth" },
  { label: "大冒险", color: "#8b5cf6", type: "dare" },
  { label: "真心话", color: "#f472b6", type: "truth" },
  { label: "大冒险", color: "#a78bfa", type: "dare" },
  { label: "真心话", color: "#db2777", type: "truth" },
  { label: "大冒险", color: "#7c3aed", type: "dare" },
  { label: "真心话", color: "#f9a8d4", type: "truth" },
  { label: "大冒险", color: "#c4b5fd", type: "dare" },
];

export default function TruthOrDareGame() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ type: string; text: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowResult(false);

    // 随机选择结果
    const segmentIndex = Math.floor(Math.random() * wheelSegments.length);
    const segment = wheelSegments[segmentIndex];
    const segmentAngle = 360 / wheelSegments.length;
    const targetAngle = segmentIndex * segmentAngle + segmentAngle / 2;

    // 计算最终旋转角度（至少转5圈）
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + spins * 360 + (360 - targetAngle);
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const text =
        segment.type === "truth"
          ? truthQuestions[Math.floor(Math.random() * truthQuestions.length)]
          : dareChallenges[Math.floor(Math.random() * dareChallenges.length)];
      setResult({ type: segment.type, text });
      setShowResult(true);
    }, 4000);
  };

  // 生成转盘SVG
  const generateWheelSVG = () => {
    const cx = 150;
    const cy = 150;
    const r = 145;
    const segmentAngle = (2 * Math.PI) / wheelSegments.length;

    return wheelSegments.map((seg, i) => {
      const startAngle = i * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = segmentAngle > Math.PI ? 1 : 0;
      const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      // 文字位置
      const textAngle = startAngle + segmentAngle / 2;
      const textX = cx + (r * 0.65) * Math.cos(textAngle);
      const textY = cy + (r * 0.65) * Math.sin(textAngle);

      return (
        <g key={i}>
          <path d={pathD} fill={seg.color} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text
            x={textX}
            y={textY}
            fill="white"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${(textAngle * 180) / Math.PI + 90}, ${textX}, ${textY})`}
          >
            {seg.label}
          </text>
        </g>
      );
    });
  };

  return (
    <GameLayout title="真心话大冒险" emoji="🎡">
      <div className="flex flex-col items-center gap-8">
        {/* 转盘 */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          {/* 指针 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-pink-500 drop-shadow-lg" />
          </div>

          {/* 转盘 */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {generateWheelSVG()}
              <circle cx="150" cy="150" r="20" fill="#18181b" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <text x="150" y="155" fill="#ec4899" fontSize="16" fontWeight="bold" textAnchor="middle">
                🎯
              </text>
            </svg>
          </div>
        </div>

        {/* 按钮 */}
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="btn-primary text-lg px-8 py-4 disabled:opacity-50"
        >
          {isSpinning ? "旋转中..." : "开始旋转"}
        </button>

        {/* 结果弹窗 */}
        {showResult && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowResult(false)}>
            <div
              className="max-w-md w-full rounded-3xl border border-pink-400/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">
                  {result.type === "truth" ? "💭" : "🎯"}
                </div>
                <h3 className={`text-xl font-bold mb-4 ${result.type === "truth" ? "text-pink-300" : "text-purple-300"}`}>
                  {result.type === "truth" ? "真心话" : "大冒险"}
                </h3>
                <p className="text-white text-lg leading-relaxed mb-6">{result.text}</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowResult(false)} className="btn-secondary flex-1">
                    完成
                  </button>
                  <button
                    onClick={() => {
                      setShowResult(false);
                      setTimeout(spinWheel, 300);
                    }}
                    className="btn-primary flex-1"
                  >
                    再来一次
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl text-center">
          <p className="text-sm text-white/60">
            点击旋转按钮，转盘停止后根据指针指向执行对应的真心话或大冒险
          </p>
        </div>
      </div>
    </GameLayout>
  );
}
