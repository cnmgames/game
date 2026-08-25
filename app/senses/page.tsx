"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState, useEffect, useRef } from "react";

type Difficulty = "gentle" | "spicy" | "extreme";
type SenseType = "all" | "touch" | "smell" | "taste" | "sound" | "sight";

const taskPool = {
  gentle: [
    { type: "触觉", icon: "✋", text: "蒙眼状态下，用手指从对方额头慢慢滑到下巴，感受每一寸肌肤" },
    { type: "触觉", icon: "✋", text: "用指尖在对方手背轻轻画圈，看对方能不能忍住不笑" },
    { type: "嗅觉", icon: "👃", text: "蒙眼闻对方脖子、手腕、头发的味道，说出最喜欢哪个" },
    { type: "味觉", icon: "👅", text: "用嘴把一口温水喂给对方，然后轻轻接吻" },
    { type: "听觉", icon: "👂", text: "在对方耳边轻轻说一句你最想对他做的事" },
    { type: "视觉", icon: "👁️", text: "深情对视30秒，谁先笑谁就接受对方一个要求" },
    { type: "综合", icon: "🔥", text: "从背后轻轻抱住对方，下巴搭在对方肩膀上，呼吸感受彼此" },
  ],
  spicy: [
    { type: "触觉", icon: "✋", text: "用舌尖在对方脖子上慢慢画圈，直到对方发出声音" },
    { type: "触觉", icon: "✋", text: "从背后抱住对方，手慢慢游走，每停一处问对方喜不喜欢" },
    { type: "触觉", icon: "✋", text: "用手指在对方大腿内侧画圈，越来越靠近但就是不碰敏感处" },
    { type: "嗅觉", icon: "👃", text: "在对方脖子、胸口、手腕各亲一下，让对方蒙眼分辨是哪个部位" },
    { type: "味觉", icon: "👅", text: "在对方身上滴一滴蜂蜜/糖浆，用舌头慢慢舔干净" },
    { type: "听觉", icon: "👂", text: "蒙眼，让对方在你耳边发出不同的声音，猜他在做什么" },
    { type: "视觉", icon: "👁️", text: "在对方面前慢慢脱一件衣服，每脱一个动作停3秒" },
    { type: "综合", icon: "🔥", text: "蒙眼，对方可以用嘴/手触碰你，你要说出是什么部位" },
    { type: "综合", icon: "🔥", text: "用冰块在对方身上慢慢滑动，从脖子到大腿内侧" },
  ],
  extreme: [
    { type: "触觉", icon: "✋", text: "蒙眼绑住手，对方可以对你做任何事，你只能用声音回应" },
    { type: "触觉", icon: "✋", text: "互相按摩，但只能用舌头，从肩膀开始慢慢往下" },
    { type: "触觉", icon: "✋", text: "在对方敏感部位呼热气，然后突然用舌头舔，观察反应" },
    { type: "味觉", icon: "👅", text: "用嘴传递一颗葡萄/草莓，最后一起吃掉" },
    { type: "综合", icon: "🔥", text: "蒙眼，用羽毛/冰块/手指轮流触碰对方，让对方猜是什么" },
    { type: "综合", icon: "🔥", text: "在镜子前蒙眼，让对方引导你的手触碰他的身体" },
    { type: "综合", icon: "🔥", text: "用低温蜡烛在对方身上滴蜡，感受温度和刺激" },
    { type: "综合", icon: "🔥", text: "互相用脚挑逗对方敏感部位，看谁先忍不住" },
  ],
};

const senseFilters: { key: SenseType; label: string; icon: string }[] = [
  { key: "all", label: "全部", icon: "🌈" },
  { key: "touch", label: "触觉", icon: "✋" },
  { key: "smell", label: "嗅觉", icon: "👃" },
  { key: "taste", label: "味觉", icon: "👅" },
  { key: "sound", label: "听觉", icon: "👂" },
  { key: "sight", label: "视觉", icon: "👁️" },
];

