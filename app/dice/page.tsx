"use client";

import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { diceActions } from "@/lib/gameData";

export default function DiceGame() {
  const [dice1, setDice1] = useState<number | null>(null);
  const [dice2, setDice2] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<typeof diceActions[0] | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setResult(null);

    let rolls = 0;
    const interval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 12) {
        clearInterval(interval);
        const v1 = Math.floor(Math.random() * 6) + 1;
        const v2 = Math.floor(Math.random() * 6) + 1;
        setDice1(v1);
        setDice2(v2);
        setIsRolling(false);

        // 两个骰子点数相加决定动作（1-12映射到6个动作）
        const actionIndex = (v1 + v2 - 2) % 6;
        const action = diceActions[actionIndex];
        setResult(action);
        setHistory((prev) => [`🎲 ${v1}+${v2}=${v1 + v2} → ${action.text}`, ...prev.slice(0, 7)]);
      }
    }, 70);
  };

  const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <GameLayout title="情趣骰子" emoji="🎲">
      <div className="flex flex-col items-center gap-8">
        {/* 骰子 */}
        <div className="flex gap-6 sm:gap-10">
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-2 border-pink-400/40 flex items-center justify-center text-6xl sm:text-7xl text-white shadow-xl shadow-pink-500/20 ${
              isRolling ? "dice-rolling" : ""
            }`}
          >
            {dice1 ? diceFaces[dice1 - 1] : "🎲"}
          </div>
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 border-2 border-purple-400/40 flex items-center justify-center text-6xl sm:text-7xl text-white shadow-xl shadow-purple-500/20 ${
              isRolling ? "dice-rolling" : ""
            }`}
            style={{ animationDelay: "0.1s" }}
          >
            {dice2 ? diceFaces[dice2 - 1] : "🎲"}
          </div>
        </div>

        {/* 点数显示 */}
        {dice1 && dice2 && !isRolling && (
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {dice1} + {dice2} = <span className="gradient-text">{dice1 + dice2}</span>
            </p>
          </div>
        )}

        {/* 按钮 */}
        <button
          onClick={rollDice}
          disabled={isRolling}
          className="btn-primary text-lg px-10 py-4 disabled:opacity-50"
        >
          {isRolling ? "掷骰中..." : "掷骰子"}
        </button>

        {/* 结果 */}
        {result && !isRolling && (
          <div className="w-full max-w-md rounded-3xl border border-pink-400/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-6 backdrop-blur-xl text-center animate-glow">
            <div className="text-5xl mb-3">{result.icon}</div>
            <h3 className="text-2xl font-bold gradient-text mb-2">{result.text}</h3>
            <p className="text-white/70">{result.desc}</p>
          </div>
        )}

        {/* 动作说明表 */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white/80 mb-3 text-center">骰子动作对照表</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {diceActions.map((action, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-2 text-center transition-all ${
                  result?.id === action.id
                    ? "bg-pink-500/30 border border-pink-400/50"
                    : "bg-white/5"
                }`}
              >
                <div className="text-2xl">{action.icon}</div>
                <div className="text-xs text-white/70 mt-1">{action.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white/80 mb-2">历史记录</h3>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {history.map((h, idx) => (
                <p key={idx} className="text-xs text-white/50">{h}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
