"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import GameLayout from "./GameLayout";

const CANVAS_W = 360;
const CANVAS_H = 500;
const PADDLE_W = 60;
const PADDLE_H = 10;
const BALL_R = 6;
const BRICK_ROWS = 4;
const BRICK_COLS = 8;
const BRICK_W = 40;
const BRICK_H = 15;
const BRICK_GAP = 4;

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "over">("menu");
  const [winner, setWinner] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const gameRef = useRef<any>(null);
  const keysRef = useRef<Set<string>>(new Set());

  const initGame = useCallback(() => {
    const bricks1 = Array.from({ length: BRICK_ROWS }, (_, r) =>
      Array.from({ length: BRICK_COLS }, (_, c) => ({
        x: c * (BRICK_W + BRICK_GAP) + (CANVAS_W - BRICK_COLS * (BRICK_W + BRICK_GAP)) / 2,
        y: r * (BRICK_H + BRICK_GAP) + 40,
        alive: true,
        color: `hsl(${330 + r * 15}, 80%, 60%)`,
      }))
    );
    const bricks2 = Array.from({ length: BRICK_ROWS }, (_, r) =>
      Array.from({ length: BRICK_COLS }, (_, c) => ({
        x: c * (BRICK_W + BRICK_GAP) + (CANVAS_W - BRICK_COLS * (BRICK_W + BRICK_GAP)) / 2,
        y: CANVAS_H - 40 - (r + 1) * (BRICK_H + BRICK_GAP),
        alive: true,
        color: `hsl(${260 + r * 15}, 80%, 60%)`,
      }))
    );
    gameRef.current = {
      ball1: { x: CANVAS_W / 2, y: CANVAS_H / 2 - 50, dx: 3, dy: -3 },
      ball2: { x: CANVAS_W / 2, y: CANVAS_H / 2 + 50, dx: -3, dy: 3 },
      paddle1: { x: CANVAS_W / 2 - PADDLE_W / 2, y: 10 },
      paddle2: { x: CANVAS_W / 2 - PADDLE_W / 2, y: CANVAS_H - PADDLE_H - 10 },
      bricks1,
      bricks2,
      lives1: 3,
      lives2: 3,
      score1: 0,
      score2: 0,
    };
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = gameRef.current;

    // 移动挡板
    if (keysRef.current.has("a") || keysRef.current.has("A")) g.paddle1.x -= 6;
    if (keysRef.current.has("d") || keysRef.current.has("D")) g.paddle1.x += 6;
    if (keysRef.current.has("ArrowLeft")) g.paddle2.x -= 6;
    if (keysRef.current.has("ArrowRight")) g.paddle2.x += 6;
    g.paddle1.x = Math.max(0, Math.min(CANVAS_W - PADDLE_W, g.paddle1.x));
    g.paddle2.x = Math.max(0, Math.min(CANVAS_W - PADDLE_W, g.paddle2.x));

    // 更新球
    const updateBall = (ball: any, paddle: any, bricks: any[], isTop: boolean) => {
      ball.x += ball.dx;
      ball.y += ball.dy;
      if (ball.x < BALL_R || ball.x > CANVAS_W - BALL_R) ball.dx *= -1;
      // 挡板碰撞
      if (isTop && ball.y - BALL_R < paddle.y + PADDLE_H && ball.y - BALL_R > paddle.y &&
          ball.x > paddle.x && ball.x < paddle.x + PADDLE_W && ball.dy < 0) {
        ball.dy *= -1;
        ball.dx += (ball.x - (paddle.x + PADDLE_W / 2)) / 10;
      }
      if (!isTop && ball.y + BALL_R > paddle.y && ball.y + BALL_R < paddle.y + PADDLE_H &&
          ball.x > paddle.x && ball.x < paddle.x + PADDLE_W && ball.dy > 0) {
        ball.dy *= -1;
        ball.dx += (ball.x - (paddle.x + PADDLE_W / 2)) / 10;
      }
      // 砖块碰撞
      for (const row of bricks) {
        for (const brick of row) {
          if (!brick.alive) continue;
          if (ball.x > brick.x && ball.x < brick.x + BRICK_W &&
              ball.y > brick.y && ball.y < brick.y + BRICK_H) {
            brick.alive = false;
            ball.dy *= -1;
            if (isTop) g.score1 += 10;
            else g.score2 += 10;
          }
        }
      }
      // 出界
      if (isTop && ball.y < 0) {
        g.lives1--;
        ball.x = CANVAS_W / 2;
        ball.y = CANVAS_H / 2 - 50;
        ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -3;
      }
      if (!isTop && ball.y > CANVAS_H) {
        g.lives2--;
        ball.x = CANVAS_W / 2;
        ball.y = CANVAS_H / 2 + 50;
        ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = 3;
      }
    };

    updateBall(g.ball1, g.paddle1, g.bricks1, true);
    updateBall(g.ball2, g.paddle2, g.bricks2, false);

    // 绘制
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 中线
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H / 2);
    ctx.lineTo(CANVAS_W, CANVAS_H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 砖块
    const drawBricks = (bricks: any[]) => {
      for (const row of bricks) {
        for (const brick of row) {
          if (!brick.alive) continue;
          ctx.fillStyle = brick.color;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, BRICK_W, BRICK_H, 3);
          ctx.fill();
        }
      }
    };
    drawBricks(g.bricks1);
    drawBricks(g.bricks2);

    // 挡板
    ctx.fillStyle = "#FF375F";
    ctx.beginPath();
    ctx.roundRect(g.paddle1.x, g.paddle1.y, PADDLE_W, PADDLE_H, 5);
    ctx.fill();
    ctx.fillStyle = "#BF5AF2";
    ctx.beginPath();
    ctx.roundRect(g.paddle2.x, g.paddle2.y, PADDLE_W, PADDLE_H, 5);
    ctx.fill();

    // 球
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(g.ball1.x, g.ball1.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(g.ball2.x, g.ball2.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    setScores([g.score1, g.score2]);

    // 检查胜负
    const bricks1Left = g.bricks1.flat().filter((b: any) => b.alive).length;
    const bricks2Left = g.bricks2.flat().filter((b: any) => b.alive).length;
    if (bricks1Left === 0 || g.lives2 <= 0) {
      setWinner(1);
      setGameState("over");
      return;
    }
    if (bricks2Left === 0 || g.lives1 <= 0) {
      setWinner(2);
      setGameState("over");
      return;
    }

    if (gameState === "playing") {
      requestAnimationFrame(gameLoop);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "playing") {
      initGame();
      requestAnimationFrame(gameLoop);
    }
  }, [gameState, initGame, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // 触屏控制
  const handleTouch = (e: React.TouchEvent, isTop: boolean) => {
    if (!gameRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (CANVAS_W / rect.width);
    if (isTop) {
      gameRef.current.paddle1.x = x - PADDLE_W / 2;
    } else {
      gameRef.current.paddle2.x = x - PADDLE_W / 2;
    }
  };

  return (
    <GameLayout title="打砖块 · 对战">
      <div className="space-y-4">
        {/* 比分 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-pink-500/10 border border-pink-400/30 p-3 text-center">
            <p className="text-xs text-pink-200/70">玩家1 (A/D)</p>
            <p className="text-2xl font-bold text-pink-200">{scores[0]}</p>
          </div>
          <div className="rounded-xl bg-purple-500/10 border border-purple-400/30 p-3 text-center">
            <p className="text-xs text-purple-200/70">玩家2 (←/→)</p>
            <p className="text-2xl font-bold text-purple-200">{scores[1]}</p>
          </div>
        </div>

        {/* 游戏区 */}
        <div className="flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="rounded-xl border border-white/20 bg-black/40 max-w-full"
              onTouchStart={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const y = e.touches[0].clientY - rect.top;
                handleTouch(e, y < rect.height / 2);
              }}
              onTouchMove={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const y = e.touches[0].clientY - rect.top;
                handleTouch(e, y < rect.height / 2);
              }}
            />
            {gameState === "menu" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-4">打砖块对战</h2>
                <p className="text-sm text-white/60 mb-6 text-center px-4">
                  玩家1：A/D 键<br />玩家2：←/→ 键<br />手机触屏控制
                </p>
                <button
                  onClick={() => setGameState("playing")}
                  className="rounded-full px-8 py-3 text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}
                >
                  开始游戏
                </button>
              </div>
            )}
            {gameState === "over" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-2">玩家 {winner} 获胜！</h2>
                <p className="text-sm text-white/60 mb-6">{scores[0]} : {scores[1]}</p>
                <button
                  onClick={() => setGameState("playing")}
                  className="rounded-full px-8 py-3 text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #34C759 0%, #30D158 100%)" }}
                >
                  再来一局
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 上下分屏对战，各自清理自己区域的砖块</li>
            <li>• 先清完所有砖块或对方生命耗尽即获胜</li>
            <li>• 漏掉小球损失1条命，共3条命</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
