"use client";

import { useState } from "react";
import GameLayout from "@/components/GameLayout";
import { monopolyEvents, truthQuestions, dareChallenges } from "@/lib/gameData";

const BOARD_SIZE = 16;

export default function MonopolyGame() {
  const [positions, setPositions] = useState([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<typeof monopolyEvents[0] | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [eventDetail, setEventDetail] = useState<string>("");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);

  const rollDice = () => {
    if (isRolling || gameOver) return;
    setIsRolling(true);
    setShowEvent(false);

    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);

        // 移动
        const newPos = (positions[currentPlayer] + finalValue) % BOARD_SIZE;
        const newPositions = [...positions];
        newPositions[currentPlayer] = newPos;
        setPositions(newPositions);

        // 触发事件
        const event = monopolyEvents[newPos];
        setTimeout(() => {
          setCurrentEvent(event);
          setShowEvent(true);

          // 处理事件效果
          if (event.effect === "truth") {
            setEventDetail(truthQuestions[Math.floor(Math.random() * truthQuestions.length)]);
          } else if (event.effect === "dare") {
            setEventDetail(dareChallenges[Math.floor(Math.random() * dareChallenges.length)]);
          } else if (event.effect === "win") {
            setGameOver(true);
            setWinner(currentPlayer);
            setEventDetail("恭喜到达终点！你可以向对方许一个愿望！");
          } else {
            setEventDetail(event.text);
          }

          // 处理前进/后退
          if (event.effect.startsWith("+")) {
            const steps = parseInt(event.effect);
            setTimeout(() => {
              setPositions((prev) => {
                const updated = [...prev];
                updated[currentPlayer] = (updated[currentPlayer] + steps) % BOARD_SIZE;
                return updated;
              });
            }, 500);
          } else if (event.effect.startsWith("-")) {
            const steps = parseInt(event.effect);
            setTimeout(() => {
              setPositions((prev) => {
                const updated = [...prev];
                updated[currentPlayer] = (updated[currentPlayer] - steps + BOARD_SIZE) % BOARD_SIZE;
                return updated;
              });
            }, 500);
          }
        }, 300);

        // 切换玩家
        if (finalValue !== 6 && event.effect !== "win") {
          setTimeout(() => {
            setCurrentPlayer((prev) => (prev + 1) % 2);
          }, 800);
        }
      }
    }, 80);
  };

  const resetGame = () => {
    setPositions([0, 0]);
    setCurrentPlayer(0);
    setDiceValue(null);
    setCurrentEvent(null);
    setShowEvent(false);
    setEventDetail("");
    setGameOver(false);
    setWinner(null);
  };

  const playerColors = [
    { color: "bg-pink-500", ring: "ring-pink-400", text: "text-pink-300" },
    { color: "bg-sky-500", ring: "ring-sky-400", text: "text-sky-300" },
  ];

  const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <GameLayout title="午夜大富翁" emoji="💎">
      <div className="space-y-6">
        {/* 玩家状态 */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((p) => (
            <div
              key={p}
              className="rounded-2xl border p-4 backdrop-blur-xl transition-all"
              style={{
                background: currentPlayer === p && !gameOver ? (p === 0 ? "rgba(236,72,153,0.15)" : "rgba(14,165,233,0.15)") : "rgba(255,255,255,0.05)",
                borderColor: currentPlayer === p && !gameOver ? (p === 0 ? "rgba(236,72,153,0.4)" : "rgba(14,165,233,0.4)") : "rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${playerColors[p].color}`} />
                <span className="font-semibold text-white">玩家{p + 1}</span>
                {currentPlayer === p && !gameOver && (
                  <span className={`text-xs ${playerColors[p].text} animate-pulse`}>行动中</span>
                )}
              </div>
              <p className="text-sm text-white/60 mt-1">位置：第 {positions[p] + 1} 格</p>
            </div>
          ))}
        </div>

        {/* 棋盘 */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {monopolyEvents.map((event, idx) => {
              const playersHere = positions
                .map((p, pi) => (p === idx ? pi : -1))
                .filter((p) => p >= 0);

              return (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center p-1 text-center transition-all ${
                    idx === 0
                      ? "bg-green-500/20 border-green-400/50"
                      : idx === BOARD_SIZE - 1
                      ? "bg-yellow-500/20 border-yellow-400/50"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <span className="text-[10px] text-white/40 absolute top-1 left-1">{idx + 1}</span>
                  <span className="text-lg sm:text-xl">
                    {event.type === "forward" ? "⬆️" : event.type === "back" ? "⬇️" : "💕"}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-white/60 leading-tight mt-1 line-clamp-2">
                    {event.text}
                  </span>
                  {playersHere.length > 0 && (
                    <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                      {playersHere.map((pi) => (
                        <div
                          key={pi}
                          className={`w-3 h-3 rounded-full ${playerColors[pi].color} ring-2 ring-white/50`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 骰子和控制 */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl font-bold text-white shadow-lg ${
              isRolling ? "dice-rolling" : ""
            }`}
          >
            {diceValue ? diceFaces[diceValue - 1] : "🎲"}
          </div>

          <div className="flex gap-3">
            <button
              onClick={rollDice}
              disabled={isRolling || gameOver}
              className="btn-primary disabled:opacity-50"
            >
              {isRolling ? "掷骰中..." : gameOver ? "游戏结束" : "掷骰子"}
            </button>
            <button onClick={resetGame} className="btn-secondary">
              重新开始
            </button>
          </div>
        </div>

        {/* 事件弹窗 */}
        {showEvent && currentEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowEvent(false)}>
            <div className="max-w-md w-full rounded-3xl border border-pink-400/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="text-5xl mb-4">
                  {currentEvent.type === "forward" ? "⬆️" : currentEvent.type === "back" ? "⬇️" : "💕"}
                </div>
                <h3 className="text-lg font-semibold text-pink-300 mb-3">
                  第 {positions[currentPlayer] + 1} 格
                </h3>
                <p className="text-white text-lg leading-relaxed mb-2">{currentEvent.text}</p>
                {eventDetail && eventDetail !== currentEvent.text && (
                  <p className="text-pink-200 text-base leading-relaxed mb-4 mt-4 p-3 rounded-xl bg-pink-500/10">
                    {eventDetail}
                  </p>
                )}
                <button onClick={() => setShowEvent(false)} className="btn-primary w-full mt-4">
                  继续 ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 游戏结束 */}
        {gameOver && winner !== null && (
          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-center backdrop-blur-xl">
            <p className="text-lg font-semibold text-white">
              🎉 玩家{winner + 1} 到达终点，获得胜利！
            </p>
          </div>
        )}

        {/* 规则 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white/80 mb-2">游戏规则</h3>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• 两人轮流掷骰子，根据点数移动棋子</li>
            <li>• 停在不同格子触发对应事件（前进/后退/互动任务）</li>
            <li>• 掷出6点可再掷一次</li>
            <li>• 先到达终点（第16格）者获胜，可向对方许一个愿望</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
