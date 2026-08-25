"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState, useEffect } from "react";

type Mode = "truth" | "dare" | "intimate";
type GameMode = "turn" | "battle" | "coop";

const truthQuestions = [
  "第一次意识到自己喜欢男生是什么时候？",
  "第一次和男生接吻是什么感觉？",
  "你是1还是0？有没有试过互攻？",
  "交往过几个男朋友？最长的一段多久？",
  "最喜欢对方身上哪个部位？",
  "最想和对方在什么地方做？",
  "有没有过三人行的幻想？",
  "最喜欢什么姿势？为什么？",
  "对方做过最让你感动的事？",
  "有没有偷偷看过对方手机？",
  "最想让对方为你做什么事？",
  "有没有在公共场合有过亲密行为？",
  "最羞耻的一次性经历？",
  "有没有约过炮？最多一天几次？",
  "最喜欢对方穿什么颜色的内裤？",
  "有没有幻想过和其他男生做？",
  "第一次做1/0是什么感受？",
  "最想尝试但还没试过的玩法？",
  "对方的什么小习惯最让你心动？",
  "有没有在洗澡的时候做过？",
  "出柜了吗？家人知道吗？",
  "第一次和男生约会去了哪里？",
  "有没有被直男撩过？什么感觉？",
  "最喜欢对方叫你什么？",
  "有没有在异地的时候视频做过？",
];

const dareTasks = [
  "深情对视30秒，然后主动吻对方",
  "用撒娇的语气叫对方老公/老婆",
  "在对方脖子上种一个草莓",
  "模仿对方高潮时的表情和声音",
  "脱掉上衣，让对方在你胸口画爱心",
  "用嘴解开对方的皮带扣",
  "趴在对方耳边说一句最骚的话",
  "让对方摸你腹肌/胸肌1分钟",
  "用舌头在对方后背写自己的名字",
  "公主抱对方做5个深蹲",
  "用屁股蹭对方敏感部位10秒",
  "在对方大腿内侧留个吻痕",
  "模仿gay片里的经典台词和动作",
  "用嘴喂对方喝一口水",
  "穿对方的内裤走一圈",
  "在对方面前做10个俯卧撑，每做一个亲一下",
  "用手指在对方手心画圈，看对方能不能忍住不笑",
  "蒙眼让对方亲你不同部位，猜是哪里",
  "边脱衣服边跳一段性感舞蹈",
  "用牙齿轻咬对方耳垂",
  "在对方耳边吹气然后舔脖子",
  "模仿对方平时说话的语气",
  "用鼻子蹭对方的鼻子然后亲一下",
];

const intimateTasks = [
  "互相帮对方打飞机，看谁先忍不住",
  "69式互相口，坚持3分钟",
  "用润滑油在对方身上做全身按摩",
  "蒙眼绑住手，让对方对你为所欲为",
  "在浴室里边洗澡边做",
  "尝试一个新姿势，互相配合",
  "用冰块在对方敏感部位滑动",
  "穿情趣内衣/制服角色扮演",
  "在镜子前做，看着对方的眼睛",
  "互相舔乳头，直到对方求饶",
  "用手指扩张，慢慢进入",
  "在阳台/窗边做，感受被发现的刺激",
  "用玩具互相挑逗，看谁先投降",
  "边看gay片边模仿里面的动作",
  "在身上滴蜡（低温蜡烛），感受刺激",
  "互相用脚挑逗对方敏感部位",
  "在车里做，感受狭小空间的刺激",
  "用舌头从耳朵慢慢舔到肚脐",
  "尝试后入式，拍打对方屁股",
  "互相说dirty talk，越骚越好",
  "互相KJ，比赛谁坚持的时间长",
  "用润滑剂尝试不同的进入方式",
  "边做边录视频（事后可删）",
  "尝试角色扮演，老师学生/医生病人",
];

const modeInfo = {
  truth: { label: "真心话", icon: "💬", color: "from-blue-500 to-cyan-500", desc: "深入了解彼此的秘密" },
  dare: { label: "大冒险", icon: "🎯", color: "from-orange-500 to-red-500", desc: "刺激有趣的挑战任务" },
  intimate: { label: "亲密时刻", icon: "🔥", color: "from-pink-500 to-rose-500", desc: "仅限两人的私密玩法" },
};

