"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState, useEffect } from "react";

const clothes = ["上衣", "裤子", "袜子", "内衣", "饰品"];

const punishments = [
  "亲对方脖子10秒", "用舌头舔对方耳朵", "在对方胸口留个吻痕",
  "隔着衣服摸对方敏感部位", "用嘴唇慢慢解开对方一颗扣子",
  "在对方耳边说一句骚话", "用手指从对方腰慢慢滑到大腿内侧",
  "亲对方小腹并慢慢往下", "用牙齿轻咬对方嘴唇",
  "把对方按在墙上深吻", "用舌头在对方身上画圈",
  "蒙眼亲对方，让对方猜亲的是哪里", "边脱自己衣服边挑逗对方",
  "用屁股蹭对方敏感部位", "在对方锁骨处留下口水印",
  "用手指在对方手心写骚话", "亲对方手指并一根根舔",
  "在对方耳边吹气然后舔耳垂", "用鼻子蹭对方脖子然后轻咬",
];

const ultimatePunishments = [
  "互相打飞机，看谁先到", "69式互相口，坚持5分钟",
  "蒙眼绑住手，任由对方摆布", "用润滑油全身按摩，慢慢往下",
  "在浴室里边洗澡边做", "尝试一个从未试过的姿势",
  "用冰块在敏感部位滑动", "穿情趣内衣角色扮演",
  "在镜子前做，看着对方眼睛", "互相舔乳头直到求饶",
  "边看片边模仿里面的动作", "用玩具互相挑逗",
];

const specialCards = [
  { name: "🔥 激情加倍", desc: "下一轮输的人执行两个惩罚", icon: "🔥" },
  { name: "👀 全场观看", desc: "输的人在对方面前慢慢脱衣服", icon: "👀" },
  { name: "💋 亲吻特权", desc: "赢的人指定输的人亲自己任何部位", icon: "💋" },
  { name: "🎲 随机体位", desc: "输的人摆出性感姿势保持10秒", icon: "🎲" },
  { name: "🍷 情趣惩罚", desc: "输的人用嘴喂对方喝一口水", icon: "🍷" },
  { name: "🔞 脱衣加速", desc: "输的人本轮脱两件衣服", icon: "🔞" },
  { name: "🛡️ 保护卡", desc: "本轮免除脱衣，只执行惩罚", icon: "🛡️" },
  { name: "🔄 反转卡", desc: "输赢反转，赢的人接受惩罚", icon: "🔄" },
];

