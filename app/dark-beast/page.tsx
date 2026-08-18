"use client";

import { useState, useEffect } from "react";
import GameLayout from "@/components/GameLayout";
import { beastPieces, truthQuestions, dareChallenges } from "@/lib/gameData";

interface Card {
  id: number;
  piece: typeof beastPieces[number];
  revealed: boolean;
  matched: boolean;
  owner: number | null; // 0: 玩家1, 1: 玩家2, null: 未归属
}

const GRID_SIZE = 16; // 4x4 棋盘，每种棋子2张

export default function DarkBeastGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [punishment, setPunishment] = useState<string | null>(null);
  const [showPunishment, setShowPunishment] = useState(false);

  // 初始化游戏
  const initGame = () => {
    const selectedPieces = beastPieces.slice(0, 8);
    const allCards: Card[] = [];
    selectedPieces.forEach((piece, idx) => {
      allCards.push({ id: idx * 2, piece, revealed: false, matched: false, owner: null });
      allCards.push({ id: idx * 2 + 1, piece, revealed: false, matched: false, owner: null });
    });
    // 洗牌
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    setCards(allCards);
    setFlippedIndices([]);
    setCurrentPlayer(0);
    setScores([0, 0]);
    setGameOver(false);
    setPunishment(null);
    setShowPunishment(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (gameOver) return;
    if (cards[index].revealed || cards[index].matched) return;
    if (flippedIndices.length >= 2) return;

    const newCards = [...cards];
    newCards[index].revealed = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (newCards[first].piece.rank === newCards[second].piece.rank) {
        // 匹配成功
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[first].matched = true;
          matchedCards[second].matched = true;
          matchedCards[first].owner = currentPlayer;
          matchedCards[second].owner = currentPlayer;
          setCards(matchedCards);
          setFlippedIndices([]);

          const newScores = [...scores];
          newScores[currentPlayer] += matchedCards[first].piece.rank;
          setScores(newScores);

          // 检查游戏是否结束
          if (matchedCards.every((c) => c.matched)) {
            setGameOver(true);
            // 输家接受惩罚
            const loser = newScores[0] > newScores[1] ? 1 : 0;
            const isTruth = Math.random() > 0.5;
            const punishmentText = isTruth
              ? `玩家${loser + 1} 真心话：${truthQuestions[Math.floor(Math.random() * truthQuestions.length)]}`
              : `玩家${loser + 1} 大冒险：${dareChallenges[Math.floor(Math.random() * dareChallenges.length)]}`;
            setPunishment(punishmentText);
          }
        }, 600);
      } else {
        // 匹配失败，翻回去并切换玩家
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[first].revealed = false;
          resetCards[second].revealed = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setCurrentPlayer((prev) => (prev + 1) % 2);
        }, 1000);
      }
    }
  };

  const playerColors = [
    { bg: "bg-pink-500", text: "text-pink-300", border: "border-pink-400" },
    { bg: "bg-sky-500", text: "text-sky-300", border: "border-sky-400" },
  ];

  return (
    <GameLayout title="暗兽棋" emoji="🦁">
      <div className="space-y-6">
        {/* 玩家分数 */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((p) => (
            <div
              key={p}
              className={`rounded-2xl border p-4 backdrop-blur-xl transition-all ${
                currentPlayer === p && !gameOver
                  ? `${playerColors[p].border}/50 bg-white/10 ring-2 ring-${p === 0 ? "pink" : "sky"}-400/30`
                  : "bg-white/5 border-white/10"
              }`}
              style={{
                borderColor: currentPlayer === p ? (p === 0 ? "rgba(236,72,153,0.4)" : "rgba(14,165,233,0.4)") : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${playerColors[p].bg}`} />
                  <span className="font-semibold text-white">玩家{p + 1}</span>
                </div>
                <span className={`text-2xl font-bold ${playerColors[p].text}`}>{scores[p]}</span>
              </div>
              {currentPlayer === p && !gameOver && (
                <p className="text-xs text-white/50 mt-1 animate-pulse">你的回合</p>
              )}
            </div>
          ))}
        </div>

        {/* 棋盘 */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={card.revealed || card.matched || gameOver}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                card.revealed || card.matched
                  ? card.owner !== null
                    ? `${playerColors[card.owner].border}/50 bg-white/10`
                    : "border-amber-400/50 bg-amber-500/10"
                  : "border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 hover:border-pink-400/40 hover:from-zinc-700 cursor-pointer"
              } ${card.matched ? "opacity-60" : ""}`}
            >
              {card.revealed || card.matched ? (
                <>
                  <span className="text-3xl sm:text-4xl">{card.piece.emoji}</span>
                  <span className="text-[10px] sm:text-xs text-white/60 mt-1">{card.piece.name}</span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl text-white/30">❓</span>
              )}
            </button>
          ))}
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-3">
          <button onClick={initGame} className="btn-secondary">
            重新开始
          </button>
          {gameOver && (
            <button onClick={() => setShowPunishment(true)} className="btn-primary">
              查看惩罚
            </button>
          )}
        </div>

        {/* 游戏结束提示 */}
        {gameOver && (
          <div className="rounded-2xl border border-pink-400/30 bg-pink-500/10 p-4 text-center backdrop-blur-xl">
            <p className="text-lg font-semibold text-white">
              🎉 游戏结束！玩家{scores[0] > scores[1] ? "1" : "2"} 获胜！
            </p>
            <p className="text-sm text-white/60 mt-1">输家需要接受惩罚挑战</p>
          </div>
        )}

        {/* 惩罚弹窗 */}
        {showPunishment && punishment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPunishment(false)}>
            <div className="max-w-md w-full rounded-3xl border border-pink-400/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="text-5xl mb-4">🔥</div>
                <h3 className="text-xl font-bold text-pink-300 mb-4">输家惩罚</h3>
                <p className="text-white text-lg leading-relaxed mb-6">{punishment}</p>
                <button onClick={() => setShowPunishment(false)} className="btn-primary w-full">
                  接受惩罚 ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 规则说明 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white/80 mb-2">游戏规则</h3>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• 轮流翻牌，翻到两张相同的棋子即可得分（分数=棋子等级）</li>
            <li>• 匹配成功可继续翻牌，失败则轮到对方</li>
            <li>• 全部翻完后分数高者获胜，输家接受真心话或大冒险惩罚</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
