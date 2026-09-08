// @ts-nocheck
// v34 mobile-friendly couple game
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import GameLayout from "../GameLayout";

interface Block {
  x: number;
  width: number;
  color: string;
}

const COLORS = ["#FF375F", "#BF5AF2", "#FF9F0A", "#30D158", "#0A84FF", "#FF453A", "#64D2FF"];
const GAME_WIDTH = 280;
const BLOCK_HEIGHT = 28;
const MAX_TOWER = 15;

export default function TetrisGame() {
  const [tower, setTower] = useState<Block[]>([{ x: GAME_WIDTH / 2 - 50, width: 100, color: COLORS[0] }]);
  const [currentX, setCurrentX] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(100);
  const [direction, setDirection] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(0);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const animRef = useRef<number>();

  useEffect(() => {
    if (gameOver) return;
    let x = currentX;
    let dir = direction;
    const speed = 2.5;
    const animate = () => {
      x += dir * speed;
      if (x + currentWidth > GAME_WIDTH) { x = GAME_WIDTH - currentWidth; dir = -1; }
      if (x < 0) { x = 0; dir = 1; }
      setCurrentX(x);
      setDirection(dir);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [gameOver, currentWidth]);

  const placeBlock = useCallback(() => {
    if (gameOver) return;
    const top = tower[tower.length - 1];
    const overlap = Math.min(currentX + currentWidth, top.x + top.width) - Math.max(currentX, top.x);

    if (overlap <= 0) {
      // 完全没对齐，塔倒了
      setGameOver(true);
      setWinner(currentPlayer === 1 ? 2 : 1);
      if (currentPlayer === 1) setScore2(s => s + 1);
      else setScore1(s => s + 1);
      return;
    }

    const newBlock: Block = {
      x: Math.max(currentX, top.x),
      width: overlap,
      color: COLORS[tower.length % COLORS.length],
    };
    const newTower = [...tower, newBlock];
    setTower(newTower);
    setCurrentWidth(overlap);
    setCurrentX(0);

    if (newTower.length >= MAX_TOWER) {
      setGameOver(true);
      setWinner(0); // 平局，塔建到最高
      return;
    }

    setCurrentPlayer(p => p === 1 ? 2 : 1);
  }, [currentX, currentWidth, tower, gameOver, currentPlayer]);

  const restart = useCallback(() => {
    setTower([{ x: GAME_WIDTH / 2 - 50, width: 100, color: COLORS[0] }]);
    setCurrentX(0);
    setCurrentWidth(100);
    setDirection(1);
    setCurrentPlayer(1);
    setGameOver(false);
    setWinner(0);
  }, []);

  return (
    <GameLayout title="情侣叠叠乐">
      <div className="space-y-4">
        {/* 比分 */}
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

        <div className="text-center text-xs text-white/50">
          {gameOver ? "游戏结束" : `玩家 ${currentPlayer} 放置 · 已建 ${tower.length - 1}/${MAX_TOWER - 1} 层`}
        </div>

        {/* 游戏区 */}
        <div className="flex justify-center">
          <div
            className="relative rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent overflow-hidden"
            style={{ width: GAME_WIDTH, height: MAX_TOWER * BLOCK_HEIGHT + 60 }}
            onClick={placeBlock}
          >
            {/* 塔 */}
            <div className="absolute bottom-10 left-0 right-0 flex flex-col-reverse items-center">
              {tower.map((block, i) => (
                <div
                  key={i}
                  className="rounded-sm transition-all"
                  style={{
                    width: block.width,
                    height: BLOCK_HEIGHT - 2,
                    backgroundColor: block.color,
                    marginLeft: block.x - (GAME_WIDTH / 2 - 50),
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                />
              ))}
            </div>

            {/* 当前移动的方块 */}
            {!gameOver && (
              <div
                className="absolute rounded-sm"
                style={{
                  left: currentX,
                  bottom: 10 + (tower.length) * (BLOCK_HEIGHT - 2),
                  width: currentWidth,
                  height: BLOCK_HEIGHT - 2,
                  backgroundColor: COLORS[tower.length % COLORS.length],
                  boxShadow: "0 0 12px rgba(255,255,255,0.3)",
                }}
              />
            )}

            {/* 地面 */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/10 to-transparent" />
          </div>
        </div>

        {/* 放置按钮 */}
        {!gameOver && (
          <button
            onClick={placeBlock}
            className="w-full rounded-xl py-4 text-lg font-bold text-white active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}
          >
            放置方块
          </button>
        )}

        {/* 游戏结束 */}
        {gameOver && (
          <div className="text-center space-y-3 rounded-xl border border-green-400/30 bg-green-500/10 p-6 fade-in-up">
            <h2 className="text-xl font-bold text-white">
              {winner === 0 ? "完美通关！塔建到最高！" : `玩家 ${winner} 获胜！`}
            </h2>
            <p className="text-white/60">
              {winner === 0 ? "你们太有默契了！" : `玩家 ${currentPlayer} 把塔弄倒了~`}
            </p>
            <p className="text-sm text-pink-200">输的人要接受甜蜜惩罚哦~</p>
            <button onClick={restart} className="rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}>
              再来一局
            </button>
          </div>
        )}

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 两人轮流点击放置方块，方块会左右移动</li>
            <li>• 必须和下方方块对齐，没对齐塔就倒了</li>
            <li>• 塔越建越高，谁弄倒谁输，输的接受惩罚</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
