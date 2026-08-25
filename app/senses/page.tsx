"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState, useEffect, useRef, useCallback } from "react";

type Layer = "menu" | "map" | "task" | "editor";
type BodyPart = {
  id: string; name: string; icon: string; position: string;
  tasks: string[]; unlocked: boolean; completed: number;
};

const defaultBodyParts: BodyPart[] = [
  { id: "head", name: "头部", icon: "👤", position: "头部区域", tasks: ["蒙眼亲吻额头，慢慢移到嘴唇", "用舌头舔对方耳垂，轻轻吹气", "深吻同时抚摸头发", "在耳边说骚话，观察对方反应"], unlocked: true, completed: 0 },
  { id: "neck", name: "颈部", icon: "🦢", position: "脖子与锁骨", tasks: ["从下巴慢慢吻到锁骨", "在脖子上种草莓", "用舌头在脖子画圈", "轻咬锁骨，慢慢往下"], unlocked: false, completed: 0 },
  { id: "chest", name: "胸部", icon: "❤️", position: "胸口与乳头", tasks: ["亲吻胸口，画圈慢慢靠近乳头", "用舌头舔乳头，轻轻吸吮", "手指揉捏乳头，观察反应", "在胸口留下口水印"], unlocked: false, completed: 0 },
  { id: "arms", name: "手臂", icon: "💪", position: "手臂与指尖", tasks: ["从肩膀吻到指尖，每根手指都舔", "十指相扣，慢慢靠近", "用手指在对方手心画圈", "亲吻腋下，敏感地带探索"], unlocked: false, completed: 0 },
  { id: "belly", name: "腹部", icon: "🤰", position: "小腹与肚脐", tasks: ["从胸口慢慢吻到小腹", "用舌头在肚脐画圈", "手指在腹肌上滑动", "亲吻腰侧，敏感带探索"], unlocked: false, completed: 0 },
  { id: "thighs", name: "大腿", icon: "🦵", position: "大腿内侧", tasks: ["从膝盖慢慢吻到大腿内侧", "用手指在大腿内侧画圈，越来越靠近", "轻咬大腿内侧，留下痕迹", "蒙眼让对方猜亲的是哪里"], unlocked: false, completed: 0 },
  { id: "feet", name: "脚部", icon: "🦶", position: "脚尖与脚底", tasks: ["亲吻脚尖，一根根舔脚趾", "用手指划过脚底，看对方反应", "按摩脚踝，慢慢往上", "用脚挑逗对方敏感部位"], unlocked: false, completed: 0 },
];

// 音效工具
const useSound = () => {
  const audioCtx = useRef<AudioContext | null>(null);
  
  const play = useCallback((type: "click" | "success" | "fail" | "unlock" | "tick") => {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "click") {
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "success") {
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "fail") {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "unlock") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "tick") {
        osc.frequency.value = 1000;
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {}
  }, []);

  return play;
};

