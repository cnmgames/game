"use client";
import Link from "next/link";
import { useState, useCallback } from "react";

const defaultEvents = [
  "对视10秒不许笑", "夸对方3个优点", "拥抱30秒", "说一句情话",
  "亲一下额头", "模仿对方动作", "后背写字猜词", "喂对方一口水",
  "十指相扣1分钟", "说第一次心动瞬间", "按摩肩膀1分钟", "深情告白30秒",
  "交换一个小秘密", "公主抱或背起", "鼻尖碰鼻尖10秒", "用眼神传达爱意",
  "唱一句情歌", "画对方速写", "说最想一起做的事", "感谢对方一件小事",
  "许下一个小愿望", "甜蜜拥抱", "说最爱的瞬间", "亲一下手背",
];

export default function FlightGame() {
  const [events, setEvents] = useState(defaultEvents);
  const [p1Out, setP1Out] = useState(false);
  const [p2Out, setP2Out] = useState(false);
  const [p1Pos, setP1Pos] = useState(0);
  const [p2Pos, setP2Pos] = useState(0);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [currentEvent, setCurrentEvent] = useState("掷出6开始游戏");
  const [logs, setLogs] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [rules, setRules] = useState({ sixAgain: true, canBump: false });

  const addLog = (msg: string) => setLogs((p) => [msg, ...p].slice(0, 20));

  const rollDice = useCallback(() => {
    if (rolling || editMode) return;
    setRolling(true);
    setDice(0);
    let count = 0;
    const anim = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 8) {
        clearInterval(anim);
        const final = Math.floor(Math.random() * 6) + 1;
        setDice(final);
        setRolling(false);
        const name = turn === 1 ? "男方" : "女方";
        const isOut = turn === 1 ? p1Out : p2Out;
        if (!isOut) {
          if (final === 6) {
            if (turn === 1) { setP1Out(true); setP1Pos(0); }
            else { setP2Out(true); setP2Pos(0); }
            setCurrentEvent(`${name}掷出6，飞机起飞！`);
            addLog(`🎲 ${name}掷出6，出列！`);
          } else {
            setCurrentEvent(`${name}掷出${final}，需要掷出6才能出发`);
            addLog(`🎲 ${name}掷出${final}，未出列`);
            setTurn(turn === 1 ? 2 : 1);
          }
        } else {
          const curPos = turn === 1 ? p1Pos : p2Pos;
          const newPos = (curPos + final) % events.length;
          if (turn === 1) setP1Pos(newPos); else setP2Pos(newPos);
          setCurrentEvent(events[newPos]);
          addLog(`🎲 ${name}掷出${final}：${events[newPos]}`);
          if (final !== 6 || !rules.sixAgain) setTurn(turn === 1 ? 2 : 1);
          else addLog(`✨ ${name}掷出6，再掷一次！`);
        }
      }
    }, 80);
  }, [rolling, turn, p1Out, p2Out, p1Pos, p2Pos, editMode, events, rules]);

  const reset = () => {
    setP1Out(false); setP2Out(false); setP1Pos(0); setP2Pos(0);
    setTurn(1); setDice(0); setCurrentEvent("掷出6开始游戏"); setLogs([]);
  };

  const openEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditText(events[idx]);
  };

  const saveEdit = () => {
    if (editingIdx !== null) {
      const newEvents = [...events];
      newEvents[editingIdx] = editText || events[editingIdx];
      setEvents(newEvents);
    }
    setEditingIdx(null);
    setEditText("");
  };

  const resetEvents = () => {
    setEvents(defaultEvents);
    setEditingIdx(null);
  };

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const getBoardIdx = (row: number, col: number): number => {
    if (row === 0) return col;
    if (col === 5) return 5 + (row - 1);
    if (row === 5) return 9 + (5 - col);
    if (col === 0) return 14 + (5 - row);
    return -1;
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-5xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4">
          <Link href="/" className="back-btn">← 返回游戏列表</Link>
        </div>

        <div className="game-container">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="game-title">情侣飞行棋</h1>
            <div className="game-title-underline" />
            <p className="mt-3 text-sm text-white/60 sm:text-base">🎲 掷出6开始游戏，体验每个格子的刺激事件</p>
          </div>
          <div className="border-t border-white/10 my-6" />

          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setEditMode(!editMode)} className={`rounded-full border px-4 py-2 text-xs transition ${editMode ? "border-pink-400 bg-pink-500/20 text-pink-200" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"}`}>
              ✏️ {editMode ? "退出编辑模式" : "进入编辑模式"}
            </button>
            <button onClick={() => setShowRules(true)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10">⚙️ 规则选项 ▾</button>
            <button onClick={() => window.open("https://discord.com", "_blank")} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10">💬 Discord</button>
          </div>

          {editMode && (
            <div className="rounded-xl border border-pink-300/30 bg-pink-500/10 p-3 text-xs text-pink-200">
              ✏️ 编辑模式：点击任意格子修改事件内容
              <button onClick={resetEvents} className="ml-3 underline hover:text-pink-100">恢复默认</button>
            </div>
          )}

          {/* 棋盘 */}
          <div className="relative mx-auto aspect-square w-full max-w-md rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="grid h-full grid-cols-6 grid-rows-6 gap-1">
              {Array.from({ length: 36 }).map((_, i) => {
                const row = Math.floor(i / 6), col = i % 6;
                const idx = getBoardIdx(row, col);
                if (idx === -1) {
                  return (
                    <div key={i} className="flex items-center justify-center">
                      {row === 1 && col === 1 && <span className="text-2xl">🔻</span>}
                      {row === 1 && col === 2 && <span className="text-3xl">❤️</span>}
                      {row === 2 && col === 1 && <span className="text-2xl">🔻</span>}
                    </div>
                  );
                }
                const p1Here = p1Out && p1Pos === idx;
                const p2Here = p2Out && p2Pos === idx;
                return (
                  <button
                    key={i}
                    onClick={() => editMode && openEdit(idx)}
                    className={`relative flex items-center justify-center rounded border text-[9px] text-center p-0.5 transition-all ${
                      p1Here || p2Here ? "border-pink-400/60 bg-pink-500/20" : "border-white/10 bg-white/5"
                    } ${editMode ? "cursor-pointer hover:border-pink-400/50 hover:bg-pink-500/10" : ""}`}
                  >
                    <span className="text-white/40 leading-tight line-clamp-2">{events[idx]}</span>
                    {p1Here && <span className="absolute -top-1 -left-1 text-sm">✈️</span>}
                    {p2Here && <span className="absolute -bottom-1 -right-1 text-sm">✈️</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl border p-3 text-center ${turn === 1 ? "border-blue-400/60 bg-blue-500/10" : "border-white/10 bg-white/5"}`}>
              <div className="text-sm font-semibold">♂ 男方</div>
              <div className="text-xs text-white/60">{p1Out ? `位置 ${p1Pos + 1}` : "未出列"}</div>
            </div>
            <div className={`rounded-xl border p-3 text-center ${turn === 2 ? "border-pink-400/60 bg-pink-500/10" : "border-white/10 bg-white/5"}`}>
              <div className="text-sm font-semibold">♀ 女方</div>
              <div className="text-xs text-white/60">{p2Out ? `位置 ${p2Pos + 1}` : "未出列"}</div>
            </div>
          </div>

          <div className="rounded-xl border border-pink-300/30 bg-pink-500/10 p-4 text-center">
            <div className="text-xs text-pink-300 mb-1">🎯 当前事件</div>
            <div className="text-base font-semibold">{currentEvent}</div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className={`text-6xl sm:text-7xl ${rolling ? "dice-rolling" : ""}`}>{dice > 0 ? diceFaces[dice] : "🎲"}</div>
            <div className="flex gap-3 sm:gap-4">
              <button onClick={rollDice} disabled={rolling || editMode} className="rounded-full bg-pink-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50">
                {rolling ? "掷骰中..." : `🎲 ${turn === 1 ? "男方" : "女方"}掷骰子`}
              </button>
              <button onClick={reset} className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">重置</button>
            </div>
          </div>

          {logs.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/60 mb-2">📚 游戏记录</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {logs.map((log, i) => <div key={i} className="text-xs text-white/70">{log}</div>)}
              </div>
            </div>
          )}
        </div>

        <div className="footer-card">
          <p>请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
          <p className="mt-2">© 2024 ~ 2026 www.hoothin.com</p>
        </div>
      </div>

      {/* 编辑事件弹窗 */}
      {editingIdx !== null && (
        <div className="modal-overlay" onClick={() => setEditingIdx(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">编辑第 {editingIdx + 1} 格事件</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full h-24 rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white resize-none focus:outline-none focus:border-pink-400/50"
              placeholder="输入事件内容..."
            />
            <div className="flex gap-3 mt-4">
              <button onClick={saveEdit} className="flex-1 rounded-full bg-pink-500 py-2 text-sm font-semibold text-white hover:bg-pink-400">保存</button>
              <button onClick={() => setEditingIdx(null)} className="flex-1 rounded-full border border-white/20 bg-white/5 py-2 text-sm text-white/80 hover:bg-white/10">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 规则选项弹窗 */}
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">⚙️ 规则选项</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">掷出6可再掷一次</span>
                <button onClick={() => setRules({ ...rules, sixAgain: !rules.sixAgain })} className={`w-12 h-6 rounded-full transition ${rules.sixAgain ? "bg-pink-500" : "bg-white/20"}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${rules.sixAgain ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">可将对方棋子撞回基地</span>
                <button onClick={() => setRules({ ...rules, canBump: !rules.canBump })} className={`w-12 h-6 rounded-full transition ${rules.canBump ? "bg-pink-500" : "bg-white/20"}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${rules.canBump ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </label>
            </div>
            <button onClick={() => setShowRules(false)} className="w-full mt-6 rounded-full bg-pink-500 py-2 text-sm font-semibold text-white hover:bg-pink-400">确定</button>
          </div>
        </div>
      )}
    </>
  );
}
