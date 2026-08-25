"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState } from "react";

const clothes = ["上衣", "裤子", "袜子", "内衣", "饰品"];

const punishments = [
  "亲对方脖子10秒", "用舌头舔对方耳朵", "在对方胸口留个吻痕",
  "隔着衣服摸对方敏感部位", "用嘴唇慢慢解开对方一颗扣子",
  "在对方耳边说一句骚话", "用手指从对方腰慢慢滑到大腿内侧",
  "亲对方小腹并慢慢往下", "用牙齿轻咬对方嘴唇",
  "把对方按在墙上深吻", "用舌头在对方身上画圈",
  "蒙眼亲对方，让对方猜亲的是哪里", "边脱自己衣服边挑逗对方",
  "用屁股蹭对方敏感部位", "在对方锁骨处留下口水印",
];

const specialCards = [
  { name: "🔥 激情加倍", desc: "下一轮输的人要执行两个惩罚" },
  { name: "👀 全场观看", desc: "输的人要在对方面前慢慢脱衣服" },
  { name: "💋 亲吻特权", desc: "赢的人可以指定输的人亲自己任何部位" },
  { name: "🎲 随机体位", desc: "输的人要摆出一个性感姿势保持10秒" },
  { name: "🍷 情趣惩罚", desc: "输的人要用嘴喂对方喝一口水/酒" },
  { name: "🔞 脱衣加速", desc: "输的人本轮要脱两件衣服" },
];

export default function StripCardsGame() {
  const [started, setStarted] = useState(false);
  const [cardA, setCardA] = useState(0);
  const [cardB, setCardB] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [clothesA, setClothesA] = useState([...clothes]);
  const [clothesB, setClothesB] = useState([...clothes]);
  const [punishment, setPunishment] = useState("");
  const [special, setSpecial] = useState("");
  const [round, setRound] = useState(1);
  const [winner, setWinner] = useState<"A" | "B" | null>(null);

  const drawCards = () => {
    setCardA(Math.floor(Math.random() * 13) + 1);
    setCardB(Math.floor(Math.random() * 13) + 1);
    setRevealed(true);
    setPunishment("");
    setSpecial("");
    setWinner(null);

    // 10%概率触发特殊牌
    if (Math.random() < 0.15) {
      const s = specialCards[Math.floor(Math.random() * specialCards.length)];
      setSpecial(`${s.name}：${s.desc}`);
    }
  };

  const resolveRound = () => {
    let w: "A" | "B";
    if (cardA > cardB) w = "A";
    else if (cardB > cardA) w = "B";
    else {
      // 平局，随机
      w = Math.random() > 0.5 ? "A" : "B";
    }
    setWinner(w);

    // 输的人脱一件衣服
    if (w === "A") {
      setClothesB((c) => c.slice(0, -1));
    } else {
      setClothesA((c) => c.slice(0, -1));
    }

    // 随机惩罚
    setPunishment(punishments[Math.floor(Math.random() * punishments.length)]);
  };

  const nextRound = () => {
    setRevealed(false);
    setRound((r) => r + 1);
  };

  const restart = () => {
    setStarted(false);
    setClothesA([...clothes]);
    setClothesB([...clothes]);
    setRound(1);
    setRevealed(false);
    setPunishment("");
    setSpecial("");
    setWinner(null);
  };

  const cardName = (n: number) => {
    if (n === 1) return "A";
    if (n === 11) return "J";
    if (n === 12) return "Q";
    if (n === 13) return "K";
    return String(n);
  };

  return (
    <LicenseGate gameName="情侣脱衣卡牌">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-4">
        <div className="game-container w-full">
          {!started && (
            <div className="text-center">
              <div className="mb-3 text-5xl">🃏</div>
              <h1 className="mb-2 text-xl font-bold text-white">情侣脱衣卡牌</h1>
              <p className="mb-4 text-sm text-white/70">比大小，输的人脱衣服+执行调情惩罚，越玩越火辣</p>
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs text-white/60">
                <p className="mb-1">📋 规则：</p>
                <p>• 两人各抽一张牌比大小</p>
                <p>• 输的人脱一件衣服+执行惩罚</p>
                <p>• 随机触发特殊功能牌</p>
                <p>• 衣服脱完后进入终极惩罚模式</p>
              </div>
              <button
                onClick={() => setStarted(true)}
                className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
              >
                开始游戏
              </button>
            </div>
          )}

          {started && (
            <div>
              <div className="mb-3 text-center text-xs text-white/50">第 {round} 轮</div>

              {/* 双方衣服状态 */}
              <div className="mb-4 flex justify-between gap-2">
                <div className="flex-1 rounded-xl border border-pink-500/20 bg-pink-500/5 p-2 text-center">
                  <p className="text-xs text-pink-300">👩 玩家A</p>
                  <p className="text-[10px] text-white/50">剩余 {clothesA.length} 件</p>
                  <div className="mt-1 flex flex-wrap justify-center gap-1">
                    {clothesA.map((c, i) => (
                      <span key={i} className="rounded bg-pink-500/20 px-1 text-[9px] text-pink-200">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex-1 rounded-xl border border-purple-500/20 bg-purple-500/5 p-2 text-center">
                  <p className="text-xs text-purple-300">👨 玩家B</p>
                  <p className="text-[10px] text-white/50">剩余 {clothesB.length} 件</p>
                  <div className="mt-1 flex flex-wrap justify-center gap-1">
                    {clothesB.map((c, i) => (
                      <span key={i} className="rounded bg-purple-500/20 px-1 text-[9px] text-purple-200">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 卡牌区域 */}
              <div className="mb-4 flex justify-center gap-4">
                <div className={`flex h-28 w-20 items-center justify-center rounded-xl border-2 text-3xl font-bold transition-all ${
                  revealed ? "border-pink-400 bg-pink-500/20 text-pink-200" : "border-white/20 bg-white/5 text-white/30"
                }`}>
                  {revealed ? cardName(cardA) : "?"}
                </div>
                <div className="flex items-center text-white/40">VS</div>
                <div className={`flex h-28 w-20 items-center justify-center rounded-xl border-2 text-3xl font-bold transition-all ${
                  revealed ? "border-purple-400 bg-purple-500/20 text-purple-200" : "border-white/20 bg-white/5 text-white/30"
                }`}>
                  {revealed ? cardName(cardB) : "?"}
                </div>
              </div>

              {/* 特殊牌 */}
              {special && (
                <div className="mb-3 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-2 text-center text-xs text-yellow-200">
                  ⚡ {special}
                </div>
              )}

              {/* 结果 */}
              {winner && (
                <div className="mb-3 space-y-2">
                  <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-2 text-center text-sm text-green-200">
                    🎉 玩家{winner} 获胜！
                  </div>
                  <div className="rounded-xl border border-pink-400/30 bg-pink-500/10 p-3">
                    <p className="mb-1 text-xs text-pink-300">🔥 调情惩罚</p>
                    <p className="text-sm text-white">{punishment}</p>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              {!revealed && (
                <button
                  onClick={drawCards}
                  className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
                >
                  🎴 抽牌
                </button>
              )}
              {revealed && !winner && (
                <button
                  onClick={resolveRound}
                  className="w-full rounded-full bg-purple-500 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/40 transition hover:bg-purple-400"
                >
                  揭晓结果
                </button>
              )}
              {winner && (
                <button
                  onClick={nextRound}
                  className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
                >
                  下一轮
                </button>
              )}

              <button
                onClick={restart}
                className="mt-2 w-full rounded-full border border-white/20 bg-white/5 py-2 text-xs text-white/60 transition hover:bg-white/10"
              >
                重新开始
              </button>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
