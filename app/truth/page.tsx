"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState } from "react";

const defaultTruth = [
  "第一次对我心动是什么时候？", "最喜欢我身上哪个部位？",
  "说一件你一直没敢告诉我的事", "我们之间最让你难忘的瞬间？",
  "如果可以重来，你还会选择我吗？", "你觉得我最大的优点是什么？",
  "最想和我一起去的地方？", "你心里我是什么样的人？",
  "最近一次因为我吃醋？", "说一个对我的小秘密",
];
const defaultDare = [
  "深情对视30秒不许笑", "用撒娇语气说三句话",
  "给对方一个1分钟的拥抱", "模仿对方生气的样子",
  "亲一下对方鼻尖", "说五句不同的情话",
  "给对方按摩肩膀2分钟", "十指相扣说我爱你",
  "在对方耳边说一句撩人的话", "喂对方吃一口东西",
];

export default function TruthGame() {
  const [players, setPlayers] = useState(["玩家1", "玩家2", "玩家3"]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [mode, setMode] = useState<"truth" | "dare">("truth");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [inOrder, setInOrder] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [showEditor, setShowEditor] = useState<"truth" | "dare" | null>(null);
  const [truthList, setTruthList] = useState(defaultTruth);
  const [dareList, setDareList] = useState(defaultDare);
  const [newQuestion, setNewQuestion] = useState("");

  const addPlayer = () => {
    if (players.length < 6) setPlayers([...players, `玩家${players.length + 1}`]);
  };
  const removePlayer = (i: number) => {
    if (players.length > 1) {
      const np = players.filter((_, idx) => idx !== i);
      setPlayers(np);
      if (currentPlayer >= np.length) setCurrentPlayer(0);
    }
  };
  const startEditPlayer = (i: number) => {
    setEditingPlayer(i);
    setEditName(players[i]);
  };
  const savePlayerName = () => {
    if (editingPlayer !== null && editName.trim()) {
      const np = [...players];
      np[editingPlayer] = editName.trim();
      setPlayers(np);
    }
    setEditingPlayer(null);
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult("");
    setSelectedPlayer("");
    const extra = 5 + Math.floor(Math.random() * 3);
    const angle = Math.floor(Math.random() * 360);
    setRotation(rotation + extra * 360 + angle);
    setTimeout(() => {
      setSpinning(false);
      let pickedIdx: number;
      if (inOrder) {
        pickedIdx = currentPlayer;
        setCurrentPlayer((p) => (p + 1) % players.length);
      } else {
        pickedIdx = Math.floor(Math.random() * players.length);
      }
      setSelectedPlayer(players[pickedIdx]);
      const pool = mode === "truth" ? truthList : dareList;
      setResult(pool[Math.floor(Math.random() * pool.length)]);
    }, 4200);
  };

  // 动态生成转盘扇形
  const wheelColors = ["#ec4899", "#8b5cf6", "#3b82f6", "#14b8a6", "#f59e0b", "#ef4444"];
  const segmentAngle = 360 / players.length;

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    if (showEditor === "truth") setTruthList([...truthList, newQuestion.trim()]);
    else setDareList([...dareList, newQuestion.trim()]);
    setNewQuestion("");
  };
  const removeQuestion = (type: "truth" | "dare", idx: number) => {
    if (type === "truth") setTruthList(truthList.filter((_, i) => i !== idx));
    else setDareList(dareList.filter((_, i) => i !== idx));
  };

  return (
    <>
      <LicenseGate gameName="真心话大冒险转盘">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-auto w-full max-w-4xl px-3.5 py-3 sm:px-6 sm:py-5">

        <div className="game-container">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="game-title">真心话大冒险转盘</h1>
            <div className="game-title-underline" />
            <p className="mt-3 text-sm text-white/60 sm:text-base">终极派对游戏。旋转转盘抽取题目，回答劲爆真心话或接受刺激大冒险</p>
          </div>
          <div className="border-t border-white/10 my-6" />

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {/* 转盘区域 */}
            <div className="md:col-span-2 flex flex-col items-center gap-5 sm:gap-6">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center w-full">
                <div className="text-xs text-white/50">当前回合</div>
                <div className="text-lg font-semibold text-pink-300">{players[currentPlayer]}</div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setMode("truth")} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === "truth" ? "bg-purple-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>真心话</button>
                <button onClick={() => setMode("dare")} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === "dare" ? "bg-pink-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>大冒险</button>
              </div>

              <div className="relative h-56 w-56 sm:h-64 sm:w-64">
                <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
                  <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-pink-400" />
                </div>
                <svg viewBox="0 0 200 200" className="wheel-spin h-full w-full drop-shadow-2xl" style={{ transform: `rotate(${rotation}deg)` }}>
                  {players.map((_, i) => {
                    const start = (i * segmentAngle - 90) * Math.PI / 180;
                    const end = ((i + 1) * segmentAngle - 90) * Math.PI / 180;
                    const x1 = 100 + 100 * Math.cos(start), y1 = 100 + 100 * Math.sin(start);
                    const x2 = 100 + 100 * Math.cos(end), y2 = 100 + 100 * Math.sin(end);
                    const largeArc = segmentAngle > 180 ? 1 : 0;
                    const midAngle = (i * segmentAngle + segmentAngle / 2 - 90) * Math.PI / 180;
                    const tx = 100 + 60 * Math.cos(midAngle);
                    const ty = 100 + 60 * Math.sin(midAngle);
                    return (
                      <g key={i}>
                        <path d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`} fill={wheelColors[i % wheelColors.length]} stroke="rgba(255,255,255,0.2)" />
                        <text x={tx} y={ty} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" transform={`rotate(${i * segmentAngle + segmentAngle / 2}, ${tx}, ${ty})`}>{players[i]}</text>
                      </g>
                    );
                  })}
                  <circle cx="100" cy="100" r="20" fill="#0f172a" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <text x="100" y="105" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">旋转</text>
                </svg>
              </div>

              {result && (
                <div className="w-full rounded-xl border border-pink-300/30 bg-pink-500/10 p-4 text-center fade-in-up">
                  {selectedPlayer && <div className="text-xs text-pink-300 mb-1">转盘选中：{selectedPlayer}</div>}
                  <div className={`mb-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${mode === "truth" ? "bg-purple-500/30 text-purple-200" : "bg-pink-500/30 text-pink-200"}`}>{mode === "truth" ? "真心话" : "大冒险"}</div>
                  <div className="text-base font-semibold">{result}</div>
                </div>
              )}

              <button onClick={spin} disabled={spinning} className="rounded-full bg-pink-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50">
                {spinning ? "旋转中..." : "🎯 转盘选人"}
              </button>
            </div>

            {/* 右侧控制面板 */}
            <div className="space-y-4">
              {/* 玩家管理 */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">玩家人数（{players.length}）</span>
                  <button onClick={addPlayer} className="rounded-full bg-pink-500 px-3 py-1 text-xs hover:bg-pink-400">+ 新增玩家</button>
                </div>
                <div className="space-y-2">
                  {players.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {editingPlayer === i ? (
                        <>
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && savePlayerName()} className="flex-1 rounded bg-white/10 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-400" autoFocus />
                          <button onClick={savePlayerName} className="text-green-400 text-xs">✓</button>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full" style={{ background: wheelColors[i % wheelColors.length] }} />
                          <span onClick={() => startEditPlayer(i)} className="flex-1 text-sm cursor-pointer hover:text-pink-300">{p}</span>
                          <button onClick={() => removePlayer(i)} className="text-white/40 hover:text-red-400 text-xs">✕</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 按顺序轮流 */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">按顺序轮流</span>
                  <button onClick={() => setInOrder(!inOrder)} className={`w-12 h-6 rounded-full transition ${inOrder ? "bg-pink-500" : "bg-white/20"}`}>
                    <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${inOrder ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>

              {/* 题库管理 */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold mb-2">题库管理</div>
                <p className="text-xs text-white/50 mb-3">打开编辑器修改内建题目，或新增自定义题目</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowEditor("truth")} className="flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">编辑真心题({truthList.length})</button>
                  <button onClick={() => setShowEditor("dare")} className="flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">编辑大冒险({dareList.length})</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-card">
          <p>请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
        </div>
      </div>

      {/* 题库编辑器弹窗 */}
      {showEditor && (
        <div className="modal-overlay" onClick={() => setShowEditor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">编辑{showEditor === "truth" ? "真心话" : "大冒险"}题库</h3>
            <div className="flex gap-2 mb-4">
              <input value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addQuestion()} placeholder="输入新题目..." className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-400/50" />
              <button onClick={addQuestion} className="rounded-lg bg-pink-500 px-4 py-2 text-sm text-white hover:bg-pink-400">添加</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(showEditor === "truth" ? truthList : dareList).map((q, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                  <span className="flex-1 text-sm">{q}</span>
                  <button onClick={() => removeQuestion(showEditor, i)} className="text-red-400 text-xs hover:text-red-300">删除</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowEditor(null)} className="w-full mt-4 rounded-full bg-pink-500 py-2 text-sm font-semibold text-white hover:bg-pink-400">完成</button>
          </div>
        </div>
      )}
          </LicenseGate>
        </>
  );
}
