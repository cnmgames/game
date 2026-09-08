// @ts-nocheck
// v29 fixed import paths
"use client";
import { useState, useCallback } from "react";
import GameLayout from "../GameLayout";

const BOARD_SIZE = 16;

const events = [
  { type: "task", text: "深情对视30秒", color: "#FF375F" },
  { type: "task", text: "给对方一个拥抱", color: "#FF9500" },
  { type: "task", text: "说一句情话", color: "#BF5AF2" },
  { type: "task", text: "亲一下对方", color: "#FF2D55" },
  { type: "task", text: "捏捏对方的脸", color: "#FFD60A" },
  { type: "task", text: "摸头杀", color: "#34C759" },
  { type: "task", text: "壁咚10秒", color: "#FF375F" },
  { type: "task", text: "公主抱", color: "#BF5AF2" },
  { type: "task", text: "背后抱", color: "#FF9500" },
  { type: "task", text: "咬耳朵说悄悄话", color: "#FF2D55" },
  { type: "skip", text: "休息一回合", color: "#8E8E93" },
  { type: "forward", text: "前进2格", color: "#30D158" },
  { type: "back", text: "后退2格", color: "#FF453A" },
  { type: "task", text: "喂对方吃零食", color: "#FF9500" },
  { type: "task", text: "牵手1分钟", color: "#FF375F" },
  { type: "win", text: "到达终点！", color: "#FFD60A" },
];

export default function LoveMonopolyGame() {
  const [positions, setPositions] = useState([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<typeof events[0] | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  const rollDice = useCallback(() => {
    if (rolling || gameOver) return;
    setRolling(true);
    setCurrentEvent(null);
    let count = 0;
    const interval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const result = Math.floor(Math.random() * 6) + 1;
        setDice(result);
        movePlayer(result);
        setRolling(false);
      }
    }, 80);
  }, [rolling, gameOver, currentPlayer, positions]);

  const movePlayer = (steps: number) => {
    const playerIdx = currentPlayer - 1;
    let newPos = positions[playerIdx] + steps;
    if (newPos >= BOARD_SIZE - 1) {
      newPos = BOARD_SIZE - 1;
      setGameOver(true);
      setWinner(currentPlayer);
      setCurrentEvent(events[15]);
      setHistory([`玩家${currentPlayer} 掷出${steps}点，到达终点获胜！`, ...history]);
      return;
    }
    const newPositions = [...positions];
    newPositions[playerIdx] = newPos;
    setPositions(newPositions);
    const event = events[newPos % events.length];
    setCurrentEvent(event);
    setHistory([`玩家${currentPlayer} 掷出${steps}点：${event.text}`, ...history]);

    if (event.type === "forward") {
      setTimeout(() => {
        const np = [...newPositions];
        np[playerIdx] = Math.min(BOARD_SIZE - 1, np[playerIdx] + 2);
        setPositions(np);
        if (np[playerIdx] >= BOARD_SIZE - 1) {
          setGameOver(true);
          setWinner(currentPlayer);
        }
      }, 500);
    } else if (event.type === "back") {
      setTimeout(() => {
        const np = [...newPositions];
        np[playerIdx] = Math.max(0, np[playerIdx] - 2);
        setPositions(np);
      }, 500);
    }

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const restart = () => {
    setPositions([0, 0]);
    setCurrentPlayer(1);
    setDice(0);
    setCurrentEvent(null);
    setGameOver(false);
    setWinner(0);
    setHistory([]);
  };

  const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <GameLayout title="爱情大富翁">
      <div className="space-y-4">
        {/* 玩家状态 */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 text-center ${
            currentPlayer === 1 && !gameOver ? "bg-pink-500/20 border-2 border-pink-400/50" : "bg-pink-500/10 border border-pink-400/20"
          }`}>
            <p className="text-xs text-pink-200/70">玩家1</p>
            <p className="text-lg font-bold text-pink-200">第 {positions[0] + 1} 格</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${
            currentPlayer === 2 && !gameOver ? "bg-purple-500/20 border-2 border-purple-400/50" : "bg-purple-500/10 border border-purple-400/20"
          }`}>
            <p className="text-xs text-purple-200/70">玩家2</p>
            <p className="text-lg font-bold text-purple-200">第 {positions[1] + 1} 格</p>
          </div>
        </div>

        {/* 棋盘 */}
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: BOARD_SIZE }, (_, i) => {
            const event = events[i % events.length];
            const p1Here = positions[0] === i;
            const p2Here = positions[1] === i;
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs p-1 relative ${
                  i === BOARD_SIZE - 1 ? "bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-400/40" :
                  "bg-white/5 border border-white/10"
                }`}
                style={{ borderLeft: p1Here ? "3px solid #FF375F" : undefined, borderRight: p2Here ? "3px solid #BF5AF2" : undefined }}
              >
                <span className="text-[10px] text-white/40">{i + 1}</span>
                <span className="text-[9px] text-white/60 text-center leading-tight mt-0.5 line-clamp-2">
                  {event.text.length > 6 ? event.text.slice(0, 6) : event.text}
                </span>
                {(p1Here || p2Here) && (
                  <div className="absolute -top-1 -right-1 flex gap-0.5">
                    {p1Here && <span className="w-2.5 h-2.5 rounded-full bg-pink-500 border border-white" />}
                    {p2Here && <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 骰子和事件 */}
        <div className="text-center space-y-3">
          <div className={`text-6xl ${rolling ? "animate-bounce" : ""}`}>
            {dice > 0 ? DICE_FACES[dice - 1] : "🎲"}
          </div>
          {currentEvent && !gameOver && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 fade-in-up">
              <p className="text-sm font-semibold text-amber-200">{currentEvent.text}</p>
            </div>
          )}
          {gameOver && (
            <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-4 fade-in-up">
              <p className="text-xl font-bold text-green-200">🎉 玩家 {winner} 获胜！</p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={rollDice}
              disabled={rolling || gameOver}
              className="rounded-full px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}
            >
              {rolling ? "投掷中..." : gameOver ? "游戏结束" : `玩家${currentPlayer} 掷骰子`}
            </button>
            {gameOver && (
              <button
                onClick={restart}
                className="rounded-full px-6 py-3 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #34C759 0%, #30D158 100%)" }}
              >
                再来一局
              </button>
            )}
          </div>
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {history.slice(0, 5).map((h, i) => (
              <p key={i} className="text-xs text-white/50 bg-white/5 rounded-lg px-3 py-1.5">{h}</p>
            ))}
          </div>
        )}

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 两人轮流掷骰子，按点数前进</li>
            <li>• 停在任务格需要完成对应亲密任务</li>
            <li>• 特殊格子：前进/后退/休息</li>
            <li>• 先到达终点的人获胜</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
