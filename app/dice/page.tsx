"use client";
import Link from "next/link";
import { useState } from "react";

const defaultPenalties = [
  "喝一杯酒", "做10个深蹲", "说一句情话", "亲对方一下",
  "喝半杯水", "给对方按摩30秒", "唱一句歌", "模仿动物叫",
  "脱一件外套", "发一条撒娇语音", "做5个俯卧撑", "给对方抛个媚眼",
];

export default function DiceGame() {
  const [players, setPlayers] = useState(["酒友1", "酒友2"]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dice, setDice] = useState(1);
  const [diceCount, setDiceCount] = useState(1);
  const [previous, setPrevious] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("掷骰子开始游戏，挑战上家点数");
  const [stage, setStage] = useState(1);
  const [stageProgress, setStageProgress] = useState(0);
  const [penaltyPool, setPenaltyPool] = useState(defaultPenalties);
  const [currentPenalty, setCurrentPenalty] = useState("");
  const [showPenaltyEditor, setShowPenaltyEditor] = useState(false);
  const [newPenalty, setNewPenalty] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setCurrentPenalty("");
    let count = 0;
    const anim = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(anim);
        const final = Math.floor(Math.random() * 6) + 1;
        setDice(final);
        setRolling(false);
        const total = final * diceCount;
        if (previous !== null) {
          if (total > previous) {
            setMessage(`掷出 ${total} 点，超过上家 ${previous}！安全过关 ✅`);
            setStageProgress((p) => {
              const np = p + 1;
              if (np >= 5) { setStage((s) => s + 1); return 0; }
              return np;
            });
          } else if (total === previous) {
            setMessage(`掷出 ${total} 点，追平上家！再来一次 🎲`);
          } else {
            const p = penaltyPool[Math.floor(Math.random() * penaltyPool.length)];
            setCurrentPenalty(p);
            setMessage(`掷出 ${total} 点，低于上家 ${previous}，接受惩罚！`);
          }
        } else {
          setMessage(`掷出 ${total} 点，作为基准，下一位挑战！`);
        }
        setPrevious(total);
        setCurrentIdx((i) => (i + 1) % players.length);
      }
    }, 70);
  };

  const reset = () => {
    setPrevious(null); setMessage("掷骰子开始游戏，挑战上家点数");
    setStage(1); setStageProgress(0); setCurrentIdx(0); setCurrentPenalty("");
  };

  const addPlayer = () => { if (players.length < 6) setPlayers([...players, `酒友${players.length + 1}`]); };
  const removePlayer = (i: number) => {
    if (players.length > 1) {
      const np = players.filter((_, idx) => idx !== i);
      setPlayers(np);
      if (currentIdx >= np.length) setCurrentIdx(0);
    }
  };
  const savePlayerName = () => {
    if (editingPlayer !== null && editName.trim()) {
      const np = [...players]; np[editingPlayer] = editName.trim(); setPlayers(np);
    }
    setEditingPlayer(null);
  };
  const addPenalty = () => {
    if (!newPenalty.trim()) return;
    setPenaltyPool([...penaltyPool, newPenalty.trim()]);
    setNewPenalty("");
  };
  const removePenalty = (idx: number) => setPenaltyPool(penaltyPool.filter((_, i) => i !== idx));

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4"><Link href="/" className="text-sm text-pink-300 hover:text-pink-200">← 返回游戏列表</Link></div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-6 sm:rounded-3xl sm:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">情趣骰子</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">喝酒助兴必备。挑战上家的点数，输了就喝酒或大冒险</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* 骰子区域 */}
            <div className="md:col-span-2 flex flex-col items-center gap-4">
              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-xs text-white/50">当前骰子数</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <button onClick={() => setDiceCount(Math.max(1, diceCount - 1))} className="text-white/50 hover:text-white">-</button>
                    <span className="text-lg font-bold">{diceCount}</span>
                    <button onClick={() => setDiceCount(Math.min(3, diceCount + 1))} className="text-white/50 hover:text-white">+</button>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-xs text-white/50">当前回合</div>
                  <div className="text-lg font-semibold text-pink-300">{players[currentIdx]}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                  <div className="text-xs text-white/50">上家点数</div>
                  <div className="text-lg font-semibold text-pink-300">{previous ?? "—"}</div>
                </div>
              </div>

              <div className={`text-8xl sm:text-9xl ${rolling ? "dice-rolling" : ""}`}>{diceFaces[dice]}</div>

              <div className="min-h-[50px] w-full rounded-xl border border-white/10 bg-black/20 p-3 text-center text-sm">{message}</div>
              {currentPenalty && (
                <div className="w-full rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-center text-sm text-red-200 fade-in-up">惩罚：{currentPenalty}</div>
              )}

              <div className="flex gap-3">
                <button onClick={roll} disabled={rolling} className="rounded-full bg-pink-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 hover:bg-pink-400 disabled:opacity-50">{rolling ? "掷骰中..." : "🎲 掷骰子"}</button>
                <button onClick={reset} className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">重置</button>
              </div>
            </div>

            {/* 右侧面板 */}
            <div className="space-y-4">
              {/* 酒局玩家 */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">酒局玩家</span>
                  <button onClick={addPlayer} className="text-pink-400 text-xs hover:text-pink-300">+ 添加</button>
                </div>
                <div className="space-y-2">
                  {players.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {editingPlayer === i ? (
                        <>
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && savePlayerName()} className="flex-1 rounded bg-white/10 px-2 py-1 text-sm text-white focus:outline-none" autoFocus />
                          <button onClick={savePlayerName} className="text-green-400 text-xs">✓</button>
                        </>
                      ) : (
                        <>
                          <span className={`text-sm ${i === currentIdx ? "text-pink-300 font-semibold" : "text-white/70"}`} onClick={() => { setEditingPlayer(i); setEditName(p); }}>{p}</span>
                          <button onClick={() => removePlayer(i)} className="text-white/40 hover:text-red-400 text-xs ml-auto">✕</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 惩罚库 */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">惩罚库（{penaltyPool.length}）</span>
                  <button onClick={() => setShowPenaltyEditor(true)} className="text-pink-400 text-xs hover:text-pink-300">管理</button>
                </div>
                <div className="text-xs text-white/50 mb-2">阶段 {stage} · {stageProgress}/5</div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${(stageProgress / 5) * 100}%` }} />
                </div>
                {currentPenalty && <div className="mt-2 text-xs text-pink-300">当前惩罚：{currentPenalty}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/40">请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。<br />© 2024 ~ 2026 www.hoothin.com</div>
      </div>

      {/* 惩罚库编辑器 */}
      {showPenaltyEditor && (
        <div className="modal-overlay" onClick={() => setShowPenaltyEditor(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">管理惩罚库</h3>
            <div className="flex gap-2 mb-4">
              <input value={newPenalty} onChange={(e) => setNewPenalty(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPenalty()} placeholder="输入新惩罚..." className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-400/50" />
              <button onClick={addPenalty} className="rounded-lg bg-pink-500 px-4 py-2 text-sm text-white hover:bg-pink-400">添加</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {penaltyPool.map((p, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                  <span className="flex-1 text-sm">{p}</span>
                  <button onClick={() => removePenalty(i)} className="text-red-400 text-xs hover:text-red-300">删除</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPenaltyEditor(false)} className="w-full mt-4 rounded-full bg-pink-500 py-2 text-sm font-semibold text-white hover:bg-pink-400">完成</button>
          </div>
        </div>
      )}
    </>
  );
}
