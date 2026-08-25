"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState, useEffect, useRef, useCallback } from "react";

type Layer = "menu" | "games" | "wheel" | "dice" | "quiz" | "challenge" | "editor";

const defaultWheelTasks = [
  "亲对方脖子10秒", "在对方耳边说骚话", "互相打飞机", "69式",
  "脱一件衣服", "深情对视30秒", "用舌头舔耳朵", "在胸口种草莓",
  "公主抱做5个深蹲", "用嘴喂水", "模仿gay片台词", "蒙眼亲对方猜部位",
];

const diceActions = ["亲吻", "抚摸", "舔舐", "吸吮", "轻咬", "揉捏", "摩擦", "挑逗"];
const diceParts = ["嘴唇", "脖子", "乳头", "胸口", "肚脐", "大腿内侧", "耳朵", "手指"];
const diceWays = ["慢慢的", "用力的", "温柔的", "疯狂的", "持续的", "交替的", "从上到下", "从下到上"];

const defaultQuizQuestions = [
  { q: "对方最喜欢的姿势？", a: ["后入", "传教士", "骑乘", "侧入"] },
  { q: "对方是1还是0？", a: ["1", "0", "0.5", "互攻"] },
  { q: "对方最敏感的部位？", a: ["乳头", "脖子", "耳朵", "大腿内侧"] },
  { q: "第一次和男生约会地点？", a: ["电影院", "餐厅", "酒店", "公园"] },
  { q: "对方最长一次多久？", a: ["10分钟", "20分钟", "30分钟", "1小时以上"] },
  { q: "对方最喜欢的前戏？", a: ["口交", "手交", "深吻", "抚摸全身"] },
];

const defaultChallenges = [
  "在对方面前脱光衣服", "用嘴解开对方皮带", "互相按摩5分钟",
  "边看片边模仿动作", "用冰块在对方身上滑动", "穿对方的内裤走一圈",
  "蒙眼让对方为所欲为", "在镜子前做", "用低温蜡烛滴蜡",
  "互相用脚挑逗", "在浴室里做", "角色扮演10分钟",
];

// 音效
const useSound = () => {
  const ctx = useRef<AudioContext | null>(null);
  const play = useCallback((type: "click" | "success" | "fail" | "spin" | "roll" | "tick") => {
    try {
      if (!ctx.current) ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const c = ctx.current;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      const t = c.currentTime;
      if (type === "click") { osc.frequency.value = 800; gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.start(t); osc.stop(t + 0.1); }
      else if (type === "success") { osc.frequency.setValueAtTime(523, t); osc.frequency.setValueAtTime(659, t + 0.1); osc.frequency.setValueAtTime(784, t + 0.2); gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4); osc.start(t); osc.stop(t + 0.4); }
      else if (type === "fail") { osc.frequency.setValueAtTime(300, t); osc.frequency.exponentialRampToValueAtTime(100, t + 0.3); gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3); osc.start(t); osc.stop(t + 0.3); }
      else if (type === "spin") { osc.type = "sawtooth"; osc.frequency.setValueAtTime(200, t); osc.frequency.exponentialRampToValueAtTime(800, t + 0.5); gain.gain.setValueAtTime(0.05, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5); osc.start(t); osc.stop(t + 0.5); }
      else if (type === "roll") { for (let i = 0; i < 5; i++) { const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 100 + Math.random() * 200; g.gain.setValueAtTime(0.08, t + i * 0.08); g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.08); o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.08); } }
      else if (type === "tick") { osc.frequency.value = 1000; gain.gain.setValueAtTime(0.05, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05); osc.start(t); osc.stop(t + 0.05); }
    } catch (e) {}
  }, []);
  return play;
};