export default function SensesGame() {
  const [layer, setLayer] = useState<Layer>("menu");
  const [bodyParts, setBodyParts] = useState<BodyPart[]>(defaultBodyParts);
  const [currentPart, setCurrentPart] = useState<BodyPart | null>(null);
  const [currentTask, setCurrentTask] = useState("");
  const [taskIndex, setTaskIndex] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [editingPart, setEditingPart] = useState<string>("");
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const play = useSound();

  useEffect(() => {
    const saved = localStorage.getItem("senses_progress");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setBodyParts(defaultBodyParts.map((p, i) => ({
          ...p,
          unlocked: data[i]?.unlocked ?? p.unlocked,
          completed: data[i]?.completed ?? 0,
          tasks: data[i]?.tasks ?? p.tasks,
        })));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("senses_progress", JSON.stringify(bodyParts.map((p) => ({ unlocked: p.unlocked, completed: p.completed, tasks: p.tasks }))));
  }, [bodyParts]);

  const goBack = () => {
    play("click");
    if (layer === "map") setLayer("menu");
    else if (layer === "task") setLayer("map");
    else if (layer === "editor") setLayer("menu");
  };

  const selectPart = (part: BodyPart) => {
    if (!part.unlocked) { play("fail"); return; }
    play("click");
    setCurrentPart(part);
    setTaskIndex(0);
    setCurrentTask(part.tasks[0]);
    setLayer("task");
  };

  const nextTask = () => {
    play("click");
    if (!currentPart) return;
    const nextIdx = (taskIndex + 1) % currentPart.tasks.length;
    setTaskIndex(nextIdx);
    setCurrentTask(currentPart.tasks[nextIdx]);
  };

  const completeTask = () => {
    if (!currentPart) return;
    play("success");
    
    // 粒子特效
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);

    setShowComplete(true);
    setTimeout(() => setShowComplete(false), 1500);

    setBodyParts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === currentPart.id) {
          const newCompleted = Math.min(p.tasks.length, p.completed + 1);
          return { ...p, completed: newCompleted };
        }
        return p;
      });

      // 检查是否解锁下一个区域
      const idx = updated.findIndex((p) => p.id === currentPart.id);
      if (updated[idx].completed >= updated[idx].tasks.length && idx + 1 < updated.length && !updated[idx + 1].unlocked) {
        updated[idx + 1] = { ...updated[idx + 1], unlocked: true };
        setTimeout(() => play("unlock"), 500);
      }
      return updated;
    });
  };

  const totalProgress = Math.round((bodyParts.reduce((s, p) => s + p.completed, 0) / bodyParts.reduce((s, p) => s + p.tasks.length, 0)) * 100);
  const unlockedCount = bodyParts.filter((p) => p.unlocked).length;

  const addTask = () => {
    if (!newTask.trim() || !editingPart) return;
    play("click");
    setBodyParts((prev) => prev.map((p) => p.id === editingPart ? { ...p, tasks: [...p.tasks, newTask.trim()] } : p));
    setNewTask("");
  };

  const removeTask = (partId: string, idx: number) => {
    play("click");
    setBodyParts((prev) => prev.map((p) => p.id === partId ? { ...p, tasks: p.tasks.filter((_, i) => i !== idx) } : p));
  };

  const resetProgress = () => {
    play("fail");
    setBodyParts(defaultBodyParts);
  };

  const BackButton = () => (
    <button onClick={goBack} className="mb-4 flex items-center gap-1 text-xs text-white/50 transition hover:text-white/80">
      ← 返回上一层
    </button>
  );

  return (
    <LicenseGate gameName="感官探索">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-4 py-6">
        <div className="game-container w-full relative overflow-hidden">
          {/* 粒子特效 */}
          {particles.map((p) => (
            <div key={p.id} className="pointer-events-none absolute text-xl animate-ping" style={{ left: `${p.x}%`, top: `${p.y}%` }}>✨</div>
          ))}

          {/* 主菜单 */}
          {layer === "menu" && (
            <div className="text-center">
              <div className="mb-4 text-6xl animate-pulse">🌙</div>
              <h1 className="mb-2 text-2xl font-bold text-white">感官探索</h1>
              <p className="mb-6 text-sm text-white/70">身体地图关卡解锁，从头到脚探索每一寸敏感地带</p>
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-white/60">总进度</span>
                  <span className="font-bold text-pink-300">{totalProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-500" style={{ width: `${totalProgress}%` }} />
                </div>
                <p className="mt-2 text-[10px] text-white/40">已解锁 {unlockedCount}/{bodyParts.length} 个区域</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => { play("click"); setLayer("map"); }} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60 hover:scale-[1.02]">
                  🗺️ 开始探索
                </button>
                <button onClick={() => { play("click"); setLayer("editor"); }} className="w-full rounded-full border border-white/15 bg-white/5 py-3 text-sm text-white/70 transition hover:bg-white/10">
                  ✏️ 编辑任务库
                </button>
                <button onClick={resetProgress} className="w-full rounded-full border border-red-400/20 bg-red-500/5 py-2 text-xs text-red-300/60 transition hover:bg-red-500/10">
                  🔄 重置进度
                </button>
              </div>
            </div>
          )}

          {/* 身体地图 */}
          {layer === "map" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">身体地图</h2>
              <p className="mb-4 text-center text-xs text-white/50">完成一个区域的所有任务，解锁下一个区域</p>
              <div className="space-y-2">
                {bodyParts.map((part) => (
                  <button key={part.id} onClick={() => selectPart(part)} disabled={!part.unlocked} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                    part.unlocked ? "border-white/10 bg-white/5 hover:border-pink-400/50 hover:bg-pink-500/10 hover:scale-[1.02]" : "border-white/5 bg-black/20 opacity-40 cursor-not-allowed"
                  }`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${part.unlocked ? "bg-gradient-to-br from-pink-500/20 to-purple-500/20" : "bg-white/5"}`}>
                      {part.unlocked ? part.icon : "🔒"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{part.name}</p>
                      <p className="text-[10px] text-white/50">{part.position}</p>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all" style={{ width: `${(part.completed / part.tasks.length) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-pink-300">{part.completed}/{part.tasks.length}</p>
                      {part.completed >= part.tasks.length && part.unlocked && <p className="text-[10px] text-green-400">✅ 完成</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 任务执行 */}
          {layer === "task" && currentPart && (
            <div>
              <BackButton />
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentPart.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{currentPart.name}</p>
                    <p className="text-[10px] text-white/50">第 {taskIndex + 1}/{currentPart.tasks.length} 个任务</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-pink-300">{currentPart.completed}/{currentPart.tasks.length}</p>
                </div>
              </div>

              {/* 完成动画 */}
              {showComplete && (
                <div className="mb-4 animate-bounce rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-center">
                  <p className="text-lg font-bold text-green-200">✅ 任务完成！</p>
                  {currentPart.completed + 1 >= currentPart.tasks.length && <p className="text-xs text-green-300 mt-1">🎉 本区域全部完成，下一个区域已解锁！</p>}
                </div>
              )}

              {/* 任务卡片 */}
              <div className="mb-4 relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-pink-500/15 p-6">
                <div className="absolute -right-4 -top-4 text-7xl opacity-10">{currentPart.icon}</div>
                <div className="relative z-10">
                  <p className="mb-3 text-[10px] text-pink-300">感官任务</p>
                  <p className="text-base leading-relaxed text-white">{currentTask}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button onClick={completeTask} className="w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/40 transition hover:shadow-green-500/60 hover:scale-[1.02]">
                  ✅ 完成此任务
                </button>
                <button onClick={nextTask} className="w-full rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/60 transition hover:bg-white/10">
                  ⏭️ 跳过/下一个
                </button>
              </div>
            </div>
          )}

          {/* 编辑任务库 */}
          {layer === "editor" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">✏️ 编辑任务库</h2>
              <div className="mb-4">
                <p className="mb-2 text-xs text-white/60">选择区域：</p>
                <div className="flex flex-wrap gap-1.5">
                  {bodyParts.map((p) => (
                    <button key={p.id} onClick={() => { play("click"); setEditingPart(p.id); }} className={`rounded-full px-3 py-1 text-[11px] transition ${editingPart === p.id ? "bg-pink-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                      {p.icon} {p.name}
                    </button>
                  ))}
                </div>
              </div>
              {editingPart && (
                <>
                  <div className="mb-4 flex gap-2">
                    <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="输入新任务..." className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400/50" />
                    <button onClick={addTask} className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-400">添加</button>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {bodyParts.find((p) => p.id === editingPart)?.tasks.map((t, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <span className="text-sm text-white/80">{t}</span>
                        <button onClick={() => removeTask(editingPart, i)} className="ml-2 text-red-400 hover:text-red-300">🗑️</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {!editingPart && <p className="text-center text-sm text-white/40">请先选择一个区域</p>}
              <p className="mt-4 text-center text-[10px] text-white/30">修改自动保存</p>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
