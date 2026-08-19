"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState } from "react";

const defaultEvents = [
  { type: "start", text: "起点", color: "bg-green-500/20 border-green-400/50" },
  { type: "event", text: "互夸3个优点", color: "bg-pink-500/10" },
  { type: "event", text: "拥抱30秒", color: "bg-purple-500/10" },
  { type: "reward", text: "前进2格 🎁", color: "bg-yellow-500/10" },
  { type: "event", text: "说一句情话", color: "bg-pink-500/10" },
  { type: "event", text: "亲一下额头", color: "bg-purple-500/10" },
  { type: "penalty", text: "后退1格 ⬅️", color: "bg-red-500/10" },
  { type: "event", text: "按摩肩膀1分钟", color: "bg-pink-500/10" },
  { type: "event", text: "深情对视20秒", color: "bg-purple-500/10" },
  { type: "reward", text: "再来一次 🎲", color: "bg-yellow-500/10" },
  { type: "event", text: "交换小秘密", color: "bg-pink-500/10" },
  { type: "event", text: "喂对方一口水", color: "bg-purple-500/10" },
  { type: "event", text: "十指相扣1分钟", color: "bg-pink-500/10" },
  { type: "penalty", text: "停一轮 ⏸️", color: "bg-red-500/10" },
  { type: "event", text: "唱一句情歌", color: "bg-purple-500/10" },
  { type: "end", text: "终点 🏆", color: "bg-yellow-500/20 border-yellow-400/50" },
];

