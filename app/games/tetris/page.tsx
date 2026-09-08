"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import GameLayout from "./GameLayout";

const COLS = 10;
const ROWS = 20;
const BLOCK = 20;

const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];

const COLORS = ["#00FFFF", "#FFFF00", "#A020F0", "#0000FF", "#FFA500", "#00FF00", "#FF0000"];

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

export default function TetrisGame() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "over">("menu");
  const [winner, setWinner] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const gameRef = useRef<any>(null);
  const keysRef = useRef<Set<string>>(new Set());

  const createPiece = () => {
    const idx = Math.floor(Math.random() * SHAPES.length);
    return { shape: SHAPES[idx].map(r => [...r]), color: COLORS[idx], x: Math.floor(COLS / 2) - 1, y: 0 };
  };

  const initGame = useCallback(() => {
    gameRef.current = {
      board1: createBoard(),
      board2: createBoard(),
      piece1: createPiece(),
      piece2: createPiece(),
      score1: 0,
      score2: 0,
      dropTimer1: 0,
      dropTimer2: 0,
      gameOver1: false,
      gameOver2: false,
    };
  }, []);

  const collide = (board: number[][], piece: any) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const nr = piece.y + r, nc = piece.x + c;
        if (nc < 0 || nc >= COLS || nr >= ROWS) return true;
        if (nr >= 0 && board[nr][nc]) return true;
      }
    }
    return false;
  };

  const merge = (board: number[][], piece: any) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] && piece.y + r >= 0) {
          board[piece.y + r][piece.x + c] = piece.color;
        }
      }
    }
  };

  const clearLines = (board: number[][]) => {
    let lines = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(c => c)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(0));
        lines++;
        r++;
      }
    }
    return lines;
  };

  const rotate = (piece: any) => {
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    return { ...piece, shape: rotated };
  };

  const drawBoard = (ctx: CanvasRenderingContext2D, board: number[][], piece: any) => {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK);
    // 网格
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
      }
    }
    // 已固定方块
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          ctx.fillStyle = board[r][c];
          ctx.fillRect(c * BLOCK + 1, r * BLOCK + 1, BLOCK - 2, BLOCK - 2);
        }
      }
    }
    // 当前方块
    if (piece) {
      ctx.fillStyle = piece.color;
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            ctx.fillRect((piece.x + c) * BLOCK + 1, (piece.y + r) * BLOCK + 1, BLOCK - 2, BLOCK - 2);
          }
        }
      }
    }
  };

  const gameLoop = useCallback(() => {
    if (!gameRef.current) return;
    const g = gameRef.current;
    const ctx1 = canvasRef1.current?.getContext("2d");
    const ctx2 = canvasRef2.current?.getContext("2d");
    if (!ctx1 || !ctx2) return;

    // 玩家1控制 (A/D/W/S)
    if (!g.gameOver1) {
      if (keysRef.current.has("a") || keysRef.current.has("A")) {
        g.piece1.x--;
        if (collide(g.board1, g.piece1)) g.piece1.x++;
      }
      if (keysRef.current.has("d") || keysRef.current.has("D")) {
        g.piece1.x++;
        if (collide(g.board1, g.piece1)) g.piece1.x--;
      }
      if (keysRef.current.has("w") || keysRef.current.has("W")) {
        const rotated = rotate(g.piece1);
        if (!collide(g.board1, rotated)) g.piece1 = rotated;
      }
      if (keysRef.current.has("s") || keysRef.current.has("S")) {
        g.piece1.y++;
        if (collide(g.board1, g.piece1)) {
          g.piece1.y--;
          merge(g.board1, g.piece1);
          const lines = clearLines(g.board1);
          g.score1 += lines * 100;
          g.piece1 = createPiece();
          if (collide(g.board1, g.piece1)) g.gameOver1 = true;
        }
      }
      // 自动下落
      g.dropTimer1++;
      if (g.dropTimer1 >= 30) {
        g.dropTimer1 = 0;
        g.piece1.y++;
        if (collide(g.board1, g.piece1)) {
          g.piece1.y--;
          merge(g.board1, g.piece1);
          const lines = clearLines(g.board1);
          g.score1 += lines * 100;
          g.piece1 = createPiece();
          if (collide(g.board1, g.piece1)) g.gameOver1 = true;
        }
      }
    }

    // 玩家2控制 (←/→/↑/↓)
    if (!g.gameOver2) {
      if (keysRef.current.has("ArrowLeft")) {
        g.piece2.x--;
        if (collide(g.board2, g.piece2)) g.piece2.x++;
      }
      if (keysRef.current.has("ArrowRight")) {
        g.piece2.x++;
        if (collide(g.board2, g.piece2)) g.piece2.x--;
      }
      if (keysRef.current.has("ArrowUp")) {
        const rotated = rotate(g.piece2);
        if (!collide(g.board2, rotated)) g.piece2 = rotated;
      }
      if (keysRef.current.has("ArrowDown")) {
        g.piece2.y++;
        if (collide(g.board2, g.piece2)) {
          g.piece2.y--;
          merge(g.board2, g.piece2);
          const lines = clearLines(g.board2);
          g.score2 += lines * 100;
          g.piece2 = createPiece();
          if (collide(g.board2, g.piece2)) g.gameOver2 = true;
        }
      }
      g.dropTimer2++;
      if (g.dropTimer2 >= 30) {
        g.dropTimer2 = 0;
        g.piece2.y++;
        if (collide(g.board2, g.piece2)) {
          g.piece2.y--;
          merge(g.board2, g.piece2);
          const lines = clearLines(g.board2);
          g.score2 += lines * 100;
          g.piece2 = createPiece();
          if (collide(g.board2, g.piece2)) g.gameOver2 = true;
        }
      }
    }

    drawBoard(ctx1, g.board1, g.gameOver1 ? null : g.piece1);
    drawBoard(ctx2, g.board2, g.gameOver2 ? null : g.piece2);
    setScores([g.score1, g.score2]);

    if (g.gameOver1 && g.gameOver2) {
      setWinner(g.score1 > g.score2 ? 1 : g.score2 > g.score1 ? 2 : 0);
      setGameState("over");
      return;
    }
    if (g.gameOver1) { setWinner(2); setGameState("over"); return; }
    if (g.gameOver2) { setWinner(1); setGameState("over"); return; }

    if (gameState === "playing") requestAnimationFrame(gameLoop);
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      initGame();
      requestAnimationFrame(gameLoop);
    }
  }, [gameState, initGame, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <GameLayout title="俄罗斯方块 · 对战">
      <div className="space-y-4">
        {/* 比分 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-pink-500/10 border border-pink-400/30 p-2 text-center">
            <p className="text-xs text-pink-200/70">玩家1 (WASD)</p>
            <p className="text-xl font-bold text-pink-200">{scores[0]}</p>
          </div>
          <div className="rounded-xl bg-purple-500/10 border border-purple-400/30 p-2 text-center">
            <p className="text-xs text-purple-200/70">玩家2 (方向键)</p>
            <p className="text-xl font-bold text-purple-200">{scores[1]}</p>
          </div>
        </div>

        {/* 游戏区 */}
        <div className="flex justify-center gap-4 relative">
          <div className="relative">
            <canvas ref={canvasRef1} width={COLS * BLOCK} height={ROWS * BLOCK} className="rounded-lg border border-pink-400/30" />
            {gameState !== "playing" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                {gameState === "menu" && <span className="text-pink-200 text-sm">等待开始</span>}
                {gameState === "over" && winner === 2 && <span className="text-red-300 text-sm font-bold">失败</span>}
                {gameState === "over" && winner === 1 && <span className="text-green-300 text-sm font-bold">胜利</span>}
              </div>
            )}
          </div>
          <div className="relative">
            <canvas ref={canvasRef2} width={COLS * BLOCK} height={ROWS * BLOCK} className="rounded-lg border border-purple-400/30" />
            {gameState !== "playing" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                {gameState === "menu" && <span className="text-purple-200 text-sm">等待开始</span>}
                {gameState === "over" && winner === 1 && <span className="text-red-300 text-sm font-bold">失败</span>}
                {gameState === "over" && winner === 2 && <span className="text-green-300 text-sm font-bold">胜利</span>}
              </div>
            )}
          </div>
        </div>

        {/* 菜单/结束 */}
        {gameState !== "playing" && (
          <div className="text-center space-y-3">
            {gameState === "over" && (
              <p className="text-lg font-bold text-white">
                {winner === 0 ? "平局！" : `玩家 ${winner} 获胜！`}
              </p>
            )}
            <button
              onClick={() => setGameState("playing")}
              className="rounded-full px-8 py-3 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}
            >
              {gameState === "menu" ? "开始游戏" : "再来一局"}
            </button>
          </div>
        )}

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 左右分屏对战，各自玩俄罗斯方块</li>
            <li>• 玩家1：W旋转，A/D移动，S加速</li>
            <li>• 玩家2：↑旋转，←/→移动，↓加速</li>
            <li>• 先堆到顶部的人输，得分高者获胜</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
