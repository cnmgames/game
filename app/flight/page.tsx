"use client";
import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";

const defaultEvents = [
  { text: "气息交融", desc: "双方鼻尖相对，缓慢呼吸，感受彼此的气息交融在一起", duration: 15, color: "from-pink-500/70 to-rose-500/70" },
  { text: "窒息拥抱", desc: "紧紧拥抱对方，感受彼此的心跳和体温，持续到无法呼吸", duration: 20, color: "from-pink-500/70 to-rose-500/70" },
  { text: "掌心听心", desc: "将手掌贴在对方胸口，静静聆听心跳的声音", duration: 15, color: "from-purple-500/70 to-violet-500/70" },
  { text: "唇线抚触", desc: "用手指轻轻描绘对方的唇线，感受柔软的触感", duration: 15, color: "from-pink-500/70 to-rose-500/70" },
  { text: "背后温存", desc: "从背后环抱对方，下巴搁在肩上，感受温暖的依靠", duration: 20, color: "from-pink-500/70 to-rose-500/70" },
  { text: "锁骨流连", desc: "用指尖在对方锁骨处轻轻游走，流连忘返", duration: 15, color: "from-pink-500/70 to-rose-500/70" },
  { text: "颈侧印记", desc: "在对方颈侧留下一个温柔的吻痕，标记属于你的印记", duration: 15, color: "from-pink-500/70 to-rose-500/70" },
  { text: "心灵交换", desc: "对视30秒，说出一个从未告诉过对方的秘密", duration: 30, color: "from-purple-500/70 to-violet-500/70" },
  { text: "感恩此刻", desc: "说出三件感谢对方的事情，真诚表达爱意", duration: 30, color: "from-blue-500/70 to-cyan-500/70" },
  { text: "怦然心动", desc: "突然深情告白，让对方心跳加速", duration: 15, color: "from-pink-500/70 to-rose-500/70" },
  { text: "唇角试探", desc: "用唇轻轻触碰对方唇角，似有若无地停留", duration: 10, color: "from-pink-500/70 to-rose-500/70" },
  { text: "大胆示爱", desc: "用最大的声音喊出"我爱你"，让全世界都听到", duration: 10, color: "from-pink-500/70 to-rose-500/70" },
  { text: "鼻尖磨蹭", desc: "鼻尖相对，轻轻磨蹭，像小兔子一样可爱", duration: 15, color: "from-pink-500/70 to-rose-500/70" },
  { text: "后脊依偎", desc: "从背后依偎，双手环腰，感受后背的温度", duration: 20, color: "from-pink-500/70 to-rose-500/70" },
  { text: "唇际掌控", desc: "主动掌控亲吻的节奏和深度，展现你的魅力", duration: 15, color: "from-pink-500/70 to-rose-500/70" },
  { text: "十指连心", desc: "十指相扣，感受指尖传来的温度和爱意", duration: 20, color: "from-purple-500/70 to-violet-500/70" },
  { text: "肌肤探险", desc: "用指尖探索对方身体的每一寸肌肤，找到敏感点", duration: 30, color: "from-pink-500/70 to-rose-500/70" },
  { text: "颈窝传情", desc: "在对方颈窝处轻轻呼气和亲吻，传递爱意", duration: 15, color: "from-pink-500/70 to-rose-500/70" },
  { text: "雨点轻吻", desc: "像雨点一样在对方脸上落下无数个轻吻", duration: 20, color: "from-pink-500/70 to-rose-500/70" },
  { text: "贴身慢摇", desc: "紧贴对方，随着想象中的音乐慢慢摇摆", duration: 30, color: "from-pink-500/70 to-rose-500/70" },
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

  // 事件详情弹窗
  const [showEventModal, setShowEventModal] = useState(false);
  const [modalEvent, setModalEvent] = useState<typeof defaultEvents[0] | null>(null);
  const [modalPlayer, setModalPlayer] = useState("");
  const [modalExtra, setModalExtra] = useState("");

  // 倒计时
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 音效
  const playSound = useCallback((type: "tick" | "start" | "end" | "dice") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "tick") {
        osc.frequency.value = 800;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === "start") {
        osc.frequency.value = 523;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "end") {
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        osc.type = "sine";
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "dice") {
        osc.frequency.value = 200 + Math.random() * 400;
        osc.type = "square";
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // 静默失败
    }
  }, []);

  // 倒计时逻辑
  useEffect(() => {
    if (timerRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setTimerRunning(false);
            playSound("end");
            return 0;
          }
          if (t <= 4) playSound("tick");
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timer, playSound]);

  const addLog = (msg: string) => setLogs((p) => [msg, ...p].slice(0, 20));

  const rollDice = useCallback(() => {
    if (rolling || editMode) return;
    setRolling(true);
    setDice(0);
    let count = 0;
    const anim = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      playSound("dice");
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
            setModalEvent({ text: "飞机起飞！", desc: `${name}掷出6点，飞机成功起飞，进入棋盘！`, duration: 0, color: "from-green-500/70 to-emerald-500/70" });
            setModalPlayer(name);
            setModalExtra("");
            setShowEventModal(true);
          } else {
            setCurrentEvent(`${name}掷出${final}，需要掷出6才能出发`);
            addLog(`🎲 ${name}掷出${final}，未出列`);
            setTurn(turn === 1 ? 2 : 1);
          }
        } else {
          const curPos = turn === 1 ? p1Pos : p2Pos;
          const newPos = (curPos + final) % events.length;
          if (turn === 1) setP1Pos(newPos); else setP2Pos(newPos);
          const event = events[newPos];
          setCurrentEvent(event.text);
          addLog(`🎲 ${name}掷出${final}：${event.text}`);

          // 弹出事件详情
          setModalEvent(event);
          setModalPlayer(name);
          setModalExtra(final === 6 && rules.sixAgain ? "掷出6，再来一次！" : "");
          setTimer(event.duration);
          setTimerRunning(false);
          setShowEventModal(true);

          if (final !== 6 || !rules.sixAgain) setTurn(turn === 1 ? 2 : 1);
          else addLog(`✨ ${name}掷出6，再掷一次！`);
        }
      }
    }, 80);
  }, [rolling, turn, p1Out, p2Out, p1Pos, p2Pos, editMode, events, rules, playSound]);

  const reset = () => {
    setP1Out(false); setP2Out(false); setP1Pos(0); setP2Pos(0);
    setTurn(1); setDice(0); setCurrentEvent("掷出6开始游戏"); setLogs([]);
    setShowEventModal(false); setTimer(0); setTimerRunning(false);
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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    if (timer > 0) {
      setTimerRunning(!timerRunning);
      if (!timerRunning) playSound("start");
    }
  };

  const adjustTimer = (delta: number) => {
    setTimer((t) => Math.max(0, t + delta));
  };

  const closeModal = () => {
    setShowEventModal(false);
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const diceFaces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  const getBoardIdx = (row: number, col: number): number => {
    if (row === 0) return col;
    if (col === 5) return 5 + (row - 1);
    if (row === 5) return 9 + (5 - col);
    if (col === 0) return 15 + (5 - row);
    return -1;
  };

  const isCenterPath = (row: number, col: number) => {
    return row >= 1 && row <= 4 && col >= 2 && col <= 3;
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-4xl px-2 py-3 sm:px-4 sm:py-6">
        <div className="mb-3">
          <Link href="/" className="back-btn">← 返回游戏列表</Link>
        </div>

        <div className="game-container !p-3 sm:!p-5">
          <div className="text-center mb-3 sm:mb-5">
            <h1 className="game-title !text-2xl sm:!text-4xl">情侣飞行棋</h1>
            <div className="game-title-underline" />
            <p className="mt-2 text-xs text-white/60 sm:text-sm">🎲 掷出6开始游戏，体验每个格子的刺激事件</p>
          </div>

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

          <div className="mb-3 flex flex-wrap justify-center gap-3 text-[10px] text-white/50 sm:text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />男方</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" />女方</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500/60" />前进两格</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500/60" />后退两格</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gray-500/60" />休息一回合</span>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-2xl rounded-xl p-[3px] animated-border">
            <div className="relative h-full w-full rounded-lg bg-black/90 p-1.5 sm:p-2">
              <div className="grid h-full grid-cols-6 grid-rows-6 gap-0.5 sm:gap-1">
                {Array.from({ length: 36 }).map((_, i) => {
                  const row = Math.floor(i / 6), col = i % 6;
                  const idx = getBoardIdx(row, col);
                  if (isCenterPath(row, col)) {
                    const isPathCol = col === 2 || col === 3;
                    const showPlane = isPathCol && row >= 1 && row <= 3;
                    return (
                      <div key={i} className={`flex items-center justify-center ${isPathCol ? "bg-gradient-to-b from-pink-500/15 to-purple-500/15" : ""}`}>
                        {showPlane && <span className="text-base sm:text-xl opacity-50">✈️</span>}
                      </div>
                    );
                  }
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
                  const isP1Start = idx === 0;
                  const isP2Start = idx === 10;
                  return (
                    <div key={i} className="cell-wrapper relative">
                      <button
                        onClick={() => editMode && openEdit(idx)}
                        className={`relative flex h-full w-full items-center justify-center rounded bg-gradient-to-br ${event.color} p-0.5 text-center text-[8px] leading-tight text-white shadow-md transition-all hover:scale-105 hover:shadow-lg hover:brightness-125 sm:text-[10px] ${
                          p1Here || p2Here ? "ring-2 ring-white ring-offset-1 ring-offset-black scale-105 brightness-150" : ""
                        } ${isP1Start ? "ring-2 ring-purple-400" : ""} ${isP2Start ? "ring-2 ring-red-400" : ""} ${editMode ? "cursor-pointer" : ""}`}
                      >
                        <span className="line-clamp-3 px-0.5 font-medium drop-shadow">{event.text}</span>
                        {p1Here && <span className="absolute -top-1 -left-1 text-sm sm:text-base">✈️</span>}
                        {p2Here && <span className="absolute -bottom-1 -right-1 text-sm sm:text-base">✈️</span>}
                        {isP1Start && <span className="absolute -top-1 -right-1 text-[7px] bg-purple-500 rounded px-0.5">男起</span>}
                        {isP2Start && <span className="absolute -top-1 -right-1 text-[7px] bg-red-500 rounded px-0.5">女起</span>}
                      </button>
                      <div className="cell-tooltip">{event.text} - 第{idx + 1}格 ({event.duration}秒)</div>
                    </div>
                  );
                })}
              </div>

              <div className="absolute left-1/2 top-1/2 z-10 w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/20 bg-black/95 p-2 text-center shadow-2xl backdrop-blur-xl sm:p-3">
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

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${turn === 1 ? "bg-blue-400" : "bg-pink-400"}`} />
                  当前玩家
                </span>
                <span className="text-sm font-semibold">{turn === 1 ? "男方" : "女方"}</span>
              </div>
            </div>
            <div className="rounded-xl border border-pink-300/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3">
              <div className="text-xs text-white/50 mb-1 flex items-center gap-1"><span>🎯</span> 当前事件</div>
              <div className="text-sm font-semibold text-pink-100">{currentEvent}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className={`rounded-lg border p-2 ${turn === 1 ? "border-blue-400/50 bg-blue-500/10" : "border-white/10 bg-white/5"}`}>
                <div className="font-semibold">♂ 男方</div>
                <div className="text-white/50 text-[10px]">{p1Out ? `位置 ${p1Pos + 1}` : "未出列"}</div>
              </div>
              <div className={`rounded-lg border p-2 ${turn === 2 ? "border-pink-400/50 bg-pink-500/10" : "border-white/10 bg-white/5"}`}>
                <div className="font-semibold">♀ 女方</div>
                <div className="text-white/50 text-[10px]">{p2Out ? `位置 ${p2Pos + 1}` : "未出列"}</div>
              </div>
            </div>
            {logs.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs font-semibold text-white/50 mb-2 flex items-center gap-1">
                  <span>📚</span> 游戏记录
                  <span className="text-[10px] text-white/30 ml-1">追踪每一步的精彩时刻</span>
                </div>
                <div className="max-h-24 space-y-1 overflow-y-auto">
                  {logs.map((log, i) => <div key={i} className="text-[10px] text-white/60 sm:text-xs">{log}</div>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="footer-card !mt-6 !p-3">
          <p className="text-[10px] sm:text-xs">请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
        </div>
      </div>

      {/* 事件详情弹窗 - 全屏 */}
      {showEventModal && modalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={closeModal}>
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/20 bg-gradient-to-br from-zinc-900 to-black p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* 玩家标签 */}
            <div className="mb-4">
              <span className={`inline-block rounded-full px-4 py-1 text-sm font-semibold ${turn === 1 ? "bg-blue-500/30 text-blue-200" : "bg-pink-500/30 text-pink-200"}`}>
                {modalPlayer}
              </span>
            </div>

            {/* 事件标题 */}
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">{modalEvent.text}</h2>

            {/* 事件描述 */}
            <p className="mb-6 text-base text-white/80 sm:text-lg">{modalEvent.desc}</p>

            {/* 额外提示 */}
            {modalExtra && (
              <p className="mb-4 text-sm font-semibold text-yellow-300">✨ {modalExtra}</p>
            )}

            {/* 倒计时器 */}
            {modalEvent.duration > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => adjustTimer(-10)}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    -10s
                  </button>
                  <button
                    onClick={toggleTimer}
                    className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xl font-bold text-white hover:bg-white/20 transition"
                  >
                    {timerRunning ? "⏸" : "▶"} {formatTime(timer)}
                  </button>
                  <button
                    onClick={() => adjustTimer(10)}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    +10s
                  </button>
                </div>
                {timer === 0 && !timerRunning && (
                  <p className="mt-2 text-xs text-green-400">⏰ 时间到！任务完成</p>
                )}
              </div>
            )}

            {/* 底部按钮 */}
            <div className="flex justify-center gap-3">
              <button
                onClick={closeModal}
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:from-pink-400 hover:to-purple-400"
              >
                知道了
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "情侣飞行棋", text: `快来玩情侣飞行棋！${modalEvent.text}`, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("链接已复制！");
                  }
                }}
                className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm text-white/70 hover:bg-white/10 transition"
              >
                🔗 分享
              </button>
            </div>
          </div>
        </div>
      )}

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