export default function StripCardsGame() {
  const [started, setStarted] = useState(false);
  const [cardA, setCardA] = useState(0);
  const [cardB, setCardB] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [clothesA, setClothesA] = useState([...clothes]);
  const [clothesB, setClothesB] = useState([...clothes]);
  const [punishment, setPunishment] = useState("");
  const [special, setSpecial] = useState<typeof specialCards[0] | null>(null);
  const [round, setRound] = useState(1);
  const [winner, setWinner] = useState<"A" | "B" | null>(null);
  const [streakA, setStreakA] = useState(0);
  const [streakB, setStreakB] = useState(0);
  const [ultimateMode, setUltimateMode] = useState(false);
  const [cardFlipping, setCardFlipping] = useState(false);
  const [nameA, setNameA] = useState("玩家A");
  const [nameB, setNameB] = useState("玩家B");

  const drawCards = () => {
    setCardFlipping(true);
    setTimeout(() => {
      setCardA(Math.floor(Math.random() * 13) + 1);
      setCardB(Math.floor(Math.random() * 13) + 1);
      setRevealed(true);
      setCardFlipping(false);
      setPunishment("");
      setSpecial(null);
      setWinner(null);

      if (Math.random() < 0.2) {
        setSpecial(specialCards[Math.floor(Math.random() * specialCards.length)]);
      }
    }, 400);
  };

  const resolveRound = () => {
    let w: "A" | "B";
    if (cardA > cardB) w = "A";
    else if (cardB > cardA) w = "B";
    else w = Math.random() > 0.5 ? "A" : "B";

    // 反转卡
    if (special?.name.includes("反转")) {
      w = w === "A" ? "B" : "A";
    }

    setWinner(w);

    // 连胜统计
    if (w === "A") {
      setStreakA((s) => s + 1);
      setStreakB(0);
    } else {
      setStreakB((s) => s + 1);
      setStreakA(0);
    }

    // 脱衣（保护卡免除）
    const isProtected = special?.name.includes("保护");
    const doubleStrip = special?.name.includes("加速");
    
    if (!isProtected) {
      const stripCount = doubleStrip ? 2 : 1;
      if (w === "A") {
        setClothesB((c) => {
          const newC = c.slice(0, -stripCount);
          if (newC.length === 0) setUltimateMode(true);
          return newC;
        });
      } else {
        setClothesA((c) => {
          const newC = c.slice(0, -stripCount);
          if (newC.length === 0) setUltimateMode(true);
          return newC;
        });
      }
    }

    // 惩罚
    const doublePunish = special?.name.includes("加倍");
    const pool = ultimateMode ? ultimatePunishments : punishments;
    let p = pool[Math.floor(Math.random() * pool.length)];
    if (doublePunish) {
      p += " + " + pool[Math.floor(Math.random() * pool.length)];
    }
    setPunishment(p);
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
    setSpecial(null);
    setWinner(null);
    setStreakA(0);
    setStreakB(0);
    setUltimateMode(false);
  };

  const cardName = (n: number) => {
    if (n === 1) return "A";
    if (n === 11) return "J";
    if (n === 12) return "Q";
    if (n === 13) return "K";
    return String(n);
  };

  const cardSuit = () => {
    const suits = ["♠️", "♥️", "♦️", "♣️"];
    return suits[Math.floor(Math.random() * suits.length)];
  };

  return (
    <LicenseGate gameName="情侣脱衣卡牌">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-6">
        <div className="game-container w-full">
          {!started && (
            <div className="text-center">
              <div className="mb-4 text-6xl">🃏</div>
              <h1 className="mb-2 text-2xl font-bold text-white">情侣脱衣卡牌</h1>
              <p className="mb-5 text-sm text-white/70">比大小，输的人脱衣服+调情惩罚，越玩越火辣</p>
              
              <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-2xl">👕</div>
                  <p className="mt-1 text-[10px] text-white/60">脱衣挑战</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-2xl">⚡</div>
                  <p className="mt-1 text-[10px] text-white/60">道具卡牌</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-2xl">🔥</div>
                  <p className="mt-1 text-[10px] text-white/60">终极惩罚</p>
                </div>
              </div>

              <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs text-white/60">
                <p className="mb-1 font-semibold text-white/80">📋 规则：</p>
                <p>• 两人各抽一张牌比大小</p>
                <p>• 输的人脱一件衣服+执行惩罚</p>
                <p>• 随机触发8种特殊道具卡</p>
                <p>• 衣服脱完进入终极惩罚模式</p>
                <p>• 连胜3轮有额外奖励</p>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
              >
                🎴 开始游戏
              </button>
            </div>
          )}

          {started && (
            <div>
              {/* 顶部状态栏 */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[10px] text-white/40">第 {round} 轮</p>
                  {ultimateMode && (
                    <p className="text-[10px] font-bold text-red-400 animate-pulse">🔥 终极模式</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {streakA >= 3 && (
                    <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-300">🔥A连{streakA}</span>
                  )}
                  {streakB >= 3 && (
                    <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-300">🔥B连{streakB}</span>
                  )}
                </div>
              </div>

              {/* 双方状态 */}
              <div className="mb-4 flex justify-between gap-2">
                <div className="flex-1 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-transparent p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-bold text-pink-300">👩 {nameA}</p>
                    {streakA >= 2 && <span className="text-[10px]">🔥</span>}
                  </div>
                  <p className="text-[10px] text-white/50">剩余 {clothesA.length} 件</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {clothesA.length > 0 ? clothesA.map((c, i) => (
                      <span key={i} className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[9px] text-pink-200">{c}</span>
                    )) : (
                      <span className="text-[9px] text-red-400">已脱光 🔥</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-white/30">VS</div>
                <div className="flex-1 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-bold text-purple-300">👨 {nameB}</p>
                    {streakB >= 2 && <span className="text-[10px]">🔥</span>}
                  </div>
                  <p className="text-[10px] text-white/50">剩余 {clothesB.length} 件</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {clothesB.length > 0 ? clothesB.map((c, i) => (
                      <span key={i} className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] text-purple-200">{c}</span>
                    )) : (
                      <span className="text-[9px] text-red-400">已脱光 🔥</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 卡牌区域 */}
              <div className="mb-4 flex justify-center items-center gap-4">
                <div className={`relative flex h-32 w-24 items-center justify-center rounded-2xl border-2 text-4xl font-bold transition-all duration-300 ${
                  cardFlipping ? "rotate-y-180 scale-90" : ""
                } ${
                  revealed ? "border-pink-400 bg-gradient-to-br from-pink-500/30 to-pink-700/20 text-pink-100 shadow-lg shadow-pink-500/30" : "border-white/20 bg-white/5 text-white/30"
                }`}>
                  {revealed ? (
                    <div className="text-center">
                      <div className="text-3xl">{cardName(cardA)}</div>
                      <div className="text-lg">♥️</div>
                    </div>
                  ) : "?"}
                </div>
                <div className="text-2xl text-white/40">⚔️</div>
                <div className={`relative flex h-32 w-24 items-center justify-center rounded-2xl border-2 text-4xl font-bold transition-all duration-300 ${
                  cardFlipping ? "rotate-y-180 scale-90" : ""
                } ${
                  revealed ? "border-purple-400 bg-gradient-to-br from-purple-500/30 to-purple-700/20 text-purple-100 shadow-lg shadow-purple-500/30" : "border-white/20 bg-white/5 text-white/30"
                }`}>
                  {revealed ? (
                    <div className="text-center">
                      <div className="text-3xl">{cardName(cardB)}</div>
                      <div className="text-lg">♠️</div>
                    </div>
                  ) : "?"}
                </div>
              </div>

              {/* 特殊卡 */}
              {special && (
                <div className="mb-3 rounded-xl border border-yellow-400/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{special.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-yellow-200">{special.name}</p>
                      <p className="text-[10px] text-yellow-300/70">{special.desc}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 结果 */}
              {winner && (
                <div className="mb-3 space-y-2">
                  <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-2.5 text-center text-sm text-green-200">
                    🎉 {winner === "A" ? nameA : nameB} 获胜！
                    {streakA >= 3 && winner === "A" && " 🔥连胜奖励!"}
                    {streakB >= 3 && winner === "B" && " 🔥连胜奖励!"}
                  </div>
                  <div className="rounded-xl border border-pink-400/30 bg-gradient-to-br from-pink-500/10 to-red-500/10 p-3">
                    <p className="mb-1 text-xs font-semibold text-pink-300">
                      {ultimateMode ? "🔥 终极惩罚" : "💋 调情惩罚"}
                    </p>
                    <p className="text-sm leading-relaxed text-white">{punishment}</p>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="space-y-2">
                {!revealed && (
                  <button
                    onClick={drawCards}
                    disabled={cardFlipping}
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 disabled:opacity-50"
                  >
                    {cardFlipping ? "🎴 发牌中..." : "🎴 抽牌"}
                  </button>
                )}
                {revealed && !winner && (
                  <button
                    onClick={resolveRound}
                    className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/40 transition hover:shadow-purple-500/60"
                  >
                    ⚡ 揭晓结果
                  </button>
                )}
                {winner && (
                  <button
                    onClick={nextRound}
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
                  >
                    下一轮 →
                  </button>
                )}
                <button
                  onClick={restart}
                  className="w-full rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/50 transition hover:bg-white/10"
                >
                  🔄 重新开始
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