export default function GayGame() {
  const [layer, setLayer] = useState<Layer>("menu");
  const [score, setScore] = useState(0);
  const [wheelTasks, setWheelTasks] = useState(defaultWheelTasks);
  const [challenges, setChallenges] = useState(defaultChallenges);
  const [quizQuestions, setQuizQuestions] = useState(defaultQuizQuestions);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [diceResult, setDiceResult] = useState<{ action: string; part: string; way: string } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [challengeResult, setChallengeResult] = useState("");
  const [editType, setEditType] = useState<"wheel" | "challenge">("wheel");
  const [newItem, setNewItem] = useState("");
  const play = useSound();

  useEffect(() => {
    const w = localStorage.getItem("gay_wheel"); if (w) setWheelTasks(JSON.parse(w));
    const c = localStorage.getItem("gay_challenge"); if (c) setChallenges(JSON.parse(c));
    const s = localStorage.getItem("gay_score"); if (s) setScore(parseInt(s));
  }, []);
  useEffect(() => { localStorage.setItem("gay_wheel", JSON.stringify(wheelTasks)); }, [wheelTasks]);
  useEffect(() => { localStorage.setItem("gay_challenge", JSON.stringify(challenges)); }, [challenges]);
  useEffect(() => { localStorage.setItem("gay_score", String(score)); }, [score]);

  const goBack = () => {
    play("click");
    if (["wheel", "dice", "quiz", "challenge"].includes(layer)) setLayer("games");
    else if (layer === "games" || layer === "editor") setLayer("menu");
  };

  const spinWheel = () => {
    if (spinning) return;
    play("spin");
    setSpinning(true);
    setWheelResult("");
    const extra = 5 + Math.floor(Math.random() * 3);
    const angle = Math.floor(Math.random() * 360);
    setWheelRotation((r) => r + extra * 360 + angle);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * wheelTasks.length);
      setWheelResult(wheelTasks[idx]);
      setSpinning(false);
      play("success");
    }, 3500);
  };

  const rollDice = () => {
    if (rolling) return;
    play("roll");
    setRolling(true);
    setDiceResult(null);
    setTimeout(() => {
      setDiceResult({
        action: diceActions[Math.floor(Math.random() * diceActions.length)],
        part: diceParts[Math.floor(Math.random() * diceParts.length)],
        way: diceWays[Math.floor(Math.random() * diceWays.length)],
      });
      setRolling(false);
      play("success");
    }, 1200);
  };

  const answerQuiz = (idx: number) => {
    if (quizAnswered) return;
    setQuizSelected(idx);
    setQuizAnswered(true);
    if (idx === 0) { // 第一个为正确答案（简化）
      setQuizScore((s) => s + 1);
      setScore((s) => s + 1);
      play("success");
    } else {
      play("fail");
    }
  };

  const nextQuiz = () => {
    play("click");
    setQuizIdx((i) => (i + 1) % quizQuestions.length);
    setQuizAnswered(false);
    setQuizSelected(null);
  };

  const drawChallenge = () => {
    play("spin");
    setChallengeResult(challenges[Math.floor(Math.random() * challenges.length)]);
  };

  const completeChallenge = () => {
    play("success");
    setScore((s) => s + 2);
    setChallengeResult("");
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    play("click");
    if (editType === "wheel") setWheelTasks([...wheelTasks, newItem.trim()]);
    else setChallenges([...challenges, newItem.trim()]);
    setNewItem("");
  };

  const removeItem = (type: "wheel" | "challenge", idx: number) => {
    play("click");
    if (type === "wheel") setWheelTasks(wheelTasks.filter((_, i) => i !== idx));
    else setChallenges(challenges.filter((_, i) => i !== idx));
  };

  const BackButton = () => (
    <button onClick={goBack} className="mb-4 flex items-center gap-1 text-xs text-white/50 transition hover:text-white/80">← 返回上一层</button>
  );

  const games = [
    { key: "wheel" as Layer, icon: "🎡", label: "幸运转盘", desc: "转动转盘，抽取随机任务", color: "from-pink-500 to-rose-500" },
    { key: "dice" as Layer, icon: "🎲", label: "情趣骰子", desc: "动作+部位+方式随机组合", color: "from-purple-500 to-indigo-500" },
    { key: "quiz" as Layer, icon: "❓", label: "快问快答", desc: "限时问答，考验了解程度", color: "from-blue-500 to-cyan-500" },
    { key: "challenge" as Layer, icon: "🎯", label: "大冒险", desc: "随机挑战，完成得分", color: "from-orange-500 to-red-500" },
  ];

  return (
    <LicenseGate gameName="他与他">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-4 py-6">
        <div className="game-container w-full">
          {/* 主菜单 */}
          {layer === "menu" && (
            <div className="text-center">
              <div className="mb-4 text-6xl animate-pulse">👨‍❤️‍👨</div>
              <h1 className="mb-1 text-2xl font-bold text-white">他与他</h1>
              <p className="mb-1 text-sm text-pink-300">🌈 专为男同情侣设计</p>
              <p className="mb-6 text-sm text-white/70">4种小游戏合集，属于两个男生的深夜时光</p>
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-white/60">总积分：<span className="font-bold text-pink-300">{score}</span> 分</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => { play("click"); setLayer("games"); }} className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 hover:scale-[1.02]">
                  🎮 开始游戏
                </button>
                <button onClick={() => { play("click"); setLayer("editor"); }} className="w-full rounded-full border border-white/15 bg-white/5 py-3 text-sm text-white/70 transition hover:bg-white/10">
                  ✏️ 编辑内容
                </button>
              </div>
            </div>
          )}

          {/* 游戏选择 */}
          {layer === "games" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">选择小游戏</h2>
              <div className="grid grid-cols-2 gap-3">
                {games.map((g) => (
                  <button key={g.key} onClick={() => { play("click"); setLayer(g.key); }} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${g.color} p-4 text-left transition hover:scale-105 hover:shadow-lg`}>
                    <div className="mb-2 text-3xl">{g.icon}</div>
                    <p className="text-sm font-bold text-white">{g.label}</p>
                    <p className="mt-0.5 text-[10px] text-white/70">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 幸运转盘 */}
          {layer === "wheel" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">🎡 幸运转盘</h2>
              <div className="mb-6 flex justify-center">
                <div className="relative h-56 w-56">
                  <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-2xl">▼</div>
                  <div
                    className="h-full w-full rounded-full border-4 border-white/20 shadow-2xl transition-transform duration-[3500ms] ease-out"
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      background: `conic-gradient(${wheelTasks.map((_, i) => `hsl(${i * (360 / wheelTasks.length)}, 70%, 60%) ${i * (360 / wheelTasks.length)}deg ${(i + 1) * (360 / wheelTasks.length)}deg`).join(", ")})`,
                    }}
                  >
                    <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg flex items-center justify-center text-xl">🎯</div>
                  </div>
                </div>
              </div>
              {wheelResult && (
                <div className="mb-4 animate-bounce rounded-xl border border-pink-400/30 bg-pink-500/10 p-4 text-center">
                  <p className="text-xs text-pink-300 mb-1">抽中任务</p>
                  <p className="text-sm font-bold text-white">{wheelResult}</p>
                </div>
              )}
              <button onClick={spinWheel} disabled={spinning} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 disabled:opacity-50">
                {spinning ? "转动中..." : "🎡 转动转盘"}
              </button>
            </div>
          )}

          {/* 情趣骰子 */}
          {layer === "dice" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">🎲 情趣骰子</h2>
              <p className="mb-4 text-center text-xs text-white/50">三个骰子组合：动作 + 部位 + 方式</p>
              <div className="mb-6 flex justify-center gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-center text-xs font-bold shadow-lg transition-all duration-300 ${rolling ? "animate-bounce border-purple-400 bg-purple-500/20 text-purple-200" : "border-white/20 bg-white text-gray-900"}`} style={{ animationDelay: `${i * 0.1}s` }}>
                    {rolling ? "?" : diceResult ? (i === 0 ? diceResult.action : i === 1 ? diceResult.part : diceResult.way) : "?"}
                  </div>
                ))}
              </div>
              {diceResult && !rolling && (
                <div className="mb-4 rounded-xl border border-purple-400/30 bg-purple-500/10 p-4 text-center">
                  <p className="text-sm font-bold text-white">
                    <span className="text-pink-300">{diceResult.way}</span> 地
                    <span className="text-purple-300"> {diceResult.action}</span>
                    <span className="text-blue-300"> {diceResult.part}</span>
                  </p>
                </div>
              )}
              <button onClick={rollDice} disabled={rolling} className="w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/40 transition hover:shadow-purple-500/60 disabled:opacity-50">
                {rolling ? "摇动中..." : "🎲 摇骰子"}
              </button>
            </div>
          )}

          {/* 快问快答 */}
          {layer === "quiz" && (
            <div>
              <BackButton />
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">❓ 快问快答</h2>
                <div className="text-right">
                  <p className="text-[10px] text-white/40">得分</p>
                  <p className="text-sm font-bold text-blue-300">{quizScore}</p>
                </div>
              </div>
              <div className="mb-2 text-[10px] text-white/40">第 {quizIdx + 1}/{quizQuestions.length} 题（第一个选项为正确答案）</div>
              <div className="mb-4 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
                <p className="text-base font-bold text-white">{quizQuestions[quizIdx].q}</p>
              </div>
              <div className="mb-4 space-y-2">
                {quizQuestions[quizIdx].a.map((opt, i) => (
                  <button key={i} onClick={() => answerQuiz(i)} disabled={quizAnswered} className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                    quizAnswered
                      ? i === 0 ? "border-green-400/50 bg-green-500/20 text-green-200" : i === quizSelected ? "border-red-400/50 bg-red-500/20 text-red-200" : "border-white/10 bg-white/5 text-white/40"
                      : "border-white/15 bg-white/5 text-white/80 hover:border-blue-400/50 hover:bg-blue-500/10"
                  }`}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                ))}
              </div>
              {quizAnswered && (
                <button onClick={nextQuiz} className="w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:shadow-blue-500/60">
                  下一题 →
                </button>
              )}
            </div>
          )}

          {/* 大冒险 */}
          {layer === "challenge" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">🎯 大冒险</h2>
              <p className="mb-4 text-center text-xs text-white/50">完成挑战 +2分</p>
              {!challengeResult ? (
                <div className="mb-4 rounded-2xl border border-orange-400/30 bg-orange-500/10 p-8 text-center">
                  <div className="mb-2 text-4xl">🎲</div>
                  <p className="text-sm text-white/60">点击下方按钮抽取挑战</p>
                </div>
              ) : (
                <div className="mb-4 rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/15 to-red-500/10 p-5">
                  <p className="mb-2 text-[10px] text-orange-300">挑战任务</p>
                  <p className="text-base font-bold text-white">{challengeResult}</p>
                </div>
              )}
              <div className="space-y-2">
                {!challengeResult ? (
                  <button onClick={drawChallenge} className="w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/40 transition hover:shadow-orange-500/60">
                    🎯 抽取挑战
                  </button>
                ) : (
                  <>
                    <button onClick={completeChallenge} className="w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/40 transition hover:shadow-green-500/60">
                      ✅ 完成挑战 (+2分)
                    </button>
                    <button onClick={drawChallenge} className="w-full rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/60 transition hover:bg-white/10">
                      ⏭️ 换一个
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 编辑内容 */}
          {layer === "editor" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">✏️ 编辑内容</h2>
              <div className="mb-4 flex gap-2">
                <button onClick={() => { play("click"); setEditType("wheel"); }} className={`flex-1 rounded-full py-2 text-xs transition ${editType === "wheel" ? "bg-pink-500 text-white" : "bg-white/5 text-white/50"}`}>🎡 转盘任务</button>
                <button onClick={() => { play("click"); setEditType("challenge"); }} className={`flex-1 rounded-full py-2 text-xs transition ${editType === "challenge" ? "bg-orange-500 text-white" : "bg-white/5 text-white/50"}`}>🎯 大冒险</button>
              </div>
              <div className="mb-4 flex gap-2">
                <input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} placeholder="输入新内容..." className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400/50" />
                <button onClick={addItem} className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-400">添加</button>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {(editType === "wheel" ? wheelTasks : challenges).map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-sm text-white/80">{item}</span>
                    <button onClick={() => removeItem(editType, i)} className="ml-2 text-red-400 hover:text-red-300">🗑️</button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] text-white/30">共 {(editType === "wheel" ? wheelTasks : challenges).length} 条，自动保存</p>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
