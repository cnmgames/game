// v29 fixed import paths
"use client";
import { useState, useEffect, useCallback } from "react";
import GameLayout from "../GameLayout";
import Icon from "../../components/Icon";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function StifleCowGame() {
  const [phase, setPhase] = useState<"roll" | "bid" | "reveal">("roll");
  const [dice1, setDice1] = useState<number[]>([]);
  const [dice2, setDice2] = useState<number[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [lastBid, setLastBid] = useState<{ count: number; face: number } | null>(null);
  const [bidCount, setBidCount] = useState(2);
  const [bidFace, setBidFace] = useState(1);
  const [result, setResult] = useState<string>("");
  const [showDice1, setShowDice1] = useState(true);
  const [showDice2, setShowDice2] = useState(false);
  const [rolling, setRolling] = useState(false);

  const rollDice = useCallback(() => {
    setRolling(true);
    setTimeout(() => {
      setDice1(Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1));
      setDice2(Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1));
      setPhase("bid");
      setCurrentPlayer(1);
      setLastBid(null);
      setResult("");
      setRolling(false);
      setShowDice1(true);
      setShowDice2(false);
    }, 800);
  }, []);

  useEffect(() => {
    rollDice();
  }, [rollDice]);

  const makeBid = () => {
    if (lastBid) {
      if (bidCount < lastBid.count || (bidCount === lastBid.count && bidFace <= lastBid.face)) {
        setResult("叫价必须高于上一家！");
        return;
      }
    }
    setLastBid({ count: bidCount, face: bidFace });
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setResult("");
    // 切换玩家时隐藏对方骰子
    if (currentPlayer === 1) {
      setShowDice1(false);
      setShowDice2(true);
    } else {
      setShowDice1(true);
      setShowDice2(false);
    }
  };

  const reveal = () => {
    if (!lastBid) return;
    setPhase("reveal");
    setShowDice1(true);
    setShowDice2(true);
    const allDice = [...dice1, ...dice2];
    const count = allDice.filter(d => d === lastBid.face || d === 1).length; // 1是万能
    if (count >= lastBid.count) {
      setResult(`开牌！共有 ${count} 个 ${lastBid.face}（含1点万能），叫价成立，开牌方输！`);
    } else {
      setResult(`开牌！只有 ${count} 个 ${lastBid.face}（含1点万能），叫价不成立，叫价方输！`);
    }
  };

  const DiceDisplay = ({ dice, show, player }: { dice: number[]; show: boolean; player: number }) => (
    <div className={`rounded-xl p-4 ${player === 1 ? "bg-pink-500/10 border border-pink-400/30" : "bg-purple-500/10 border border-purple-400/30"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${player === 1 ? "text-pink-200" : "text-purple-200"}`}>玩家 {player}</span>
        {phase === "bid" && (
          <button
            onClick={() => player === 1 ? setShowDice1(!show) : setShowDice2(!show)}
            className="text-xs text-white/40 hover:text-white/60"
          >
            {show ? "隐藏" : "查看"}
          </button>
        )}
      </div>
      <div className="flex gap-1 justify-center">
        {dice.map((d, i) => (
          <span key={i} className={`text-3xl transition-all duration-300 ${rolling ? "animate-bounce" : ""} ${show ? "opacity-100" : "opacity-20 blur-sm"}`}>
            {show ? DICE_FACES[d - 1] : "?"}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <GameLayout title="憋牛 · 吹牛骰子">
      <div className="space-y-4">
        {/* 骰子区 */}
        <div className="grid grid-cols-2 gap-3">
          <DiceDisplay dice={dice1} show={showDice1} player={1} />
          <DiceDisplay dice={dice2} show={showDice2} player={2} />
        </div>

        {/* 当前叫价 */}
        {lastBid && (
          <div className="text-center rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-200/70">当前叫价</p>
            <p className="text-xl font-bold text-amber-200">
              {lastBid.count} 个 {lastBid.face} 点
            </p>
          </div>
        )}

        {/* 叫价区 */}
        {phase === "bid" && (
          <div className="space-y-3">
            <div className={`text-center text-sm font-semibold ${
              currentPlayer === 1 ? "text-pink-200" : "text-purple-200"
            }`}>
              玩家 {currentPlayer} 回合
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-white/50 mb-1 block">个数</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bidCount}
                  onChange={(e) => setBidCount(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center text-lg font-bold text-white outline-none focus:border-pink-400/50"
                />
              </div>
              <span className="text-white/40 pt-6">个</span>
              <div className="flex-1">
                <label className="text-xs text-white/50 mb-1 block">点数</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={bidFace}
                  onChange={(e) => setBidFace(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center text-lg font-bold text-white outline-none focus:border-pink-400/50"
                />
              </div>
              <span className="text-white/40 pt-6">点</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={makeBid}
                className="rounded-full py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #FF375F 0%, #D70040 100%)" }}
              >
                叫价
              </button>
              <button
                onClick={reveal}
                disabled={!lastBid}
                className="rounded-full py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #BF5AF2 0%, #5E5CE6 100%)" }}
              >
                开牌！
              </button>
            </div>
          </div>
        )}

        {/* 结果 */}
        {phase === "reveal" && (
          <div className="text-center space-y-4 fade-in-up">
            <p className="text-lg font-bold text-white">{result}</p>
            <button
              onClick={rollDice}
              className="rounded-full px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #34C759 0%, #30D158 100%)" }}
            >
              再来一局
            </button>
          </div>
        )}

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 每人5个骰子，摇完后只能看自己的</li>
            <li>• 轮流叫价（几个几点），叫价必须高于上一家</li>
            <li>• 不信对方可以开牌，统计双方骰子总数</li>
            <li>• 1点是万能，可以当任意点数</li>
            <li>• 叫价成立则开牌方输，否则叫价方输</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
