"use client";
import Link from "next/link";
import { useState, useCallback } from "react";

const defaultEvents = [
  { text: "对视10秒不许笑", color: "from-pink-500 to-rose-500" },
  { text: "夸对方3个优点", color: "from-pink-500 to-rose-500" },
  { text: "拥抱30秒", color: "from-pink-500 to-rose-500" },
  { text: "说一句情话", color: "from-pink-500 to-rose-500" },
  { text: "亲一下额头", color: "from-pink-500 to-rose-500" },
  { text: "模仿对方动作", color: "from-purple-500 to-violet-500" },
  { text: "后背写字猜词", color: "from-pink-500 to-rose-500" },
  { text: "喂对方一口水", color: "from-pink-500 to-rose-500" },
  { text: "十指相扣1分钟", color: "from-pink-500 to-rose-500" },
  { text: "说第一次心动瞬间", color: "from-purple-500 to-violet-500" },
  { text: "按摩肩膀1分钟", color: "from-pink-500 to-rose-500" },
  { text: "深情告白30秒", color: "from-pink-500 to-rose-500" },
  { text: "交换一个小秘密", color: "from-pink-500 to-rose-500" },
  { text: "公主抱或背起", color: "from-yellow-500 to-amber-500" },
  { text: "鼻尖碰鼻尖10秒", color: "from-pink-500 to-rose-500" },
  { text: "用眼神传达爱意", color: "from-purple-500 to-violet-500" },
  { text: "唱一句情歌", color: "from-pink-500 to-rose-500" },
  { text: "画对方速写", color: "from-pink-500 to-rose-500" },
  { text: "说最想一起做的事", color: "from-pink-500 to-rose-500" },
  { text: "感谢对方一件小事", color: "from-blue-500 to-cyan-500" },
  { text: "许下一个小愿望", color: "from-pink-500 to-rose-500" },
  { text: "甜蜜拥抱", color: "from-pink-500 to-rose-500" },
  { text: "说最爱的瞬间", color: "from-pink-500 to-rose-500" },
  { text: "亲一下手背", color: "from-pink-500 to-rose-500" },
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
          setCurrentEvent(events[newPos].text);
          addLog(`🎲 ${name}掷出${final}：${events[newPos].text}`);
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
    setEditText(events[idx].text);
  };

  const saveEdit = () => {
    if (editingIdx !== null) {
      const newEvents = [...events];
      newEvents[editingIdx] = { ...newEvents[editingIdx], text: editText || events[editingIdx].text };
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

  // 中间通道的格子（第2-4行，第2-3列）
  const isCenterPath = (row: number, col: number) => {
    return row >= 1 && row <= 4 && col >= 2 && col <= 3;
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-5xl px-2 py-3 sm:px-4 sm:py-6">
        <div className="mb-3">
          <Link href="/" className="back-btn">← 返回游戏列表</Link>
        </div>

        <div className="game-container !p-3 sm:!p-5">
          {/* 标题 */}
          <div className="text-center mb-3 sm:mb-5">
            <h1 className="game-title !text-2xl sm:!text-4xl">情侣飞行棋</h1>
            <div className="game-title-underline" />
            <p className="mt-2 text-xs text-white/60 sm:text-sm">🎲 掷出6开始游戏，体验每个格子的刺激事件</p>
          </div>

          {/* 顶部按钮 */}
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            <button onClick={() => setEditMode(!editMode)} className={`rounded-full border px-3 py-1.5 text-xs transition ${editMode ? "border-pink-400 bg-pink-500/20 text-pink-200" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"}`}>
              ✏️ {editMode ? "退出编辑" : "进入编辑模式"}
            </button>
            <button onClick={() => setShowRules(true)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10">⚙️ 规则选项 ▾</button>
            <button onClick={reset} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10">🔄 重置</button>
          </div>

          {editMode && (
            <div className="mb-3 rounded-lg border border-pink-300/30 bg-pink-500/10 p-2 text-xs text-pink-200 text-center">
              ✏️ 点击任意格子修改事件
              <button onClick={resetEvents} className="ml-2 underline hover:text-pink-100">恢复默认</button>
            </div>
          )}

          {/* 玩家状态 */}
          <div className="mb-3 flex justify-center gap-4 text-xs">
            <span className={`flex items-center gap-1 ${turn === 1 ? "text-blue-300" : "text-white/50"}`}>
              <span className="w-2 h-2 rounded-full bg-blue-400" /> 男方 {p1Out ? `(${p1Pos + 1})` : "(未出)"}
            </span>
            <span className={`flex items-center gap-1 ${turn === 2 ? "text-pink-300" : "text-white/50"}`}>
              <span className="w-2 h-2 rounded-full bg-pink-400" /> 女方 {p2Out ? `(${p2Pos + 1})` : "(未出)"}
            </span>
          </div>

          {/* 大棋盘 - 彩色渐变边框 */}
          <div className="relative mx-auto aspect-square w-full max-w-3xl rounded-xl p-[3px] bg-gradient-to-br from-red-500 via-purple-500 to-green-500">
            <div className="relative h-full w-full rounded-lg bg-black p-1.5 sm:p-2">
              <div className="grid h-full grid-cols-6 grid-rows-6 gap-0.5 sm:gap-1">
                {Array.from({ length: 36 }).map((_, i) => {
                  const row = Math.floor(i / 6), col = i % 6;
                  const idx = getBoardIdx(row, col);

                  // 中间通道
                  if (isCenterPath(row, col)) {
                    const isPathCol = col === 2 || col === 3;
                    const planePositions = [1, 2, 3]; // 中间行显示飞机
                    const showPlane = isPathCol && planePositions.includes(row - 1);
                    return (
                      <div key={i} className={`flex items-center justify-center ${isPathCol ? "bg-gradient-to-b from-pink-500/20 to-purple-500/20" : ""}`}>
                        {showPlane && <span className="text-lg sm:text-2xl opacity-60">✈️</span>}
                      </div>
                    );
                  }

                  // 中间空白（心形区域）
                  if (idx === -1) {
                    return (
                      <div key={i} className="flex items-center justify-center">
                        {row === 1 && col === 1 && <span className="text-xl sm:text-3xl">❤️</span>}
                      </div>
                    );
                  }

                  const event = events[idx];
                  const p1Here = p1Out && p1Pos === idx;
                  const p2Here = p2Out && p2Pos === idx;
                  const isStart = idx === 0;
                  const isEnd = idx === events.length - 1;

                  return (
                    <button
                      key={i}
                      onClick={() => editMode && openEdit(idx)}
                      className={`relative flex items-center justify-center rounded bg-gradient-to-br ${event.color} p-0.5 text-center text-[8px] leading-tight text-white shadow-md transition-all hover:scale-105 hover:shadow-lg sm:text-[10px] ${
                        p1Here || p2Here ? "ring-2 ring-white ring-offset-1 ring-offset-black scale-105" : ""
                      } ${isStart ? "ring-2 ring-green-400" : ""} ${isEnd ? "ring-2 ring-yellow-400" : ""} ${editMode ? "cursor-pointer" : ""}`}
                    >
                      <span className="line-clamp-3 px-0.5 font-medium drop-shadow">{event.text}</span>
                      {p1Here && <span className="absolute -top-1 -left-1 text-sm sm:text-base">✈️</span>}
                      {p2Here && <span className="absolute -bottom-1 -right-1 text-sm sm:text-base">✈️</span>}
                      {isStart && <span className="absolute -top-1 -right-1 text-[8px] bg-green-500 rounded px-1">起</span>}
                      {isEnd && <span className="absolute -top-1 -right-1 text-[8px] bg-yellow-500 rounded px-1">终</span>}
                    </button>
                  );
                })}
              </div>

              {/* 中间浮动操作面板 */}
              <div className="absolute left-1/2 top-1/2 z-10 w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/20 bg-black/90 p-2 text-center shadow-2xl backdrop-blur-xl sm:p-3">
                <div className="mb-1 text-[10px] text-white/60 sm:text-xs">
                  {turn === 1 ? "♂ 男方" : "♀ 女方"} 当前行动
                </div>
                <div className={`mb-1 text-2xl sm:text-4xl ${rolling ? "dice-rolling" : ""}`}>
                  {dice > 0 ? diceFaces[dice] : "🎲"}
                </div>
                <div className="mb-2 min-h-[24px] text-[10px] text-pink-200 sm:text-xs line-clamp-2">
                  {currentEvent}
                </div>
                <button
                  onClick={rollDice}
                  disabled={rolling || editMode}
                  className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-1.5 text-xs font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:from-pink-400 hover:to-purple-400 disabled:opacity-50 sm:py-2 sm:text-sm"
                >
                  {rolling ? "掷骰中..." : "🎲 掷骰子"}
                </button>
              </div>
            </div>
          </div>

          {/* 游戏记录 */}
          {logs.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="mb-2 text-xs font-semibold text-white/60">📚 游戏记录</div>
              <div className="max-h-24 space-y-1 overflow-y-auto">
                {logs.map((log, i) => <div key={i} className="text-[10px] text-white/70 sm:text-xs">{log}</div>)}
              </div>
            </div>
          )}
        </div>

        {/* 底部介绍 */}
        <div className="mt-8 space-y-8 sm:mt-12 sm:space-y-12">
          <div>
            <h2 className="mb-4 text-lg font-bold text-pink-400 sm:text-xl">什么是情侣飞行棋？</h2>
            <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
              情侣飞行棋（Couples Ludo）是经典飞行棋的浪漫升级版，专为情侣、夫妻和亲密伴侣设计。棋盘上的每一个格子都藏着精心设计的互动任务，从真心话大冒险到亲密肢体接触，旨在打破隔阂、升温感情。游戏支持自定义事件库，无需下载APP，打开网页即可即时体验。
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-lg font-bold text-pink-400 sm:text-xl">游戏规则</h2>
            <ul className="space-y-2 text-xs text-white/70 sm:text-sm">
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-pink-400" /><span><strong className="text-white/90">掷骰子：</strong>玩家轮流掷骰子，只有掷出6点才能起飞。</span></li>
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-pink-400" /><span><strong className="text-white/90">行进与任务：</strong>根据点数移动棋子，停在哪个格子就执行对应任务。</span></li>
              <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-pink-400" /><span><strong className="text-white/90">特殊机制：</strong>掷出6点可再掷一次（可在规则选项中关闭）。</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-card !mt-6 !p-3">
          <p className="text-[10px] sm:text-xs">请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
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
