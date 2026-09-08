// v32 remove external Icon import
"use client";
import { useState, useEffect, useCallback } from "react";
import GameLayout from "../GameLayout";

export default function NumberBombGame() {
  const [bomb, setBomb] = useState(0);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState<{ player: number; num: number; result: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [loser, setLoser] = useState(0);
  const [showPunishment, setShowPunishment] = useState(false);

  const punishments = [
    "深情对视30秒",
    "给对方一个拥抱",
    "说一句情话",
    "亲一下对方",
    "捏捏对方的脸",
    "摸头杀",
    "壁咚10秒",
    "公主抱",
    "背后抱",
    "咬耳朵说悄悄话",
  ];

  const startGame = useCallback(() => {
    setBomb(Math.floor(Math.random() * 100) + 1);
    setMin(1);
    setMax(100);
    setCurrentPlayer(1);
    setGuess("");
    setHistory([]);
    setGameOver(false);
    setLoser(0);
    setShowPunishment(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < min || num > max) return;

    if (num === bomb) {
      setLoser(currentPlayer);
      setGameOver(true);
      setHistory([...history, { player: currentPlayer, num, result: "💥 炸弹！" }]);
      return;
    }

    let result = "";
    if (num < bomb) {
      setMin(num + 1);
      result = "太小了";
    } else {
      setMax(num - 1);
      result = "太大了";
    }
    setHistory([...history, { player: currentPlayer, num, result }]);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setGuess("");
  };

  const getRandomPunishment = () => {
    return punishments[Math.floor(Math.random() * punishments.length)];
  };

  return (
    <GameLayout title="数字炸弹">
      <div className="space-y-6">
        {/* 范围显示 */}
        <div className="text-center">
          <p className="text-sm text-white/60 mb-2">当前范围</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-3xl font-bold text-pink-300">{min}</span>
            <span className="text-white/40">~</span>
            <span className="text-3xl font-bold text-purple-300">{max}</span>
          </div>
        </div>

        {/* 当前玩家 */}
        {!gameOver && (
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold ${
              currentPlayer === 1 
                ? "bg-pink-500/20 text-pink-200 border border-pink-400/40" 
                : "bg-purple-500/20 text-purple-200 border border-purple-400/40"
            }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              玩家 {currentPlayer} 回合
            </div>
          </div>
        )}

        {/* 游戏结束 */}
        {gameOver && (
          <div className="text-center space-y-4 fade-in-up">
            <div className="text-5xl mb-2">💥</div>
            <h2 className="text-2xl font-bold text-white">玩家 {loser} 踩到炸弹了！</h2>
            <p className="text-white/60">炸弹数字是 <span className="text-pink-300 font-bold text-xl">{bomb}</span></p>
            
            {!showPunishment ? (
              <button
                onClick={() => setShowPunishment(true)}
                className="mt-4 rounded-full px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)", boxShadow: "0 4px 20px rgba(255,55,95,0.4)" }}
              >
                抽取惩罚
              </button>
            ) : (
              <div className="mt-4 rounded-2xl border border-pink-400/30 bg-pink-500/10 p-6 fade-in-up">
                <p className="text-sm text-white/60 mb-2">惩罚内容</p>
                <p className="text-xl font-bold text-pink-200">{getRandomPunishment()}</p>
              </div>
            )}

            <div className="flex gap-3 justify-center mt-4">
              {showPunishment && (
                <button
                  onClick={() => setShowPunishment(false)}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
                >
                  换一个
                </button>
              )}
              <button
                onClick={startGame}
                className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #34C759 0%, #30D158 100%)" }}
              >
                再来一局
              </button>
            </div>
          </div>
        )}

        {/* 输入区 */}
        {!gameOver && (
          <div className="space-y-3">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              placeholder={`输入 ${min} - ${max} 之间的数字`}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold text-white placeholder-white/30 outline-none transition focus:border-pink-400/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
              autoFocus
            />
            <button
              onClick={handleGuess}
              disabled={!guess}
              className="w-full rounded-full py-3.5 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #FF375F 0%, #D70040 100%)", boxShadow: "0 4px 20px rgba(255,55,95,0.4)" }}
            >
              确认
            </button>
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">历史记录</p>
            <div className="max-h-40 overflow-y-auto space-y-1.5">
              {history.slice().reverse().map((h, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  h.player === 1 ? "bg-pink-500/10" : "bg-purple-500/10"
                }`}>
                  <span className={h.player === 1 ? "text-pink-200" : "text-purple-200"}>玩家 {h.player}</span>
                  <span className="font-mono font-bold text-white">{h.num}</span>
                  <span className="text-white/60">{h.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 规则说明 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 系统随机生成1-100的炸弹数字</li>
            <li>• 两人轮流猜数字，系统提示太大或太小</li>
            <li>• 猜到炸弹数字的人输，接受惩罚</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
