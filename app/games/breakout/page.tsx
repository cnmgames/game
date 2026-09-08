// @ts-nocheck
// v34 mobile-friendly couple game
"use client";
import { useState, useCallback } from "react";
import GameLayout from "../GameLayout";

const ICONS = ["❤️", "💕", "💖", "💗", "💓", "💝", "🌹", "💋"];
const ROWS = 8;
const COLS = 6;

const generateBoard = () => {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ICONS[Math.floor(Math.random() * ICONS.length)])
  );
};

export default function BreakoutGame() {
  const [board, setBoard] = useState<string[][]>(generateBoard);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [lastClear, setLastClear] = useState(0);

  const findConnected = (b: string[][], r: number, c: number, icon: string, visited: Set<string>) => {
    const key = `${r},${c}`;
    if (visited.has(key)) return;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (b[r][c] !== icon) return;
    visited.add(key);
    findConnected(b, r - 1, c, icon, visited);
    findConnected(b, r + 1, c, icon, visited);
    findConnected(b, r, c - 1, icon, visited);
    findConnected(b, r, c + 1, icon, visited);
  };

  const handleClick = (r: number, c: number) => {
    if (gameOver || !board[r][c]) return;
    const icon = board[r][c];
    const visited = new Set<string>();
    findConnected(board, r, c, icon, visited);

    if (visited.size < 2) {
      setSelected({ r, c });
      return;
    }

    const newBoard = board.map(row => [...row]);
    visited.forEach(key => {
      const [br, bc] = key.split(",").map(Number);
      newBoard[br][bc] = "";
    });

    for (let col = 0; col < COLS; col++) {
      const column = [];
      for (let row = ROWS - 1; row >= 0; row--) {
        if (newBoard[row][col]) column.push(newBoard[row][col]);
      }
      for (let row = ROWS - 1; row >= 0; row--) {
        newBoard[row][col] = column[ROWS - 1 - row] || "";
      }
    }

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!newBoard[row][col]) {
          newBoard[row][col] = ICONS[Math.floor(Math.random() * ICONS.length)];
        }
      }
    }

    setBoard(newBoard);
    const points = visited.size * 10;
    setLastClear(visited.size);
    if (currentPlayer === 1) setScore1(s => s + points);
    else setScore2(s => s + points);

    if (round >= 20) {
      setGameOver(true);
    } else {
      setRound(r => r + 1);
      setCurrentPlayer(p => p === 1 ? 2 : 1);
    }
    setSelected(null);
  };

  const restart = useCallback(() => {
    setBoard(generateBoard());
    setCurrentPlayer(1);
    setScore1(0);
    setScore2(0);
    setSelected(null);
    setGameOver(false);
    setRound(1);
    setLastClear(0);
  }, []);

  const winner = score1 > score2 ? 1 : score2 > score1 ? 2 : 0;

  return (
    <GameLayout title="情侣消消乐">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 text-center ${currentPlayer === 1 && !gameOver ? "bg-pink-500/20 border-2 border-pink-400/50" : "bg-pink-500/10 border border-pink-400/20"}`}>
            <p className="text-xs text-pink-200/70">玩家1</p>
            <p className="text-2xl font-bold text-pink-200">{score1}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${currentPlayer === 2 && !gameOver ? "bg-purple-500/20 border-2 border-purple-400/50" : "bg-purple-500/10 border border-purple-400/20"}`}>
            <p className="text-xs text-purple-200/70">玩家2</p>
            <p className="text-2xl font-bold text-purple-200">{score2}</p>
          </div>
        </div>

        <div className="text-center text-xs text-white/50">第 {round}/20 回合 {lastClear > 0 && `· 消除 ${lastClear} 个`}</div>

        {gameOver && (
          <div className="text-center space-y-3 rounded-xl border border-green-400/30 bg-green-500/10 p-6 fade-in-up">
            <h2 className="text-xl font-bold text-white">{winner === 0 ? "平局！" : `玩家 ${winner} 获胜！`}</h2>
            <p className="text-white/60">最终比分 {score1} : {score2}</p>
            <p className="text-sm text-pink-200">输的人要接受甜蜜惩罚哦~</p>
            <button onClick={restart} className="rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}>
              再来一局
            </button>
          </div>
        )}

        {!gameOver && (
          <div className="flex justify-center">
            <div className="grid gap-1 p-2 rounded-xl bg-white/5 border border-white/10" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
              {board.map((row, r) =>
                row.map((icon, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleClick(r, c)}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg text-xl flex items-center justify-center transition-all active:scale-90 ${
                      selected?.r === r && selected?.c === c ? "bg-pink-500/30 ring-2 ring-pink-400" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {icon}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 两人轮流点击，消除2个以上相连的相同图案</li>
            <li>• 消除越多得分越高，单个无法消除</li>
            <li>• 20回合后得分高者获胜，输的接受惩罚</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