export default function GayGame() {
  const [started, setStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("turn");
  const [mode, setMode] = useState<Mode | null>(null);
  const [current, setCurrent] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<"A" | "B">("A");
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [nameA, setNameA] = useState("他A");
  const [nameB, setNameB] = useState("他B");

  const draw = (type: Mode) => {
    let pool: string[];
    if (type === "truth") pool = truthQuestions;
    else if (type === "dare") pool = dareTasks;
    else pool = intimateTasks;

    let text;
    let attempts = 0;
    do {
      text = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
    } while (history.includes(text) && attempts < pool.length);

    if (history.length >= pool.length * 2) {
      setHistory([]);
    } else {
      setHistory([...history, text]);
    }
    setCurrent(text);
    setMode(type);
    setShowResult(false);
  };

  const completeTask = (success: boolean) => {
    setShowResult(true);
    setCompleted(success);
    if (success) {
      if (currentPlayer === "A") setScoreA((s) => s + 1);
      else setScoreB((s) => s + 1);
    }
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    if (gameMode === "turn") {
      setCurrentPlayer(currentPlayer === "A" ? "B" : "A");
    }
    setCurrent("");
    setMode(null);
    setShowResult(false);
    setCompleted(false);
  };

  const randomAll = () => {
    const modes: Mode[] = ["truth", "dare", "intimate"];
    draw(modes[Math.floor(Math.random() * modes.length)]);
  };

  const restart = () => {
    setStarted(false);
    setMode(null);
    setCurrent("");
    setHistory([]);
    setRound(1);
    setScoreA(0);
    setScoreB(0);
    setCurrentPlayer("A");
    setShowResult(false);
    setCompleted(false);
  };

  const gameModeInfo = {
    turn: { label: "轮流模式", icon: "🔄", desc: "两人轮流抽卡执行" },
    battle: { label: "对战模式", icon: "⚔️", desc: "完成得分，比拼胜负" },
    coop: { label: "合作模式", icon: "🤝", desc: "一起完成，不计胜负" },
  };

  return (
    <LicenseGate gameName="他与他">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-6">
        <div className="game-container w-full">
          {!started && (
            <div className="text-center">
              <div className="mb-4 text-6xl">👨‍❤️‍👨</div>
              <h1 className="mb-1 text-2xl font-bold text-white">他与他</h1>
              <p className="mb-1 text-sm text-pink-300">🌈 专为男同情侣设计</p>
              <p className="mb-5 text-sm text-white/70">真心话、大冒险、亲密时刻，属于两个男生的深夜游戏</p>

              {/* 游戏模式选择 */}
              <p className="mb-2 text-left text-xs font-semibold text-white/60">选择游戏模式</p>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {(Object.keys(gameModeInfo) as GameMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setGameMode(m)}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      gameMode === m
                        ? "border-pink-400 bg-pink-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-xl">{gameModeInfo[m].icon}</div>
                    <p className="mt-1 text-[11px] font-bold">{gameModeInfo[m].label}</p>
                    <p className="mt-0.5 text-[9px] opacity-70">{gameModeInfo[m].desc}</p>
                  </button>
                ))}
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                {(Object.keys(modeInfo) as Mode[]).map((m) => (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-2xl">{modeInfo[m].icon}</div>
                    <p className="mt-1 text-[10px] text-white/60">{modeInfo[m].label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs text-white/60">
                <p className="mb-1 font-semibold text-white/80">📋 游戏内容：</p>
                <p>• 💬 真心话：{truthQuestions.length}道深入问题</p>
                <p>• 🎯 大冒险：{dareTasks.length}个刺激挑战</p>
                <p>• 🔥 亲密时刻：{intimateTasks.length}种私密玩法</p>
                <p>• 支持计分对战、轮流、合作三种模式</p>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
              >
                🌈 开始游戏
              </button>
            </div>
          )}

          {started && (
            <div>
              {/* 顶部状态栏 */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[10px] text-white/40">第 {round} 轮</p>
                  <p className="text-[10px] text-white/30">{gameModeInfo[gameMode].label}</p>
                </div>
                {gameMode === "battle" && (
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-[10px] text-pink-300">{nameA}</p>
                      <p className="text-lg font-bold text-pink-200">{scoreA}</p>
                    </div>
                    <span className="text-white/30">:</span>
                    <div className="text-center">
                      <p className="text-[10px] text-purple-300">{nameB}</p>
                      <p className="text-lg font-bold text-purple-200">{scoreB}</p>
                    </div>
                  </div>
                )}
                {gameMode === "turn" && (
                  <div className={`rounded-full px-3 py-1 text-xs font-bold ${
                    currentPlayer === "A" ? "bg-pink-500/20 text-pink-300" : "bg-purple-500/20 text-purple-300"
                  }`}>
                    {currentPlayer === "A" ? nameA : nameB} 的回合
                  </div>
                )}
              </div>

              {/* 当前任务 */}
              {current && (
                <div className="mb-4">
                  <div className={`relative overflow-hidden rounded-2xl border p-5 ${
                    mode === "truth" ? "border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-cyan-500/10" :
                    mode === "dare" ? "border-orange-400/30 bg-gradient-to-br from-orange-500/15 to-red-500/10" :
                    "border-pink-400/30 bg-gradient-to-br from-pink-500/15 to-rose-500/10"
                  }`}>
                    <div className="absolute -right-3 -top-3 text-5xl opacity-10">
                      {modeInfo[mode!].icon}
                    </div>
                    <div className="relative z-10">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xl">{modeInfo[mode!].icon}</span>
                        <span className={`rounded-full bg-gradient-to-r ${modeInfo[mode!].color} px-3 py-0.5 text-[10px] font-semibold text-white`}>
                          {modeInfo[mode!].label}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-white">{current}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 完成结果 */}
              {showResult && (
                <div className={`mb-4 rounded-xl border p-3 text-center ${
                  completed ? "border-green-400/30 bg-green-500/10" : "border-red-400/30 bg-red-500/10"
                }`}>
                  <p className={`text-sm font-bold ${completed ? "text-green-200" : "text-red-200"}`}>
                    {completed ? "✅ 完成！+1分" : "❌ 未完成"}
                  </p>
                </div>
              )}

              {/* 选择模式抽卡 */}
              {!current && (
                <div className="mb-4 space-y-2">
                  <p className="text-center text-sm text-white/60 mb-3">选择一个模式抽卡</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(modeInfo) as Mode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => draw(m)}
                        className={`rounded-xl border bg-gradient-to-br ${modeInfo[m].color} p-3 text-center text-white transition hover:scale-105 hover:shadow-lg`}
                      >
                        <div className="text-2xl">{modeInfo[m].icon}</div>
                        <p className="mt-1 text-[11px] font-bold">{modeInfo[m].label}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={randomAll}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs text-white/60 transition hover:bg-white/10"
                  >
                    🎲 随机全部
                  </button>
                </div>
              )}

              {/* 操作按钮 */}
              {current && !showResult && gameMode !== "coop" && (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => completeTask(true)}
                    className="rounded-full bg-green-500 py-2.5 text-sm font-semibold text-white transition hover:bg-green-400"
                  >
                    ✅ 完成了
                  </button>
                  <button
                    onClick={() => completeTask(false)}
                    className="rounded-full bg-red-500/80 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                  >
                    ❌ 没完成
                  </button>
                </div>
              )}

              {current && (
                <div className="space-y-2">
                  <button
                    onClick={nextRound}
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
                  >
                    {showResult ? "下一轮 →" : "跳过此题"}
                  </button>
                  <button
                    onClick={() => { setCurrent(""); setMode(null); }}
                    className="w-full rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/50 transition hover:bg-white/10"
                  >
                    重新抽卡
                  </button>
                </div>
              )}

              <button
                onClick={restart}
                className="mt-2 w-full rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/50 transition hover:bg-white/10"
              >
                🔄 重新开始
              </button>

              <p className="mt-4 text-center text-[10px] text-white/30">🌈 爱就是爱，勇敢做自己</p>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
