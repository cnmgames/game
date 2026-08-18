"use client";

import { useState, useRef } from "react";
import GameLayout from "@/components/GameLayout";
import { slotWheels } from "@/lib/gameData";

export default function SlotsGame() {
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [result, setResult] = useState<string | null>(null);
  const [desireBar, setDesireBar] = useState([0, 0]); // 两个玩家的欲望条
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const intervalsRef = useRef<(NodeJS.Timeout | null)[]>([null, null, null]);

  const wheelNames = ["地点", "动作", "部位"];
  const wheelData = [slotWheels.location, slotWheels.action, slotWheels.bodyPart];

  const spinReel = (reelIndex: number) => {
    if (spinning[reelIndex]) return;

    const newSpinning = [...spinning];
    newSpinning[reelIndex] = true;
    setSpinning(newSpinning);

    let count = 0;
    const maxCount = 15 + reelIndex * 5; // 每个滚轮停止时间不同

    intervalsRef.current[reelIndex] = setInterval(() => {
      setReels((prev) => {
        const newReels = [...prev];
        newReels[reelIndex] = (newReels[reelIndex] + 1) % wheelData[reelIndex].length;
        return newReels;
      });
      count++;

      if (count >= maxCount) {
        if (intervalsRef.current[reelIndex]) {
          clearInterval(intervalsRef.current[reelIndex]!);
          intervalsRef.current[reelIndex] = null;
        }
        const finalSpinning = [...spinning];
        finalSpinning[reelIndex] = false;
        setSpinning(finalSpinning);

        // 检查是否全部停止
        if (reelIndex === 2) {
          setTimeout(() => {
            const location = wheelData[0][reels[0]];
            const action = wheelData[1][reels[1]];
            const bodyPart = wheelData[2][reels[2]];
            const resultText = `在${location}${action}对方的${bodyPart}`;
            setResult(resultText);
            setShowResult(true);

            // 增加欲望条
            setDesireBar((prev) => {
              const newBar = [...prev];
              newBar[currentPlayer] = Math.min(100, newBar[currentPlayer] + 15 + Math.floor(Math.random() * 10));
              return newBar;
            });

            // 检查是否获胜
            if (desireBar[currentPlayer] + 20 >= 100) {
              setTimeout(() => {
                setResult(`🎉 玩家${currentPlayer + 1} 集满欲望条，获得胜利！可以向对方许一个愿望！`);
                setShowResult(true);
              }, 500);
            } else {
              setCurrentPlayer((prev) => (prev + 1) % 2);
            }
          }, 300);
        }
      }
    }, 80);
  };

  const spinAll = () => {
    if (spinning.some((s) => s)) return;
    setResult(null);
    setShowResult(false);
    spinReel(0);
    setTimeout(() => spinReel(1), 200);
    setTimeout(() => spinReel(2), 400);
  };

  const resetGame = () => {
    setReels([0, 0, 0]);
    setResult(null);
    setDesireBar([0, 0]);
    setCurrentPlayer(0);
    setShowResult(false);
  };

  return (
    <GameLayout title="桃色老虎机" emoji="🎰">
      <div className="space-y-6">
        {/* 欲望条 */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((p) => (
            <div key={p} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">玩家{p + 1}</span>
                <span className="text-xs text-pink-300">{desireBar[p]}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    p === 0 ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-gradient-to-r from-sky-500 to-cyan-500"
                  }`}
                  style={{ width: `${desireBar[p]}%` }}
                />
              </div>
              {currentPlayer === p && !spinning.some((s) => s) && (
                <p className="text-xs text-white/50 mt-1 animate-pulse">你的回合</p>
              )}
            </div>
          ))}
        </div>

        {/* 老虎机 */}
        <div className="rounded-3xl border border-pink-400/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-2xl">
          {/* 滚轮 */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-6">
            {wheelData.map((wheel, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-xs text-white/50 mb-2">{wheelNames[idx]}</span>
                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl border-2 border-pink-400/40 bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden relative">
                  <div
                    className={`text-center px-2 ${spinning[idx] ? "blur-sm" : ""}`}
                  >
                    <span className="text-base sm:text-lg font-bold text-white block">
                      {wheel[reels[idx]]}
                    </span>
                  </div>
                  {/* 高光效果 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          {/* 拉杆 */}
          <div className="flex justify-center">
            <button
              onClick={spinAll}
              disabled={spinning.some((s) => s)}
              className="btn-primary text-lg px-10 py-4 disabled:opacity-50"
            >
              {spinning.some((s) => s) ? "旋转中..." : "🎰 拉下拉杆"}
            </button>
          </div>
        </div>

        {/* 结果弹窗 */}
        {showResult && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowResult(false)}>
            <div className="max-w-md w-full rounded-3xl border border-pink-400/30 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="text-5xl mb-4">💕</div>
                <h3 className="text-xl font-bold gradient-text mb-4">你的亲密时刻</h3>
                <p className="text-white text-xl leading-relaxed mb-6">{result}</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowResult(false)} className="btn-secondary flex-1">
                    好的
                  </button>
                  <button
                    onClick={() => {
                      setShowResult(false);
                      setTimeout(spinAll, 300);
                    }}
                    className="btn-primary flex-1"
                  >
                    再来一次
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 重置 */}
        <div className="flex justify-center">
          <button onClick={resetGame} className="btn-secondary">
            重置游戏
          </button>
        </div>

        {/* 规则 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white/80 mb-2">游戏规则</h3>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• 两人轮流拉下拉杆，三个滚轮随机组合出地点+动作+部位</li>
            <li>• 每次成功组合可增加欲望条，先集满100%者获胜</li>
            <li>• 赢家可以向输家提出一个愿望</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
