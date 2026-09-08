// @ts-nocheck
// v29 fixed import paths
"use client";
import { useState, useCallback } from "react";
import GameLayout from "../GameLayout";

const SIZE = 15;

export default function GomokuGame() {
  const [board, setBoard] = useState<number[][]>(() =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  );
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(0);
  const [lastMove, setLastMove] = useState<{ r: number; c: number } | null>(null);
  const [history, setHistory] = useState<{ r: number; c: number; player: number }[]>([]);

  const checkWin = (b: number[][], r: number, c: number, player: number) => {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of dirs) {
      let count = 1;
      for (let i = 1; i < 5; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || b[nr][nc] !== player) break;
        count++;
      }
      for (let i = 1; i < 5; i++) {
        const nr = r - dr * i, nc = c - dc * i;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || b[nr][nc] !== player) break;
        count++;
      }
      if (count >= 5) return true;
    }
    return false;
  };

  const placeStone = (r: number, c: number) => {
    if (winner || board[r][c] !== 0) return;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = currentPlayer;
    setBoard(newBoard);
    setLastMove({ r, c });
    setHistory([...history, { r, c, player: currentPlayer }]);
    if (checkWin(newBoard, r, c, currentPlayer)) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const undo = () => {
    if (history.length === 0 || winner) return;
    const last = history[history.length - 1];
    const newBoard = board.map(row => [...row]);
    newBoard[last.r][last.c] = 0;
    setBoard(newBoard);
    setHistory(history.slice(0, -1));
    setCurrentPlayer(last.player);
    setLastMove(history.length > 1 ? { r: history[history.length - 2].r, c: history[history.length - 2].c } : null);
  };

  const restart = useCallback(() => {
    setBoard(Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
    setCurrentPlayer(1);
    setWinner(0);
    setLastMove(null);
    setHistory([]);
  }, []);

  return (
    <GameLayout title="五子棋 · 对战">
      <div className="space-y-4">
        {/* 状态栏 */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            currentPlayer === 1 ? "bg-pink-500/20 text-pink-200 border border-pink-400/40" : "bg-purple-500/20 text-purple-200 border border-purple-400/40"
          }`}>
            <span className={`w-4 h-4 rounded-full ${currentPlayer === 1 ? "bg-pink-400" : "bg-purple-400"}`} />
            {winner ? `玩家 ${winner} 获胜！` : `玩家 ${currentPlayer} 回合`}
          </div>
          <div className="flex gap-2">
            <button onClick={undo} disabled={history.length === 0 || !!winner} className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/20 transition disabled:opacity-40">
              悔棋
            </button>
            <button onClick={restart} className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/20 transition">
              重开
            </button>
          </div>
        </div>

        {/* 棋盘 */}
        <div className="flex justify-center">
          <div className="relative bg-amber-900/30 rounded-lg p-2 border border-amber-700/30">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => placeStone(r, c)}
                    className="w-5 h-5 sm:w-6 sm:h-6 relative flex items-center justify-center"
                  >
                    {/* 棋盘线 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-full h-px bg-amber-700/40" />
                      <div className="absolute h-full w-px bg-amber-700/40" />
                    </div>
                    {/* 星位 */}
                    {[3, 7, 11].includes(r) && [3, 7, 11].includes(c) && (
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-700/60" />
                    )}
                    {/* 棋子 */}
                    {cell !== 0 && (
                      <div className={`relative z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-lg ${
                        cell === 1
                          ? "bg-gradient-to-br from-gray-700 to-black border border-gray-600"
                          : "bg-gradient-to-br from-white to-gray-200 border border-gray-300"
                      } ${lastMove?.r === r && lastMove?.c === c ? "ring-2 ring-red-500 ring-offset-1 ring-offset-amber-900/30" : ""}`} />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 获胜提示 */}
        {winner > 0 && (
          <div className="text-center rounded-xl border border-green-400/30 bg-green-500/10 p-4 fade-in-up">
            <p className="text-lg font-bold text-green-200">🎉 玩家 {winner} 五子连珠，获胜！</p>
            <button onClick={restart} className="mt-2 rounded-full px-6 py-2 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #34C759 0%, #30D158 100%)" }}>
              再来一局
            </button>
          </div>
        )}

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 玩家1执黑，玩家2执白，轮流落子</li>
            <li>• 横、竖、斜任意方向连成5子获胜</li>
            <li>• 红圈标记最后一手棋</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
