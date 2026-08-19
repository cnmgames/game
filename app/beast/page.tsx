"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState, useEffect } from "react";

const beastNames = ["鼠", "猫", "狗", "狼", "豹", "虎", "狮", "象"];
const beastEmojis = ["🐭", "🐱", "🐶", "🐺", "🐆", "🐯", "🦁", "🐘"];
const defaultPenalties = ["卷下丝袜", "摘下首饰", "踢掉鞋子", "褪去外套", "解开衣领", "脱掉袜子", "摘下手表", "解开皮带"];

interface Piece { level: number; owner: 1 | 2; revealed: boolean; }

function initBoard(): (Piece | null)[] {
  const pieces: Piece[] = [];
  for (let i = 0; i < 8; i++) { pieces.push({ level: i, owner: 1, revealed: false }); pieces.push({ level: i, owner: 2, revealed: false }); }
  for (let i = pieces.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pieces[i], pieces[j]] = [pieces[j], pieces[i]]; }
  return pieces;
}

export default function BeastGame() {
  const [board, setBoard] = useState<(Piece | null)[]>([]);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("游戏开始！红方先手。");
  const [penalty, setPenalty] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [firstFlip, setFirstFlip] = useState(true);
  const [p1Penalties, setP1Penalties] = useState<string[]>([]);
  const [p2Penalties, setP2Penalties] = useState<string[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [penaltyList, setPenaltyList] = useState(defaultPenalties);
  const [enablePenalty, setEnablePenalty] = useState(true);
  const [leopardDiagonal, setLeopardDiagonal] = useState(false);

  useEffect(() => { initGame(); }, []);

  const initGame = () => {
    setBoard(initBoard()); setTurn(1); setSelected(null);
    setMessage("游戏开始！红方先手。"); setPenalty(""); setGameOver(false);
    setFirstFlip(true); setP1Penalties([]); setP2Penalties([]);
  };

  const canEat = (a: Piece, d: Piece): boolean => {
    if (a.level === 0 && d.level === 7) return true;
    if (a.level === 7 && d.level === 0) return false;
    return a.level >= d.level;
  };
  const isAdjacent = (a: number, b: number): boolean => {
    const ra = Math.floor(a / 4), ca = a % 4, rb = Math.floor(b / 4), cb = b % 4;
    const dist = Math.abs(ra - rb) + Math.abs(ca - cb);
    if (leopardDiagonal && board[a]?.level === 4) return dist <= 2 && dist > 0;
    return dist === 1;
  };

  const handleClick = (idx: number) => {
    if (gameOver) return;
    const piece = board[idx];
    if (piece && !piece.revealed) {
      const nb = [...board]; nb[idx] = { ...piece, revealed: true }; setBoard(nb); setSelected(null);
      if (firstFlip) {
        setFirstFlip(false); setTurn(piece.owner);
        setMessage(`${piece.owner === 1 ? "🔥红方" : "❄️蓝方"}翻到己方棋子，${piece.owner === 1 ? "红方" : "蓝方"}先手！`);
      } else {
        setMessage(`翻开了${piece.owner === 1 ? "🔥红方" : "❄️蓝方"}的${beastEmojis[piece.level]}${beastNames[piece.level]}`);
        setTurn(turn === 1 ? 2 : 1);
      }
      return;
    }
    if (piece && piece.revealed && piece.owner === turn) {
      setSelected(idx); setMessage(`选中${beastEmojis[piece.level]}${beastNames[piece.level]}，点击相邻格移动`); return;
    }
    if (selected !== null && isAdjacent(selected, idx)) {
      const attacker = board[selected]!; const nb = [...board];
      if (!piece) {
        nb[idx] = attacker; nb[selected] = null; setBoard(nb);
        setMessage(`${attacker.owner === 1 ? "🔥" : "❄️"}${beastEmojis[attacker.level]}移动`);
        setSelected(null); setTurn(turn === 1 ? 2 : 1);
      } else if (piece.revealed && piece.owner !== turn) {
        if (canEat(attacker, piece)) {
          nb[idx] = attacker; nb[selected] = null; setBoard(nb);
          if (enablePenalty) {
            const p = penaltyList[Math.floor(Math.random() * penaltyList.length)];
            setPenalty(`${piece.owner === 1 ? "🔥红方" : "❄️蓝方"}的${beastEmojis[piece.level]}被吃！惩罚：${p}`);
            if (piece.owner === 1) setP1Penalties((prev) => [...prev, p]); else setP2Penalties((prev) => [...prev, p]);
          }
          setMessage(`吃掉了对方的${beastEmojis[piece.level]}${beastNames[piece.level]}！`);
          const rem = nb.filter((p) => p && p.revealed && p.owner === piece.owner);
          const unrev = nb.filter((p) => p && !p.revealed && p.owner === piece.owner);
          if (rem.length === 0 && unrev.length === 0) { setGameOver(true); setMessage(`🎉 ${attacker.owner === 1 ? "红方" : "蓝方"}获胜！`); }
          setSelected(null); setTurn(turn === 1 ? 2 : 1);
        } else { setMessage(`${beastEmojis[attacker.level]}吃不了${beastEmojis[piece.level]}！`); setSelected(null); }
      } else setSelected(null);
    } else setSelected(null);
  };

  return (
    <>
      <LicenseGate gameName="火辣暗兽棋">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-4xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4"><Link href="/" className="back-btn">← 返回游戏列表</Link></div>

        <div className="game-container">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="game-title">火辣暗兽棋</h1>
            <div className="game-title-underline" />
            <p className="mt-3 text-sm text-white/60 sm:text-base">翻牌、博弈、宽衣。心跳加速的策略对决。</p>
          </div>
          <div className="border-t border-white/10 my-6" />


          <div className="grid md:grid-cols-4 gap-4 sm:gap-6">
            {/* 红方惩罚记录 */}
            <div className="rounded-xl border border-red-400/30 bg-black/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-red-300">🔥 红方</span>
                <span className="text-xs text-white/50">{p1Penalties.length}/8</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {p1Penalties.length === 0 ? <div className="text-xs text-white/30">暂无惩罚</div> :
                  p1Penalties.map((p, i) => <div key={i} className="text-xs text-red-200/70">• {p}</div>)}
              </div>
            </div>

            {/* 棋盘 */}
            <div className="md:col-span-2">
              <div className="mx-auto grid w-full max-w-xs grid-cols-4 gap-2">
                {board.map((piece, i) => (
                  <button key={i} onClick={() => handleClick(i)} className={`aspect-square rounded-xl border text-2xl sm:text-3xl transition-all ${
                    selected === i ? "border-yellow-400 bg-yellow-500/20 ring-2 ring-yellow-400/50" :
                    piece && piece.revealed ? piece.owner === 1 ? "border-orange-400/40 bg-orange-500/10" : "border-blue-400/40 bg-blue-500/10" :
                    "border-white/10 bg-white/10 hover:border-pink-300/40 hover:bg-white/15"}`}>
                    {piece ? (piece.revealed ? beastEmojis[piece.level] : "❓") : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* 蓝方惩罚记录 */}
            <div className="rounded-xl border border-blue-400/30 bg-black/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-300">❄️ 蓝方</span>
                <span className="text-xs text-white/50">{p2Penalties.length}/8</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {p2Penalties.length === 0 ? <div className="text-xs text-white/30">暂无惩罚</div> :
                  p2Penalties.map((p, i) => <div key={i} className="text-xs text-blue-200/70">• {p}</div>)}
              </div>
            </div>
          </div>

          {/* 回合指示 */}
          <div className="mb-6 flex justify-center gap-3 sm:gap-4 sm:mb-8">
            <div className={`rounded-full px-4 py-2 text-sm transition ${turn === 1 && !firstFlip ? "bg-orange-500/30 text-orange-200 ring-1 ring-orange-400/50" : "bg-white/5 text-white/50"}`}>🔥 红方 {turn === 1 && !firstFlip && "行动中"}</div>
            <div className={`rounded-full px-4 py-2 text-sm transition ${turn === 2 && !firstFlip ? "bg-blue-500/30 text-blue-200 ring-1 ring-blue-400/50" : "bg-white/5 text-white/50"}`}>❄️ 蓝方 {turn === 2 && !firstFlip && "行动中"}</div>
          </div>

          <div className="mb-6 min-h-[40px] rounded-xl border border-white/10 bg-black/20 p-3 text-center text-sm sm:mb-8">{message}</div>
          {penalty && <div className="mb-6 rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-center text-sm text-red-200 fade-in-up sm:mb-8">{penalty}</div>}
          {gameOver && <div className="mb-6 rounded-xl border border-yellow-300/30 bg-yellow-500/10 p-4 text-center sm:mb-8"><div className="text-lg font-bold text-yellow-300">{message}</div></div>}

          <div className="mt-6 flex justify-center gap-3 flex-wrap sm:mt-8">
            <button onClick={() => setShowRules(true)} className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-white/80 hover:bg-white/10">❓ 玩法说明</button>
            <button onClick={() => setShowSettings(true)} className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-white/80 hover:bg-white/10">⚙️ 游戏设置</button>
            <button onClick={initGame} className="rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 hover:bg-pink-400">🔄 重新开始</button>
          </div>
        </div>

        <div className="footer-card">
          <p>请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
        </div>
      </div>

      {/* 玩法说明弹窗 */}
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">❓ 玩法说明</h3>
            <div className="space-y-2 text-sm text-white/80">
              <p>• 4x4棋盘，双方各8枚棋子（鼠🐭→象🐘）</p>
              <p>• 点击覆盖的棋子翻牌，第一次翻牌决定先手</p>
              <p>• 大吃小，同级同归于尽；鼠🐭可以吃象🐘</p>
              <p>• 被吃棋子的一方接受惩罚</p>
              <p>• 率先吃掉对方所有棋子者获胜</p>
            </div>
            <button onClick={() => setShowRules(false)} className="w-full mt-4 rounded-full bg-pink-500 py-2 text-sm font-semibold text-white hover:bg-pink-400">知道了</button>
          </div>
        </div>
      )}

      {/* 游戏设置弹窗 */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">⚙️ 游戏设置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">启用惩罚机制</span>
                <button onClick={() => setEnablePenalty(!enablePenalty)} className={`w-12 h-6 rounded-full transition ${enablePenalty ? "bg-pink-500" : "bg-white/20"}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${enablePenalty ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">猎豹可斜行（4级）</span>
                <button onClick={() => setLeopardDiagonal(!leopardDiagonal)} className={`w-12 h-6 rounded-full transition ${leopardDiagonal ? "bg-pink-500" : "bg-white/20"}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${leopardDiagonal ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">惩罚列表（{penaltyList.length}）</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {penaltyList.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="flex-1">{p}</span>
                      <button onClick={() => setPenaltyList(penaltyList.filter((_, idx) => idx !== i))} className="text-red-400">删除</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full mt-4 rounded-full bg-pink-500 py-2 text-sm font-semibold text-white hover:bg-pink-400">保存</button>
          </div>
        </div>
      )}
          </LicenseGate>
        </>
  );
}
