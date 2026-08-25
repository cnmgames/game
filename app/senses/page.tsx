"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState } from "react";

const tasks = [
  { type: "触觉", icon: "✋", text: "蒙眼状态下，用手指从对方额头慢慢滑到下巴，感受每一寸肌肤" },
  { type: "触觉", icon: "✋", text: "用舌尖在对方脖子上慢慢画圈，直到对方发出声音" },
  { type: "触觉", icon: "✋", text: "用手指在对方后背写字，让对方猜写的是什么，猜错有惩罚" },
  { type: "触觉", icon: "✋", text: "从背后抱住对方，手慢慢游走，每停一处问对方喜不喜欢" },
  { type: "嗅觉", icon: "👃", text: "蒙眼闻对方身体不同部位的味道，说出是哪里" },
  { type: "嗅觉", icon: "👃", text: "在对方脖子、胸口、手腕各亲一下，让对方蒙眼分辨是哪个部位" },
  { type: "味觉", icon: "👅", text: "用嘴把一口温水喂给对方，然后深吻" },
  { type: "味觉", icon: "👅", text: "在对方身上滴一滴蜂蜜/糖浆，用舌头慢慢舔干净" },
  { type: "听觉", icon: "👂", text: "在对方耳边用最骚的声音说一句想对他做的事" },
  { type: "听觉", icon: "👂", text: "蒙眼，让对方在你耳边发出不同的声音，猜他在做什么" },
  { type: "视觉", icon: "👁️", text: "对视30秒，谁先笑谁就接受对方的任意惩罚" },
  { type: "视觉", icon: "👁️", text: "在对方面前慢慢脱一件衣服，每脱一个动作停3秒" },
  { type: "综合", icon: "🔥", text: "蒙眼，对方可以用嘴/手/身体任何部位触碰你，你要说出是什么部位" },
  { type: "综合", icon: "🔥", text: "用冰块在对方身上慢慢滑动，从脖子到大腿内侧，观察对方反应" },
  { type: "综合", icon: "🔥", text: "互相按摩，但只能用舌头，从肩膀开始慢慢往下" },
  { type: "综合", icon: "🔥", text: "蒙眼绑住手，对方可以对你做任何事，你只能用声音回应" },
  { type: "综合", icon: "🔥", text: "在对方敏感部位呼热气，然后突然用舌头舔，看对方的反应" },
  { type: "综合", icon: "🔥", text: "用手指在对方大腿内侧画圈，越来越靠近但就是不碰敏感处" },
];

export default function SensesGame() {
  const [started, setStarted] = useState(false);
  const [currentTask, setCurrentTask] = useState<typeof tasks[0] | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [blindfold, setBlindfold] = useState(false);

  const drawTask = () => {
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
  };

  const restart = () => {
    setStarted(false);
    setCurrentTask(null);
    setHistory([]);
    setBlindfold(false);
  };

  return (
    <LicenseGate gameName="感官探索">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-4">
        <div className="game-container w-full">
          {!started && (
            <div className="text-center">
              <div className="mb-3 text-5xl">🌙</div>
              <h1 className="mb-2 text-xl font-bold text-white">感官探索</h1>
              <p className="mb-4 text-sm text-white/70">蒙眼+触觉+嗅觉+味觉，放大每一次触碰的快感，探索彼此的敏感地带</p>
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs text-white/60">
                <p className="mb-1">📋 玩法：</p>
                <p>• 抽取感官任务卡，按要求执行</p>
                <p>• 很多任务需要蒙眼，放大其他感官</p>
                <p>• 轮流执行，每人抽一张</p>
                <p>• 尽情感受对方的每一次触碰</p>
              </div>
              <button
                onClick={() => setStarted(true)}
                className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
              >
                开始探索
              </button>
            </div>
          )}

          {started && (
            <div>
              <div className="mb-3 text-center text-xs text-white/50">已完成 {history.length} / {tasks.length} 个任务</div>

              {blindfold && currentTask && (
                <div className="mb-3 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-2 text-center text-xs text-yellow-200">
                  😎 本任务需要蒙眼，请准备好眼罩
                </div>
              )}

              {currentTask && (
                <div className="mb-4 rounded-xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{currentTask.icon}</span>
                    <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-xs text-pink-200">{currentTask.type}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white">{currentTask.text}</p>
                </div>
              )}

              {!currentTask && (
                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-4xl mb-2">🎲</p>
                  <p className="text-sm text-white/50">点击下方按钮抽取任务</p>
                </div>
              )}

              <button
                onClick={drawTask}
                className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
              >
                {currentTask ? "下一个任务" : "抽取任务"}
              </button>

              <button
                onClick={restart}
                className="mt-2 w-full rounded-full border border-white/20 bg-white/5 py-2 text-xs text-white/60 transition hover:bg-white/10"
              >
                重新开始
              </button>

              <p className="mt-3 text-center text-xs text-white/40">放慢节奏，用心感受每一个瞬间</p>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