export default function SensesGame() {
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("spicy");
  const [senseFilter, setSenseFilter] = useState<SenseType>("all");
  const [currentTask, setCurrentTask] = useState<{ type: string; icon: string; text: string } | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [blindfold, setBlindfold] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const getFilteredTasks = () => {
    let tasks = taskPool[difficulty];
    if (senseFilter !== "all") {
      const typeMap: Record<string, string> = {
        touch: "触觉", smell: "嗅觉", taste: "味觉", sound: "听觉", sight: "视觉",
      };
      tasks = tasks.filter((t) => t.type === typeMap[senseFilter] || t.type === "综合");
    }
    return tasks;
  };

  const drawTask = () => {
    const tasks = getFilteredTasks();
    if (tasks.length === 0) return;
    
    let idx;
    do {
      idx = Math.floor(Math.random() * tasks.length);
    } while (history.includes(idx) && history.length < tasks.length);
    
    if (history.length >= tasks.length) {
      setHistory([]);
    } else {
      setHistory([...history, idx]);
    }
    setCurrentTask(tasks[idx]);
    setBlindfold(tasks[idx].text.includes("蒙眼"));
    setTimer(0);
    setTimerRunning(true);
  };

  const toggleFavorite = () => {
    if (!currentTask) return;
    const tasks = getFilteredTasks();
    const idx = tasks.findIndex((t) => t.text === currentTask.text);
    if (favorites.includes(idx)) {
      setFavorites(favorites.filter((i) => i !== idx));
    } else {
      setFavorites([...favorites, idx]);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const restart = () => {
    setStarted(false);
    setCurrentTask(null);
    setHistory([]);
    setTimer(0);
    setTimerRunning(false);
    setBlindfold(false);
  };

  const difficultyLabels = {
    gentle: { label: "温柔", color: "from-blue-500 to-cyan-500", desc: "适合新手，温柔探索" },
    spicy: { label: "刺激", color: "from-pink-500 to-rose-500", desc: "调情挑逗，渐入佳境" },
    extreme: { label: "极限", color: "from-red-500 to-orange-500", desc: "重口味，释放欲望" },
  };

  return (
    <LicenseGate gameName="感官探索">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-6">
        <div className="game-container w-full">
          {!started && (
            <div className="text-center">
              <div className="mb-4 text-6xl">🌙</div>
              <h1 className="mb-2 text-2xl font-bold text-white">感官探索</h1>
              <p className="mb-5 text-sm text-white/70">蒙眼+五感放大，探索彼此的每一寸敏感地带</p>

              {/* 难度选择 */}
              <p className="mb-2 text-left text-xs font-semibold text-white/60">选择难度</p>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {(Object.keys(difficultyLabels) as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      difficulty === d
                        ? `border-transparent bg-gradient-to-br ${difficultyLabels[d].color} text-white shadow-lg`
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-sm font-bold">{difficultyLabels[d].label}</p>
                    <p className="mt-0.5 text-[9px] opacity-80">{difficultyLabels[d].desc}</p>
                  </button>
                ))}
              </div>

              {/* 感官筛选 */}
              <p className="mb-2 text-left text-xs font-semibold text-white/60">感官类型（可选）</p>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {senseFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setSenseFilter(f.key)}
                    className={`rounded-full px-3 py-1 text-[11px] transition ${
                      senseFilter === f.key
                        ? "bg-pink-500 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>

              <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs text-white/60">
                <p className="mb-1">📋 玩法：</p>
                <p>• 选择难度和感官类型</p>
                <p>• 抽取任务卡，按要求执行</p>
                <p>• 内置计时器，记录每次时长</p>
                <p>• 可收藏喜欢的任务</p>
              </div>

              <button
                onClick={() => setStarted(true)}
                className={`w-full rounded-full bg-gradient-to-r ${difficultyLabels[difficulty].color} py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl`}
              >
                开始探索
              </button>
            </div>
          )}

          {started && (
            <div>
              {/* 顶部状态栏 */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full bg-gradient-to-r ${difficultyLabels[difficulty].color} px-2 py-0.5 text-[10px] font-semibold text-white`}>
                    {difficultyLabels[difficulty].label}
                  </span>
                  {senseFilter !== "all" && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                      {senseFilters.find((f) => f.key === senseFilter)?.label}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40">已完成</p>
                  <p className="text-xs font-bold text-pink-300">{history.length}</p>
                </div>
              </div>

              {/* 计时器 */}
              {timerRunning && (
                <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2">
                  <span className="text-lg">⏱️</span>
                  <span className="font-mono text-lg font-bold text-white">{formatTime(timer)}</span>
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60"
                  >
                    {timerRunning ? "暂停" : "继续"}
                  </button>
                </div>
              )}

              {/* 蒙眼提示 */}
              {blindfold && currentTask && (
                <div className="mb-3 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-2.5 text-center">
                  <p className="text-xs text-yellow-200">😎 本任务需要蒙眼，请准备好眼罩</p>
                </div>
              )}

              {/* 任务卡片 */}
              {currentTask && (
                <div className="mb-4">
                  <div className="relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-pink-500/15 p-5">
                    <div className="absolute -right-3 -top-3 text-5xl opacity-10">{currentTask.icon}</div>
                    <div className="relative z-10">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{currentTask.icon}</span>
                          <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-pink-200">
                            {currentTask.type}
                          </span>
                        </div>
                        <button
                          onClick={toggleFavorite}
                          className="text-lg transition hover:scale-110"
                        >
                          {favorites.includes(history[history.length - 1]) ? "❤️" : "🤍"}
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed text-white">{currentTask.text}</p>
                    </div>
                  </div>
                </div>
              )}

              {!currentTask && (
                <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <div className="mb-2 text-4xl">🎲</div>
                  <p className="text-sm text-white/50">点击下方按钮抽取任务</p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="space-y-2">
                <button
                  onClick={drawTask}
                  className={`w-full rounded-full bg-gradient-to-r ${difficultyLabels[difficulty].color} py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl`}
                >
                  {currentTask ? "✨ 下一个任务" : "🎲 抽取任务"}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setTimer(0); setTimerRunning(false); }}
                    className="flex-1 rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/50 transition hover:bg-white/10"
                  >
                    ⏱️ 重置计时
                  </button>
                  <button
                    onClick={restart}
                    className="flex-1 rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/50 transition hover:bg-white/10"
                  >
                    🔄 重新选择
                  </button>
                </div>
              </div>

              {favorites.length > 0 && (
                <p className="mt-3 text-center text-[10px] text-white/30">❤️ 已收藏 {favorites.length} 个任务</p>
              )}

              <p className="mt-2 text-center text-[10px] text-white/30">放慢节奏，用心感受每一个瞬间</p>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
