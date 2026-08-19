"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const beasts = ["🦁", "🐯", "🐻", "🦊", "🐺", "🦉", "🐍", "🦅"];
const penalties = [
  "脱一件外套",
  "喝一杯酒",
  "说一句情话",
  "亲对方手背",
  "做5个俯卧撑",
  "给对方抛个媚眼",
  "唱一句情歌",
  "交换一个小秘密",
];

interface Card {
  id: number;
  beast: string;
  flipped: boolean;
  matched: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BeastGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [penalty, setPenalty] = useState("");

  const initGame = () => {
    const pairs = [...beasts, ...beasts];
    const shuffled = shuffleArray(pairs);
    setCards(shuffled.map((beast, i) => ({ id: i, beast, flipped: false, matched: false })));
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setGameOver(false);
    setPenalty("");
  };

  useEffect(() => {
    initGame();
  }, []);

  const flipCard = (id: number) => {
    if (flipped.length >= 2) return;
    if (cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    setFlipped([...flipped, id]);

    if (flipped.length === 1) {
      setMoves((m) => m + 1);
      const first = cards[flipped[0]];
      const second = newCards[id];
      if (first.beast === second.beast) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[first.id].matched = true;
          matchedCards[second.id].matched = true;
          setCards(matchedCards);
          setFlipped([]);
          const newMatched = matched + 1;
          setMatched(newMatched);
          if (newMatched === beasts.length) {
            setGameOver(true);
            setPenalty(penalties[Math.floor(Math.random() * penalties.length)]);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[first.id].flipped = false;
          resetCards[second.id].flipped = false;
          setCards(resetCards);
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-pink-300 hover:text-pink-200 mb-6">
          ← 返回首页
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">🦁 火辣暗兽棋</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">翻牌、博弈、记忆配对，输了接受惩罚</p>
          </div>

          {/* 状态栏 */}
          <div className="mb-6 flex justify-center gap-6 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">回合：<span className="font-bold text-pink-300">{moves}</span></span>
            <span className="rounded-full bg-white/10 px-4 py-2">配对：<span className="font-bold text-green-300">{matched}/{beasts.length}</span></span>
          </div>

          {/* 棋盘 */}
          <div className="mb-6 grid grid-cols-4 gap-2 sm:gap-3">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`aspect-square rounded-xl border text-3xl sm:text-5xl transition-all duration-300 ${
                  card.matched
                    ? "border-green-400/50 bg-green-500/20 opacity-60"
                    : card.flipped
                    ? "border-pink-400/60 bg-pink-500/20 rotate-0"
                    : "border-white/10 bg-white/10 hover:border-pink-300/40 hover:bg-white/15"
                }`}
                style={{ transform: card.flipped || card.matched ? "rotateY(0deg)" : "rotateY(0deg)" }}
              >
                {card.flipped || card.matched ? card.beast : "❓"}
              </button>
            ))}
          </div>

          {/* 游戏结束 */}
          {gameOver && (
            <div className="mb-6 rounded-2xl border border-pink-300/30 bg-pink-500/10 p-5 text-center fade-in-up">
              <div className="text-xl font-bold mb-2">🎉 游戏完成！</div>
              <div className="text-sm text-white/70 mb-2">共用了 {moves} 回合</div>
              <div className="text-lg font-semibold text-pink-300">输家惩罚：{penalty}</div>
            </div>
          )}

          {/* 按钮 */}
          <div className="text-center">
            <button
              onClick={initGame}
              className="rounded-full bg-pink-500 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
            >
              🔄 重新开始
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
