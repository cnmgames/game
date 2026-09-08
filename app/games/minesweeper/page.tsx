"use client";
import { useState, useEffect, useCallback } from "react";
import GameLayout from "../GameLayout";

const ROWS = 8;
const COLS = 8;
const MINES = 10;

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

export default function MinesweeperGame() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flags, setFlags] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [firstClick, setFirstClick] = useState(true);

  const initGrid = useCallback(() => {
    const newGrid: Cell[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0,
      }))
    );
    return newGrid;
  }, []);

  const placeMines = (g: Cell[][], safeRow: number, safeCol: number) => {
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
      if (!g[r][c].mine) {
        g[r][c].mine = true;
        placed++;
      }
    }
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (g[r][c].mine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && g[nr][nc].mine) count++;
          }
        }
        g[r][c].adjacent = count;
      }
    }
  };

  const revealCell = (g: Cell[][], r: number, c: number) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (g[r][c].revealed || g[r][c].flagged) return;
    g[r][c].revealed = true;
    if (g[r][c].adjacent === 0 && !g[r][c].mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(g, r + dr, c + dc);
        }
      }
    }
  };

  const checkWin = (g: Cell[][]) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!g[r][c].mine && !g[r][c].revealed) return false;
      }
    }
    return true;
  };

  const handleClick = (r: number, c: number) => {
    if (gameOver || grid[r][c].flagged || grid[r][c].revealed) return;
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    if (firstClick) {
      placeMines(newGrid, r, c);
      setFirstClick(false);
    }
    if (newGrid[r][c].mine) {
      newGrid.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true; }));
      setGrid(newGrid);
      setGameOver(true);
      setWon(false);
      return;
    }
    revealCell(newGrid, r, c);
    setGrid(newGrid);
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    if (checkWin(newGrid)) {
      setGameOver(true);
      setWon(true);
    }
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || grid[r][c].revealed) return;
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    newGrid[r][c].flagged = !newGrid[r][c].flagged;
    setGrid(newGrid);
    setFlags(f => f + (newGrid[r][c].flagged ? 1 : -1));
  };

  const restart = () => {
    setGrid(initGrid());
    setGameOver(false);
    setWon(false);
    setFlags(0);
    setCurrentPlayer(1);
    setFirstClick(true);
  };

  useEffect(() => {
    setGrid(initGrid());
  }, [initGrid]);

  const getNumberColor = (n: number) => {
    const colors = ["", "#0A84FF", "#34C759", "#FF9500", "#FF3B30", "#BF5AF2", "#5E5CE6", "#FF2D55", "#8E8E93"];
    return colors[n] || "#fff";
  };

  return (
    <GameLayout title="扫雷 · 合作">
      <div className="space-y-4">
        {/* 状态栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400">💣</span>
            <span className="text-white font-bold">{MINES - flags}</span>
          </div>
          <div className={`text-sm font-semibold ${
            currentPlayer === 1 ? "text-pink-200" : "text-purple-200"
          }`}>
            玩家 {currentPlayer} 回合
          </div>
          <button
            onClick={restart}
            className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/20 transition"
          >
            重开
          </button>
        </div>

        {/* 游戏结束 */}
        {gameOver && (
          <div className={`text-center rounded-xl p-4 fade-in-up ${
            won ? "bg-green-500/20 border border-green-400/40" : "bg-red-500/20 border border-red-400/40"
          }`}>
            <p className={`text-lg font-bold ${won ? "text-green-200" : "text-red-200"}`}>
              {won ? "🎉 合作成功！全部排除！" : "💥 踩到地雷了！"}
            </p>
            <button
              onClick={restart}
              className="mt-2 rounded-full px-6 py-2 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #34C759 0%, #30D158 100%)" }}
            >
              再来一局
            </button>
          </div>
        )}

        {/* 雷区 */}
        <div className="flex justify-center">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={(e) => handleRightClick(e, r, c)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded text-sm sm:text-base font-bold flex items-center justify-center transition-all ${
                    cell.revealed
                      ? cell.mine
                        ? "bg-red-500/40 border border-red-400/50"
                        : "bg-white/10 border border-white/20"
                      : "bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 hover:from-pink-500/30 hover:to-purple-500/30 active:scale-95"
                  }`}
                  style={cell.revealed && !cell.mine && cell.adjacent > 0 ? { color: getNumberColor(cell.adjacent) } : {}}
                >
                  {cell.revealed
                    ? cell.mine ? "💣" : cell.adjacent > 0 ? cell.adjacent : ""
                    : cell.flagged ? "🚩" : ""}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 两人合作轮流点击格子</li>
            <li>• 数字表示周围8格的地雷数量</li>
            <li>• 长按/右键标记地雷</li>
            <li>• 翻开所有安全格子即获胜</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
