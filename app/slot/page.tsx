"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState, useRef } from "react";

const defaultLocations = ["阳台", "沙发", "厨房", "床上", "浴室", "车内", "酒店", "天台"];
const defaultActions = ["亲吻", "按摩", "舔舐", "轻咬", "抚摸", "挠痒痒", "拥抱", "吹气"];
const defaultParts = ["脖子", "耳朵", "大腿", "嘴唇", "胸口", "腰间", "手背", "发梢"];
const suits = ["♥", "♦", "♣", "♠"];
const suitColors: Record<string, string> = { "♥": "text-red-400", "♦": "text-red-400", "♣": "text-white", "♠": "text-white" };

export default function SlotGame() {
  const [locations, setLocations] = useState(defaultLocations);
  const [actions, setActions] = useState(defaultActions);
  const [parts, setParts] = useState(defaultParts);
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [desire, setDesire] = useState(0);
  const [result, setResult] = useState("");
  const [winner, setWinner] = useState("");
  const [players, setPlayers] = useState([{ name: "玩家1", score: 0 }, { name: "玩家2", score: 0 }]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showPlayerEdit, setShowPlayerEdit] = useState(false);
  const [showContentEdit, setShowContentEdit] = useState(false);
  const [editType, setEditType] = useState<0 | 1 | 2>(0);
  const [newItem, setNewItem] = useState("");
  const intervals = useRef<(NodeJS.Timeout | null)[]>([null, null, null]);

  const anySpinning = spinning.some((s) => s);
  const data = [locations, actions, parts];
  const labels = ["地点", "动作", "部位"];

  const spin = () => {
    if (anySpinning) return;
    setResult(""); setWinner("");
    setSpinning([true, true, true]);
    const finalValues = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      let count = 0; const target = 15 + i * 8;
      intervals.current[i] = setInterval(() => {
        setReels((prev) => { const next = [...prev]; next[i] = (next[i] + 1) % data[i].length; return next; });
        count++;
        if (count >= target) {
          if (intervals.current[i]) clearInterval(intervals.current[i]!);
          const final = Math.floor(Math.random() * data[i].length);
          finalValues[i] = final;
          setReels((prev) => { const next = [...prev]; next[i] = final; return next; });
          setSpinning((prev) => { const next = [...prev]; next[i] = false; return next; });
          if (i === 2) {
            setTimeout(() => {
              const combo = `${locations[finalValues[0]]} · ${actions[finalValues[1]]} · ${parts[finalValues[2]]}`;
              setResult(combo);
              const gain = Math.floor(Math.random() * 15) + 5;
              const newScore = players[currentPlayer].score + gain;
              const np = [...players]; np[currentPlayer].score = newScore; setPlayers(np);
              setDesire((d) => { const nd = Math.min(d + gain, 100); if (nd >= 100) setWinner(`🎉 ${players[currentPlayer].name}集满欲望条，获胜！`); return nd; });
              setCurrentPlayer((p) => (p + 1) % players.length);
            }, 300);
          }
        }
      }, 80 + i * 30);
    }
  };

  const reset = () => {
    setDesire(0); setResult(""); setWinner(""); setReels([0, 0, 0]);
    setPlayers(players.map((p) => ({ ...p, score: 0 }))); setCurrentPlayer(0);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    if (editType === 0) setLocations([...locations, newItem.trim()]);
    else if (editType === 1) setActions([...actions, newItem.trim()]);
    else setParts([...parts, newItem.trim()]);
    setNewItem("");
  };
  const removeItem = (type: number, idx: number) => {
    if (type === 0) setLocations(locations.filter((_, i) => i !== idx));
    else if (type === 1) setActions(actions.filter((_, i) => i !== idx));
    else setParts(parts.filter((_, i) => i !== idx));
  };

  return (
    <>
      <LicenseGate gameName="桃色老虎机">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4"><Link href="/" className="back-btn">← 返回游戏列表</Link></div>

        <div className="game-container">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="game-title">桃色老虎机</h1>
            <div className="game-title-underline" />
            <p className="mt-3 text-sm text-white/60 sm:text-base">一拉定情。地点、动作、部位，随机组合你的下一个亲密时刻。</p>
          </div>
          <div className="border-t border-white/10 my-6" />


          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {/* 老虎机 */}
            <div className="md:col-span-2 flex flex-col items-center gap-5 sm:gap-6">
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-center">
                <span className="text-xs text-white/50">结果：</span>
                <span className="text-pink-300 font-semibold ml-1">{players[currentPlayer].name}</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 w-full">
                <div className="flex justify-center gap-2 sm:gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="text-xs text-white/50">{labels[i]}</div>
                      <div className={`relative flex h-36 w-16 flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 sm:h-44 sm:w-20 ${spinning[i] ? "animate-pulse" : ""}`}>
                        <div className={`text-lg font-bold ${suitColors[suits[i % 4]]} sm:text-xl`}>{Math.floor(Math.random() * 13) + 1}{suits[i % 4]}</div>
                        <div className="mt-1 text-xs text-white/80 sm:text-sm">{data[i][reels[i]]}</div>
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/60 to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 bg-yellow-400/50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result && <div className="w-full rounded-xl border border-pink-300/30 bg-pink-500/10 p-4 text-center fade-in-up"><div className="text-xs text-pink-300 mb-1">本次组合</div><div className="text-base font-semibold">{result}</div></div>}
              {winner && <div className="w-full rounded-xl border border-yellow-300/30 bg-yellow-500/10 p-4 text-center fade-in-up"><div className="text-lg font-bold text-yellow-300">{winner}</div></div>}

              <div className="flex gap-3 sm:gap-4">
                <button onClick={spin} disabled={anySpinning} className="rounded-full bg-pink-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 hover:bg-pink-400 disabled:opacity-50">{anySpinning ? "旋转中..." : "🎰 开始旋转"}</button>
                <button onClick={reset} className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">再玩一局</button>
              </div>
            </div>

            {/* 右侧面板 */}
            <div className="space-y-4">
              {/* 玩家设置 */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">玩家设置</span>
                  <button onClick={() => setShowPlayerEdit(true)} className="text-pink-400 text-xs hover:text-pink-300">编辑</button>
                </div>
                <div className="space-y-2">
                  {players.map((p, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 ${i === currentPlayer ? "bg-pink-500/20 ring-1 ring-pink-400/50" : "bg-white/5"}`}>
                      <span className="text-sm">{p.name}</span>
                      <span className="text-sm font-bold text-pink-300">{p.score}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-white/60 mb-1"><span>欲望值</span><span>{desire}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500" style={{ width: `${desire}%` }} /></div>
                </div>
              </div>

              {/* 编辑内容 */}
              <button onClick={() => setShowContentEdit(true)} className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-center hover:bg-black/30 transition">
                <div className="text-2xl mb-1">📖</div>
                <div className="text-sm font-semibold">编辑老虎机内容</div>
                <div className="text-xs text-white/50">编辑内容</div>
              </button>
            </div>
          </div>
        </div>

        <div className="footer-card">
          <p>请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
        </div>
      </div>

      {/* 玩家编辑弹窗 */}
      {showPlayerEdit && (
        <div className="modal-overlay" onClick={() => setShowPlayerEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">玩家设置</h3>
            <div className="space-y-3">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={p.name} onChange={(e) => { const np = [...players]; np[i].name = e.target.value; setPlayers(np); }} className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-400/50" />
                  {players.length > 1 && <button onClick={() => setPlayers(players.filter((_, idx) => idx !== i))} className="text-red-400 text-sm">删除</button>}
                </div>
              ))}
              {players.length < 4 && <button onClick={() => setPlayers([...players, { name: `玩家${players.length + 1}`, score: 0 }])} className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-white/70 hover:bg-white/10">+ 添加玩家</button>}
            </div>
            <button onClick={() => setShowPlayerEdit(false)} className="w-full mt-4 rounded-full bg-pink-500 py-2 text-sm font-semibold text-white hover:bg-pink-400">保存</button>
          </div>
        </div>
      )}

      {/* 内容编辑弹窗 */}
      {showContentEdit && (
        <div className="modal-overlay" onClick={() => setShowContentEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">编辑老虎机内容</h3>
            <div className="flex gap-2 mb-4">
              {[0, 1, 2].map((t) => (
                <button key={t} onClick={() => setEditType(t as 0 | 1 | 2)} className={`flex-1 rounded-lg py-2 text-sm transition ${editType === t ? "bg-pink-500 text-white" : "bg-white/5 text-white/70"}`}>{labels[t]}</button>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} placeholder={`添加新${labels[editType]}...`} className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-400/50" />
              <button onClick={addItem} className="rounded-lg bg-pink-500 px-4 py-2 text-sm text-white hover:bg-pink-400">添加</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(editType === 0 ? locations : editType === 1 ? actions : parts).map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                  <span className="flex-1 text-sm">{item}</span>
                  <button onClick={() => removeItem(editType, i)} className="text-red-400 text-xs hover:text-red-300">删除</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowContentEdit(false)} className="w-full mt-4 rounded-full bg-pink-500 py-2 text-sm font-semibold text-white hover:bg-pink-400">完成</button>
          </div>
        </div>
      )}
          </LicenseGate>
        </>
  );
}
