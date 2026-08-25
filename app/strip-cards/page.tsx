"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState, useEffect } from "react";

type Layer = "menu" | "game" | "editor";
type Card = { suit: string; value: number; name: string };

const suits = ["♠️", "♥️", "♦️", "♣️"];
const cardNames = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const defaultPunishments = [
  "亲对方脖子10秒", "用舌头舔对方耳朵", "在对方胸口留个吻痕",
  "隔着衣服摸对方敏感部位", "用嘴唇慢慢解开对方一颗扣子",
  "在对方耳边说一句骚话", "用手指从对方腰慢慢滑到大腿内侧",
  "亲对方小腹并慢慢往下", "用牙齿轻咬对方嘴唇",
  "把对方按在墙上深吻", "用舌头在对方身上画圈",
];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (let i = 0; i < 13; i++) {
      deck.push({ suit, value: i >= 10 ? 10 : i + 1, name: cardNames[i] });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calcScore = (cards: Card[]): number => {
  let score = cards.reduce((s, c) => s + c.value, 0);
  const aces = cards.filter((c) => c.name === "A").length;
  for (let i = 0; i < aces; i++) {
    if (score + 10 <= 21) score += 10;
  }
  return score;
};

export default function StripCardsGame() {
  const [layer, setLayer] = useState<Layer>("menu");
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealerTurn" | "ended">("betting");
  const [bet, setBet] = useState(1);
  const [playerClothes, setPlayerClothes] = useState(5);
  const [dealerClothes, setDealerClothes] = useState(5);
  const [result, setResult] = useState("");
  const [punishment, setPunishment] = useState("");
  const [punishments, setPunishments] = useState<string[]>(defaultPunishments);
  const [newPunishment, setNewPunishment] = useState("");
  const [round, setRound] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("strip_punishments");
    if (saved) setPunishments(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("strip_punishments", JSON.stringify(punishments));
  }, [punishments]);

  const goBack = () => {
    if (layer === "game") setLayer("menu");
    else if (layer === "editor") setLayer("menu");
  };

  const startRound = () => {
    const newDeck = createDeck();
    const pCards = [newDeck.pop()!, newDeck.pop()!];
    const dCards = [newDeck.pop()!, newDeck.pop()!];
    setDeck(newDeck);
    setPlayerCards(pCards);
    setDealerCards(dCards);
    setGameState("playing");
    setResult("");
    setPunishment("");

    // 天然21点
    if (calcScore(pCards) === 21) {
      endRound("blackjack");
    }
  };

  const hit = () => {
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newPlayerCards = [...playerCards, card];
    setDeck(newDeck);
    setPlayerCards(newPlayerCards);

    const score = calcScore(newPlayerCards);
    if (score > 21) {
      endRound("bust");
    } else if (score === 21) {
      stand(newDeck, newPlayerCards);
    }
  };

  const stand = (currentDeck?: Card[], currentPlayer?: Card[]) => {
    setGameState("dealerTurn");
    let d = currentDeck ? [...currentDeck] : [...deck];
    let dCards = [...dealerCards];

    const dealerPlay = () => {
      let score = calcScore(dCards);
      while (score < 17) {
        dCards.push(d.pop()!);
        score = calcScore(dCards);
      }
      setDealerCards(dCards);
      setDeck(d);

      const pScore = calcScore(currentPlayer || playerCards);
      const dScore = calcScore(dCards);

      if (dScore > 21) endRound("dealerBust");
      else if (pScore > dScore) endRound("win");
      else if (pScore < dScore) endRound("lose");
      else endRound("push");
    };

    setTimeout(dealerPlay, 800);
  };

  const endRound = (type: string) => {
    setGameState("ended");
    let lostClothes = 0;

    if (type === "blackjack") {
      setResult("🎉 BlackJack！你赢了！");
      lostClothes = bet;
      setDealerClothes((c) => Math.max(0, c - lostClothes));
    } else if (type === "win" || type === "dealerBust") {
      setResult("🎉 你赢了！");
      lostClothes = bet;
      setDealerClothes((c) => Math.max(0, c - lostClothes));
    } else if (type === "lose" || type === "bust") {
      setResult("💔 你输了...");
      lostClothes = bet;
      setPlayerClothes((c) => Math.max(0, c - lostClothes));
      // 输了执行惩罚
      setPunishment(punishments[Math.floor(Math.random() * punishments.length)]);
    } else {
      setResult("🤝 平局");
    }
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    setGameState("betting");
  };

  const restart = () => {
    setPlayerClothes(5);
    setDealerClothes(5);
    setRound(1);
    setBet(1);
    setGameState("betting");
    setResult("");
    setPunishment("");
  };

  const addPunishment = () => {
    if (newPunishment.trim()) {
      setPunishments([...punishments, newPunishment.trim()]);
      setNewPunishment("");
    }
  };

  const removePunishment = (idx: number) => {
    setPunishments(punishments.filter((_, i) => i !== idx));
  };

  const BackButton = () => (
    <button onClick={goBack} className="mb-4 flex items-center gap-1 text-xs text-white/50 transition hover:text-white/80">
      ← 返回上一层
    </button>
  );

  const CardDisplay = ({ card, hidden }: { card: Card; hidden?: boolean }) => (
    <div className={`flex h-16 w-12 items-center justify-center rounded-lg border text-lg font-bold shadow-md sm:h-20 sm:w-14 sm:text-xl ${
      hidden ? "border-purple-400 bg-gradient-to-br from-purple-600 to-pink-600 text-white" :
      card.suit === "♥️" || card.suit === "♦️" ? "border-white/20 bg-white text-red-500" : "border-white/20 bg-white text-gray-900"
    }`}>
      {hidden ? "?" : <div className="text-center"><div>{card.name}</div><div className="text-xs">{card.suit}</div></div>}
    </div>
  );

  return (
    <LicenseGate gameName="情侣脱衣21点">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-4 py-6">
        <div className="game-container w-full">
          {/* 主菜单 */}
          {layer === "menu" && (
            <div className="text-center">
              <div className="mb-4 text-6xl">🃏</div>
              <h1 className="mb-2 text-2xl font-bold text-white">情侣脱衣21点</h1>
              <p className="mb-6 text-sm text-white/70">经典21点卡牌游戏，输的人脱衣服+执行调情惩罚</p>
              <div className="space-y-3">
                <button onClick={() => { restart(); setLayer("game"); }} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60">
                  ▶️ 开始游戏
                </button>
                <button onClick={() => setLayer("editor")} className="w-full rounded-full border border-white/15 bg-white/5 py-3 text-sm text-white/70 transition hover:bg-white/10">
                  ✏️ 编辑惩罚库
                </button>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left text-xs text-white/60">
                  <p className="mb-2 font-semibold text-white/80">📋 21点规则：</p>
                  <p>• 目标：手牌点数尽量接近21但不超过</p>
                  <p>• A可算1或11，J/Q/K算10</p>
                  <p>• 要牌(Hit)或停牌(Stand)</p>
                  <p>• 下注1-3件衣服，输了脱掉</p>
                  <p>• 输的人还要执行调情惩罚</p>
                </div>
              </div>
            </div>
          )}

          {/* 游戏中 */}
          {layer === "game" && (
            <div>
              <BackButton />
              
              {/* 状态栏 */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[10px] text-white/40">第 {round} 轮</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-pink-300">你</p>
                    <p className="text-lg font-bold text-pink-200">👕 {playerClothes}</p>
                  </div>
                  <span className="text-white/30">VS</span>
                  <div className="text-center">
                    <p className="text-[10px] text-purple-300">对手</p>
                    <p className="text-lg font-bold text-purple-200">👕 {dealerClothes}</p>
                  </div>
                </div>
              </div>

              {/* 下注阶段 */}
              {gameState === "betting" && (
                <div className="text-center">
                  <p className="mb-3 text-sm text-white/70">选择下注衣服数量</p>
                  <div className="mb-4 flex justify-center gap-2">
                    {[1, 2, 3].map((n) => (
                      <button key={n} onClick={() => setBet(n)} className={`h-12 w-12 rounded-full text-lg font-bold transition ${
                        bet === n ? "bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg scale-110" : "bg-white/10 text-white/60"
                      }`}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <button onClick={startRound} disabled={playerClothes < bet || dealerClothes < bet} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 disabled:opacity-50">
                    发牌 🎴
                  </button>
                  {(playerClothes === 0 || dealerClothes === 0) && (
                    <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-3">
                      <p className="text-sm text-yellow-200">🔥 有人已经脱光了！游戏结束</p>
                      <button onClick={restart} className="mt-2 w-full rounded-full bg-yellow-500 py-2 text-xs font-semibold text-black">重新开始</button>
                    </div>
                  )}
                </div>
              )}

              {/* 游戏进行中 */}
              {(gameState === "playing" || gameState === "dealerTurn") && (
                <div>
                  {/* 对手牌 */}
                  <div className="mb-4">
                    <p className="mb-2 text-xs text-purple-300">对手 {gameState === "dealerTurn" ? `(${calcScore(dealerCards)}点)` : "(?)"}</p>
                    <div className="flex gap-2">
                      {dealerCards.map((c, i) => (
                        <CardDisplay key={i} card={c} hidden={i === 1 && gameState === "playing"} />
                      ))}
                    </div>
                  </div>

                  {/* 你的牌 */}
                  <div className="mb-4">
                    <p className="mb-2 text-xs text-pink-300">你 ({calcScore(playerCards)}点)</p>
                    <div className="flex flex-wrap gap-2">
                      {playerCards.map((c, i) => <CardDisplay key={i} card={c} />)}
                    </div>
                  </div>

                  {gameState === "playing" && (
                    <div className="flex gap-2">
                      <button onClick={hit} className="flex-1 rounded-full bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-400">
                        要牌 Hit
                      </button>
                      <button onClick={() => stand()} className="flex-1 rounded-full bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-400">
                        停牌 Stand
                      </button>
                    </div>
                  )}
                  {gameState === "dealerTurn" && (
                    <p className="text-center text-sm text-white/50 animate-pulse">对手正在思考...</p>
                  )}
                </div>
              )}

              {/* 结果 */}
              {gameState === "ended" && (
                <div>
                  <div className="mb-4">
                    <p className="mb-2 text-xs text-purple-300">对手 ({calcScore(dealerCards)}点)</p>
                    <div className="flex gap-2">{dealerCards.map((c, i) => <CardDisplay key={i} card={c} />)}</div>
                  </div>
                  <div className="mb-4">
                    <p className="mb-2 text-xs text-pink-300">你 ({calcScore(playerCards)}点)</p>
                    <div className="flex flex-wrap gap-2">{playerCards.map((c, i) => <CardDisplay key={i} card={c} />)}</div>
                  </div>
                  <div className={`mb-3 rounded-xl border p-3 text-center text-sm font-bold ${
                    result.includes("赢") || result.includes("BlackJack") ? "border-green-400/30 bg-green-500/10 text-green-200" :
                    result.includes("输") ? "border-red-400/30 bg-red-500/10 text-red-200" :
                    "border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
                  }`}>
                    {result}
                  </div>
                  {punishment && (
                    <div className="mb-3 rounded-xl border border-pink-400/30 bg-pink-500/10 p-3">
                      <p className="mb-1 text-xs font-semibold text-pink-300">💋 调情惩罚</p>
                      <p className="text-sm text-white">{punishment}</p>
                    </div>
                  )}
                  <button onClick={nextRound} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60">
                    下一轮 →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 编辑惩罚库 */}
          {layer === "editor" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">✏️ 编辑惩罚库</h2>
              <div className="mb-4 flex gap-2">
                <input value={newPunishment} onChange={(e) => setNewPunishment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPunishment()} placeholder="输入新的惩罚..." className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400/50" />
                <button onClick={addPunishment} className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-400">添加</button>
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {punishments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-sm text-white/80">{p}</span>
                    <button onClick={() => removePunishment(i)} className="ml-2 text-red-400 hover:text-red-300">🗑️</button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] text-white/40">共 {punishments.length} 条惩罚，自动保存</p>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
