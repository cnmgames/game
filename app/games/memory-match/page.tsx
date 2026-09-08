// @ts-nocheck
// v29 fixed import paths
"use client";
import { useState, useEffect, useCallback } from "react";
import GameLayout from "../GameLayout";

const EMOJIS = ["💖", "🌙", "⭐", "🌹", "🍰", "🐱", "🎵", "🎁"];

export default function MemoryMatchGame() {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const initGame = useCallback(() => {
    const pairs = [...EMOJIS, ...EMOJIS];
    const shuffled = pairs
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5)
      .map((c, i) => ({ ...c, id: i }));
    setCards(shuffled);
    setFlipped([]);
    setCurrentPlayer(1);
    setScore1(0);
    setScore2(0);
    setGameOver(false);
    setBusy(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setGameOver(true);
    }
  }, [cards]);

  const flipCard = (id: number) => {
    if (busy) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;
    if (flipped.length >= 2) return;

    const newCards = cards.map((c, i) => i === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setBusy(true);
      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            i === first || i === second ? { ...c, matched: true } : c
          ));
          if (currentPlayer === 1) setScore1(s => s + 1);
          else setScore2(s => s + 1);
          setFlipped([]);
          setBusy(false);
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            i === first || i === second ? { ...c, flipped: false } : c
          ));
          setCurrentPlayer(p => p === 1 ? 2 : 1);
          setFlipped([]);
          setBusy(false);
        }, 1000);
      }
    }
  };

  const winner = score1 > score2 ? 1 : score2 > score1 ? 2 : 0;

  return (
    <GameLayout title="默契翻牌">
      <div className="space-y-4">
        {/* 比分 */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 text-center ${
            currentPlayer === 1 && !gameOver ? "bg-pink-500/20 border-2 border-pink-400/50" : "bg-pink-500/10 border border-pink-400/20"
          }`}>
            <p className="text-xs text-pink-200/70">玩家 1</p>
            <p className="text-2xl font-bold text-pink-200">{score1}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${
            currentPlayer === 2 && !gameOver ? "bg-purple-500/20 border-2 border-purple-400/50" : "bg-purple-500/10 border border-purple-400/20"
          }`}>
            <p className="text-xs text-purple-200/70">玩家 2</p>
            <p className="text-2xl font-bold text-purple-200">{score2}</p>
          </div>
        </div>

        {/* 游戏结束 */}
        {gameOver && (
          <div className="text-center space-y-3 fade-in-up rounded-xl border border-amber-400/30 bg-amber-500/10 p-6">
            <h2 className="text-2xl font-bold text-white">
              {winner === 0 ? "平局！" : `玩家 ${winner} 获胜！`}
            </h2>
            <p className="text-white/60">最终比分 {score1} : {score2}</p>
            <button
              onClick={initGame}
              className="rounded-full px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #34C759 0%, #30D158 100%)" }}
            >
              再来一局
            </button>
          </div>
        )}

        {/* 卡牌区 */}
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              className={`aspect-square rounded-xl text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 ${
                card.flipped || card.matched
                  ? "bg-white/10 border border-pink-400/40 scale-100"
                  : "bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/10 hover:scale-105 hover:border-pink-400/40"
              } ${card.matched ? "opacity-50" : ""}`}
            >
              {card.flipped || card.matched ? card.emoji : "?"}
            </button>
          ))}
        </div>

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 两人轮流翻牌，每次翻2张</li>
            <li>• 翻到相同图案配对成功，得1分，继续翻</li>
            <li>• 翻到不同则翻回，换人</li>
            <li>• 全部配对完成，得分多者获胜</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
