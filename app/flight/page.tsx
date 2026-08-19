"use client";
import Link from "next/link";
import { useState, useCallback } from "react";

const boardEvents = [
  "对视10秒不许笑", "夸对方3个优点", "拥抱30秒", "说一句情话",
  "亲一下额头", "模仿对方动作", "后背写字猜词", "喂对方一口水",
  "十指相扣1分钟", "说第一次心动瞬间", "按摩肩膀1分钟", "深情告白30秒",
  "交换一个小秘密", "公主抱或背起", "鼻尖碰鼻尖10秒", "用眼神传达爱意",
  "唱一句情歌", "画对方速写", "说最想一起做的事", "感谢对方一件小事",
  "许下一个小愿望", "甜蜜拥抱", "说最爱的瞬间", "亲一下手背",
];

export default function FlightGame() {
  const [p1Out, setP1Out] = useState(false);
  const [p2Out, setP2Out] = useState(false);
  const [p1Pos, setP1Pos] = useState(0);
  const [p2Pos, setP2Pos] = useState(0);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [currentEvent, setCurrentEvent] = useState("掷出6开始游戏");
  const [logs, setLogs] = useState<string[]>([]);
  const [showRules, setShowRules] = useState(false);

  const addLog = (msg: string) => setLogs((p) => [msg, ...p].slice(0, 20));

  const rollDice = useCallback(() => {
    if (rolling) return;
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
          const newPos = (curPos + final) % boardEvents.length;
          if (turn === 1) setP1Pos(newPos); else setP2Pos(newPos);
          setCurrentEvent(boardEvents[newPos]);
          addLog(`🎲 ${name}掷出${final}：${boardEvents[newPos]}`);
          if (final !== 6) setTurn(turn === 1 ? 2 : 1);
          else addLog(`✨ ${name}掷出6，再掷一次！`);
        }
      }
    }, 80);
  }, [rolling, turn, p1Out, p2Out, p1Pos, p2Pos]);

  const reset = () => {
    setP1Out(false); setP2Out(false); setP1Pos(0); setP2Pos(0);
    setTurn(1); setDice(0); setCurrentEvent("掷出6开始游戏"); setLogs([]);
  };

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  // 6x6棋盘，外圈24格映射
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
          <Link href="/" className="text-sm text-pink-300 hover:text-pink-200">← 返回游戏列表</Link>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-6 sm:rounded-3xl sm:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">情侣飞行棋</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">🎲 掷出6开始游戏，体验每个格子的刺激事件</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10">✏️ 进入编辑模式</button>
            <button onClick={() => setShowRules(!showRules)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10">⚙️ 规则选项 ▾</button>
            <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10">💬 Discord</button>
          </div>

          {showRules && (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-white/70 space-y-1">
              <p>• 掷出6点飞机才能起飞</p>
              <p>• 掷出6点可额外再掷一次</p>
              <p>• 停在格子上需执行对应事件</p>
            </div>
          )}

          {/* 棋盘 */}
          <div className="relative mx-auto aspect-square w-full max-w-md rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="grid h-full grid-cols-6 grid-rows-6 gap-1">
              {Array.from({ length: 36 }).map((_, i) => {
                const row = Math.floor(i / 6);
                const col = i % 6;
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
                  <div key={i} className={`relative flex items-center justify-center rounded border text-xs transition-all ${
                    p1Here || p2Here ? "border-pink-400/60 bg-pink-500/20" : "border-white/10 bg-white/5"
                  }`}>
                    <span className="text-white/30">{idx + 1}</span>
                    {p1Here && <span className="absolute -top-1 -left-1 text-sm">✈️</span>}
                    {p2Here && <span className="absolute -bottom-1 -right-1 text-sm">✈️</span>}
                  </div>
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
            <div className="flex gap-3">
              <button onClick={rollDice} disabled={rolling} className="rounded-full bg-pink-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50">
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

        <div className="mt-8 text-center text-xs text-white/40">
          请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。
          <br />© 2024 ~ 2026 www.hoothin.com
        </div>
      </div>
    </>
  );
}