export default function MonopolyGame() {
  const [events, setEvents] = useState(defaultEvents);
  const [pos, setPos] = useState(0);
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("双骰出击，囤积亲密互动");
  const [currentEvent, setCurrentEvent] = useState("");
  const [skipTurn, setSkipTurn] = useState(false);
  const [showDev, setShowDev] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  const roll = () => {
    if (rolling) return;
    if (skipTurn) {
      setMessage("这一轮被跳过了，再掷一次继续！");
      setSkipTurn(false);
      return;
    }
    setRolling(true);
    setCurrentEvent("");
    let count = 0;
    const anim = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 8) {
        clearInterval(anim);
        const final = Math.floor(Math.random() * 6) + 1;
        setDice(final);
        setRolling(false);
        const newPos = Math.min(pos + final, events.length - 1);
        setPos(newPos);
        setMessage(`掷出 ${final} 点，前进到第 ${newPos} 格`);
        const event = events[newPos];
        if (event.type === "end") {
          setCurrentEvent("🎉 恭喜到达终点！你们完成了午夜大冒险！");
        } else if (event.type === "reward" && event.text.includes("前进")) {
          setCurrentEvent(event.text);
          setTimeout(() => {
            const bp = Math.min(newPos + 2, events.length - 1);
            setPos(bp);
            setMessage(`奖励前进2格，到第 ${bp} 格`);
            if (events[bp].type === "end") setCurrentEvent("🎉 恭喜到达终点！");
            else setCurrentEvent(events[bp].text);
          }, 1000);
        } else if (event.type === "reward") {
          setCurrentEvent(event.text);
        } else if (event.type === "penalty" && event.text.includes("后退")) {
          setCurrentEvent(event.text);
          setTimeout(() => {
            const pp = Math.max(newPos - 1, 0);
            setPos(pp);
            setMessage(`后退1格，到第 ${pp} 格`);
          }, 1000);
        } else if (event.type === "penalty") {
          setCurrentEvent(event.text);
          setSkipTurn(true);
        } else {
          setCurrentEvent(event.text);
        }
      }
    }, 80);
  };

  const reset = () => {
    setPos(0); setDice(0); setMessage("双骰出击，囤积亲密互动");
    setCurrentEvent(""); setSkipTurn(false);
  };

  const openEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditText(events[idx].text);
  };

  const saveEdit = () => {
    if (editingIdx !== null) {
      const newEvents = [...events];
      newEvents[editingIdx] = { ...newEvents[editingIdx], text: editText };
      setEvents(newEvents);
    }
    setEditingIdx(null);
  };

  const resetEvents = () => {
    setEvents(defaultEvents);
    setEditMode(false);
  };

  return (
    <>
      <LicenseGate gameName="午夜大富翁">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4">
          <Link href="/" className="back-btn">← 返回游戏列表</Link>
        </div>

        <div className="game-container">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="game-title">午夜大富翁</h1>
            <div className="game-title-underline" />
            <p className="mt-3 text-sm text-white/60 sm:text-base">绕着棋盘冒险，每一站都有欲望事件等待完成。</p>
          </div>
          <div className="border-t border-white/10 my-6" />

          {/* 编辑模式按钮 */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button onClick={() => setEditMode(!editMode)} className={`rounded-full border px-4 py-2 text-xs transition ${editMode ? "border-pink-400 bg-pink-500/20 text-pink-200" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"}`}>
              ✏️ {editMode ? "退出编辑模式" : "进入编辑模式"}
            </button>
            {editMode && (
              <button onClick={resetEvents} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10">
                🔄 恢复默认
              </button>
            )}
          </div>

          {editMode && (
            <div className="mb-6 rounded-xl border border-pink-300/30 bg-pink-500/10 p-3 text-xs text-pink-200">
              ✏️ 编辑模式：点击任意格子修改事件内容
            </div>
          )}

          {showDev && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-yellow-300/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
              <span>⚠️ 功能开发中，当前为体验版。完整版本欢迎加入 Discord 催更</span>
              <button onClick={() => setShowDev(false)} className="shrink-0 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-100 hover:bg-yellow-500/30 transition">知道了</button>
            </div>
          )}

          <div className="mb-6 text-center">
            <span className="inline-block rounded-full border border-white/15 bg-black/40 px-5 py-2 text-sm">
              当前位置：<span className="font-bold text-pink-300">{pos}</span> / {events.length - 1}
            </span>
          </div>

          {/* 棋盘 */}
          <div className="mb-8 grid grid-cols-4 gap-1.5 sm:gap-2">
            {events.map((e, i) => (
              <button
                key={i}
                onClick={() => editMode && openEdit(i)}
                className={`relative aspect-square rounded-lg border p-1 text-center text-[9px] sm:text-[11px] flex items-center justify-center transition-all ${
                  i === pos ? "border-pink-400 bg-pink-500/30 ring-2 ring-pink-400/50 scale-105" : e.color
                } border-white/10 ${editMode ? "cursor-pointer hover:border-pink-400/50 hover:bg-pink-500/10" : ""}`}
              >
                <span className="leading-tight">{e.text}</span>
                {i === pos && <span className="absolute -top-2 -right-2 text-base">📍</span>}
              </button>
            ))}
          </div>

          {currentEvent && (
            <div className="mb-6 rounded-xl border border-pink-300/30 bg-pink-500/10 p-4 text-center fade-in-up">
              <div className="text-xs text-pink-300 mb-1">触发事件</div>
              <div className="text-base font-semibold">{currentEvent}</div>
            </div>
          )}

          <div className="mb-8 text-center text-sm text-white/70">{message}</div>

          <div className="mb-8 flex flex-col items-center gap-6 sm:gap-8">
            <div className={`text-6xl sm:text-7xl ${rolling ? "dice-rolling" : ""}`}>{dice > 0 ? diceFaces[dice] : "🎲"}</div>
            <div className="flex gap-3 sm:gap-4">
              <button onClick={roll} disabled={rolling || editMode} className="rounded-full bg-pink-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50">
                {rolling ? "掷骰中..." : "🎲 掷骰子前进"}
              </button>
              <button onClick={reset} className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 transition">重新开始</button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5 text-center">
            <p className="mb-3 text-sm text-white/60">完整功能开发中，欢迎加入 Discord 催更</p>
            <button className="rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition">加入 Discord</button>
          </div>
        </div>

        <div className="footer-card">
          <p>请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
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
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-400/50 min-h-[80px]"
              placeholder="输入事件内容..."
            />
            <div className="flex gap-3 mt-4">
              <button onClick={saveEdit} className="flex-1 rounded-full bg-pink-500 py-2 text-sm font-semibold text-white hover:bg-pink-400">保存</button>
              <button onClick={() => setEditingIdx(null)} className="flex-1 rounded-full border border-white/20 bg-white/5 py-2 text-sm text-white/70 hover:bg-white/10">取消</button>
            </div>
          </div>
        </div>
      )}
      </LicenseGate>
    </>
  );
}
