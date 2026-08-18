"use client";

import { useState, useCallback } from "react";
import GameLayout from "@/components/GameLayout";
import { ludoEvents } from "@/lib/gameData";

// 飞行棋棋盘 - 简化版，24个格子围成一圈
const BOARD_SIZE = 24;
const PLAYER_COLORS = [
  { name: "玩家1", color: "bg-pink-500", ring: "ring-pink-400" },
  { name: "玩家2", color: "bg-sky-500", ring: "ring-sky-400" },
];

export default function LudoGame() {
  const [positions, setPositions] = useState([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<typeof ludoEvents[0] | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [gameLog, setGameLog] = useState<string[]>([]);

  const rollDice = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    setShowEvent(false);

    // 骰子滚动动画
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);

        // 移动棋子
        setPositions((prev) => {
          const newPositions = [...prev];
          newPositions[currentPlayer] = (newPositions[currentPlayer] + finalValue) % BOARD_SIZE;
          return newPositions;
        });

        // 触发事件
        const eventIndex = (positions[currentPlayer] + finalValue) % BOARD_SIZE;
        const event = ludoEvents[eventIndex % ludoEvents.length];
        setTimeout(() => {
          setCurrentEvent(event);
          setShowEvent(true);
          setGameLog((prev) => [
            `${PLAYER_COLORS[currentPlayer].name} 掷出 ${finalValue} 点，触发：${event.text}`,
            ...prev.slice(0, 9),
          ]);
        }, 300);

        // 切换玩家（掷出6可再掷一次）
        if (finalValue !== 6) {
          setCurrentPlayer((prev) => (prev + 1) % 2);
        }
      }
    }, 80);
  }, [isRolling, currentPlayer, positions]);

  const resetGame = () => {
    setPositions([0, 0]);
    setCurrentPlayer(0);
    setDiceValue(null);
    setCurrentEvent(null);
    setShowEvent(false);
    setGameLog([]);
  };

  // 渲染棋盘格子
  const renderBoard = () => {
    const cells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const playersHere = positions
        .map((p, idx) => (p === i ? idx : -1))
        .filter((p) => p >= 0);

      cells.push(
        <div
          key={i}
          className={`relative aspect-square rounded-lg border flex items-center justify-center text-xs font-medium transition-all duration-300 ${
            i === 0
              ? "bg-pink-500/30 border-pink-400/50"
              : "bg-white/5 border-white/10"
          }`}
        >
          <span className="text-white/40">{i + 1}</span>
          {playersHere.length > 0 && (
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              {playersHere.map((pIdx) => (
                <div
                  key={pIdx}
                  className={`w-3 h-3 rounded-full ${PLAYER_COLORS[pIdx].color} ring-2 ring-white/50`}
                />
              ))}
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <GameLayout title="情侣飞行棋" emoji="✈️">
      <div className="space-y-6">
        {/* 玩家状态 */}
        <div className="grid grid-cols-2 gap-3">
          {PLAYER_COLORS.map((player, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-4 backdrop-blur-xl transition-all ${
                currentPlayer === idx
                  ? `${player.color}/20 border-${player.color === "bg-pink-500" ? "pink" : "sky"}-400/50 ring-2 ring-${player.color === "bg-pink-500" ? "pink" : "sky"}-400/30`
                  : "bg-white/5 border-white/10"
              }`}
              style={{
                background: currentPlayer === idx ? (idx === 0 ? "rgba(236,72,153,0.15)" : "rgba(14,165,233,0.15)") : undefined,
                borderColor: currentPlayer === idx ? (idx === 0 ? "rgba(236,72,153,0.4)" : "rgba(14,165,233,0.4)") : undefined,
              }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${player.color}`} />
                <span className="font-semibold text-white">{player.name}</span>
                {currentPlayer === idx && (
                  <span className="text-xs text-pink-300 animate-pulse">行动中</span>
                )}
              </div>
              <p className="text-sm text-white/60 mt-1">位置：第 {positions[idx] + 1} 格</p>
            </div>
          ))}
        </div>

        {/* 棋盘 */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {renderBoard()}
          </div>
        </div>

        {/* 骰子和控制 */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl font-bold text-white shadow-lg ${
              isRolling ? "dice-rolling" : ""
            }`}
          >
            {diceValue ? ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][diceValue - 1] : "🎲"}
          </div>

          <div className="flex gap-3">
            <button
              onClick={rollDice}
              disabled={isRolling}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRolling ? "掷骰中..." : "掷骰子"}
            </button>
            <button onClick={resetGame} className="btn-secondary">
              重新开始
            </button>
          </div>
        </div>

        {/* 事件弹窗 */}
        {showEvent && currentEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowEvent(false)}>
            <div
              className="max-w-md w-full rounded-3xl border border-pink-400/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">
                  {currentEvent.type === "truth" ? "💭" : currentEvent.type === "dare" ? "🎯" : "💕"}
                </div>
                <h3 className="text-lg font-semibold text-pink-300 mb-3">
                  {currentEvent.type === "truth" ? "真心话" : currentEvent.type === "dare" ? "大冒险" : "甜蜜时刻"}
                </h3>
                <p className="text-white text-lg leading-relaxed mb-6">{currentEvent.text}</p>
                <button onClick={() => setShowEvent(false)} className="btn-primary w-full">
                  完成 ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 游戏日志 */}
        {gameLog.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white/80 mb-2">游戏记录</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {gameLog.map((log, idx) => (
                <p key={idx} className="text-xs text-white/50">{log}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
