"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState, useEffect } from "react";

const scenarios = [
  {
    name: "老师与学生",
    icon: "👩‍🏫",
    gradient: "from-blue-500 to-purple-500",
    roles: ["老师", "学生"],
    difficulty: "⭐⭐",
    tasks: [
      "学生放学后被老师留下补课，老师慢慢靠近",
      "学生做错题目，老师用特殊方式惩罚",
      "老师在讲台上讲课，学生在桌下搞小动作",
      "学生请教问题，身体越靠越近",
      "老师批改作业时，学生从背后抱住老师",
      "老师要求学生跪在讲台前听讲",
      "学生考试不及格，老师要求课后单独辅导",
    ],
  },
  {
    name: "医生与病人",
    icon: "👨‍⚕️",
    gradient: "from-green-500 to-teal-500",
    roles: ["医生", "病人"],
    difficulty: "⭐⭐⭐",
    tasks: [
      "病人来做全身检查，医生要求脱掉外套",
      "医生用听诊器听心跳，手慢慢往下移",
      "病人说身体不舒服，医生用特殊方式治疗",
      "体检时医生要求做各种羞羞的姿势",
      "病房里只有医生和病人，发生了不该发生的事",
      "医生要求病人趴在床上检查臀部",
      "病人发烧，医生用身体帮病人降温",
    ],
  },
  {
    name: "上司与下属",
    icon: "💼",
    gradient: "from-gray-500 to-slate-600",
    roles: ["上司", "下属"],
    difficulty: "⭐⭐",
    tasks: [
      "下属加班到深夜，上司来到办公室",
      "下属工作出错，上司要求特殊的补偿方式",
      "会议室里只有两个人，上司慢慢靠近",
      "出差住同一间房，发生了尴尬又刺激的事",
      "上司把下属叫到办公室，关上门拉上窗帘",
      "上司要求下属穿着性感来上班",
      "电梯故障，孤男寡女被困半小时",
    ],
  },
  {
    name: "快递员与住户",
    icon: "📦",
    gradient: "from-orange-500 to-red-500",
    roles: ["快递员", "住户"],
    difficulty: "⭐⭐⭐",
    tasks: [
      "快递员送错快递，住户要求当面拆开检查",
      "住户穿着睡衣开门取快递，快递员看呆了",
      "快递很重，快递员帮忙搬进屋，然后...",
      "下雨天快递员来躲雨，孤男寡女共处一室",
      "货到付款但住户没钱，提出用其他方式支付",
      "快递员要求签收时按手印，按在奇怪的地方",
      "住户订购了情趣用品，快递员好奇里面是什么",
    ],
  },
  {
    name: "按摩师与顾客",
    icon: "💆",
    gradient: "from-pink-500 to-rose-500",
    roles: ["按摩师", "顾客"],
    difficulty: "⭐⭐⭐⭐",
    tasks: [
      "顾客要求全身按摩，按摩师慢慢解开顾客衣服",
      "按摩师的手越来越不规矩，顾客没有拒绝",
      "精油按摩，按摩师的手滑过每一寸肌肤",
      "顾客要求特殊服务，按摩师心领神会",
      "按摩到敏感部位，顾客忍不住发出声音",
      "按摩师要求顾客翻身，正面朝上继续",
      "顾客抓住按摩师的手，引导到自己身上",
    ],
  },
  {
    name: "摄影师与模特",
    icon: "📸",
    gradient: "from-purple-500 to-indigo-500",
    roles: ["摄影师", "模特"],
    difficulty: "⭐⭐⭐",
    tasks: [
      "拍摄写真，摄影师要求模特慢慢脱掉外套",
      "摄影师指导模特摆出各种性感姿势",
      "拍摄间隙，摄影师帮模特整理衣服，手慢慢游走",
      "私房照拍摄，房间里只有两个人",
      "摄影师说光线不好，要求模特靠近一点",
      "模特摆出诱惑姿势，摄影师忍不住放下相机",
      "拍摄结束后，模特问摄影师要不要看样片",
    ],
  },
];

export default function RoleplayGame() {
  const [selected, setSelected] = useState<number | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [roleA, setRoleA] = useState("");
  const [roleB, setRoleB] = useState("");
  const [nameA, setNameA] = useState("玩家A");
  const [nameB, setNameB] = useState("玩家B");
  const [editingName, setEditingName] = useState<"A" | "B" | null>(null);
  const [tempName, setTempName] = useState("");
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [flipping, setFlipping] = useState(false);

  const selectScenario = (idx: number) => {
    setSelected(idx);
    setTaskIndex(0);
    setCurrentTask("");
    setRoleA(scenarios[idx].roles[0]);
    setRoleB(scenarios[idx].roles[1]);
    setCompletedTasks([]);
    setShowIntro(true);
  };

  const startPlay = () => {
    setShowIntro(false);
    nextTask();
  };

  const nextTask = () => {
    setFlipping(true);
    setTimeout(() => {
      const scenario = scenarios[selected!];
      let idx;
      do {
        idx = Math.floor(Math.random() * scenario.tasks.length);
      } while (completedTasks.includes(idx) && completedTasks.length < scenario.tasks.length);
      
      if (completedTasks.length >= scenario.tasks.length) {
        setCompletedTasks([]);
      } else {
        setCompletedTasks([...completedTasks, idx]);
      }
      setCurrentTask(scenario.tasks[idx]);
      setTaskIndex(completedTasks.length + 1);
      setFlipping(false);
    }, 300);
  };

  const swapRoles = () => {
    const temp = roleA;
    setRoleA(roleB);
    setRoleB(temp);
    const tempName = nameA;
    setNameA(nameB);
    setNameB(tempName);
  };

  const startEditName = (who: "A" | "B") => {
    setEditingName(who);
    setTempName(who === "A" ? nameA : nameB);
  };

  const saveName = () => {
    if (editingName === "A" && tempName.trim()) setNameA(tempName.trim());
    if (editingName === "B" && tempName.trim()) setNameB(tempName.trim());
    setEditingName(null);
  };

  const randomScenario = () => {
    const idx = Math.floor(Math.random() * scenarios.length);
    selectScenario(idx);
  };

  const back = () => {
    setSelected(null);
    setCurrentTask("");
    setShowIntro(true);
  };

  const progress = selected ? (completedTasks.length / scenarios[selected].tasks.length) * 100 : 0;

  return (
    <LicenseGate gameName="角色扮演剧场">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-6">
        <div className="game-container w-full">
          {/* 场景选择 */}
          {selected === null && (
            <div className="text-center">
              <div className="mb-4 text-6xl">🎭</div>
              <h1 className="mb-2 text-2xl font-bold text-white">角色扮演剧场</h1>
              <p className="mb-5 text-sm text-white/70">选择场景，分配角色，跟随剧情释放想象</p>
              
              <button
                onClick={randomScenario}
                className="mb-5 w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
              >
                🎲 随机场景
              </button>

              <div className="grid grid-cols-2 gap-3">
                {scenarios.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectScenario(i)}
                    className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${s.gradient} p-4 text-left transition-all hover:scale-105 hover:border-white/30`}
                  >
                    <div className="absolute -right-2 -top-2 text-4xl opacity-30">{s.icon}</div>
                    <div className="relative z-10">
                      <div className="mb-1 text-2xl">{s.icon}</div>
                      <p className="text-sm font-bold text-white">{s.name}</p>
                      <p className="mt-0.5 text-[10px] text-white/70">{s.roles[0]}×{s.roles[1]}</p>
                      <p className="mt-1 text-[10px] text-white/60">难度 {s.difficulty}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 游戏中 */}
          {selected !== null && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <button onClick={back} className="flex items-center gap-1 text-xs text-white/50 transition hover:text-white/80">
                  ← 换场景
                </button>
                <span className="text-2xl">{scenarios[selected].icon}</span>
                <div className="text-right">
                  <p className="text-[10px] text-white/40">进度</p>
                  <p className="text-xs font-bold text-pink-300">{completedTasks.length}/{scenarios[selected].tasks.length}</p>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <h2 className="mb-4 text-center text-lg font-bold text-white">{scenarios[selected].name}</h2>

              {/* 角色分配卡片 */}
              <div className="mb-4 flex justify-center gap-3">
                <div className="flex-1 rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-600/5 p-3 text-center">
                  <p className="text-[10px] text-pink-300/70">玩家A</p>
                  {editingName === "A" ? (
                    <div className="mt-1">
                      <input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        className="w-full rounded bg-black/30 px-2 py-1 text-center text-xs text-white outline-none"
                        autoFocus
                      />
                      <button onClick={saveName} className="mt-1 text-[10px] text-pink-300">保存</button>
                    </div>
                  ) : (
                    <p onClick={() => startEditName("A")} className="cursor-pointer text-sm font-bold text-pink-200">
                      {nameA}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs font-semibold text-white">{roleA}</p>
                </div>
                <div className="flex items-center text-white/30">⚔️</div>
                <div className="flex-1 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-3 text-center">
                  <p className="text-[10px] text-purple-300/70">玩家B</p>
                  {editingName === "B" ? (
                    <div className="mt-1">
                      <input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        className="w-full rounded bg-black/30 px-2 py-1 text-center text-xs text-white outline-none"
                        autoFocus
                      />
                      <button onClick={saveName} className="mt-1 text-[10px] text-purple-300">保存</button>
                    </div>
                  ) : (
                    <p onClick={() => startEditName("B")} className="cursor-pointer text-sm font-bold text-purple-200">
                      {nameB}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs font-semibold text-white">{roleB}</p>
                </div>
              </div>

              <button
                onClick={swapRoles}
                className="mb-5 w-full rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/60 transition hover:bg-white/10"
              >
                🔄 交换角色
              </button>

              {/* 剧情介绍 */}
              {showIntro && (
                <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  <div className="mb-3 text-4xl">{scenarios[selected].icon}</div>
                  <p className="mb-2 text-sm font-semibold text-white">场景：{scenarios[selected].name}</p>
                  <p className="text-xs leading-relaxed text-white/60">
                    {nameA} 扮演 {roleA}，{nameB} 扮演 {roleB}。
                    跟随剧情任务，尽情投入角色，释放你们的想象。
                  </p>
                  <button
                    onClick={startPlay}
                    className="mt-4 w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
                  >
                    🎬 开始演绎
                  </button>
                </div>
              )}

              {/* 剧情任务卡片 */}
              {!showIntro && currentTask && (
                <div className={`mb-5 transform transition-all duration-300 ${flipping ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}>
                  <div className="relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-pink-500/15 p-5">
                    <div className="absolute -right-4 -top-4 text-6xl opacity-10">{scenarios[selected].icon}</div>
                    <div className="relative z-10">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-full bg-pink-500/20 px-3 py-1 text-[10px] font-semibold text-pink-200">
                          剧情任务 {taskIndex}
                        </span>
                        <span className="text-[10px] text-white/40">{scenarios[selected].difficulty}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-white">{currentTask}</p>
                    </div>
                  </div>
                </div>
              )}

              {!showIntro && (
                <div className="space-y-2">
                  <button
                    onClick={nextTask}
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60"
                  >
                    {currentTask ? "📖 下一个剧情" : "🎬 抽取剧情"}
                  </button>
                  <button
                    onClick={() => setShowIntro(true)}
                    className="w-full rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/50 transition hover:bg-white/10"
                  >
                    查看场景介绍
                  </button>
                </div>
              )}

              <p className="mt-4 text-center text-[10px] text-white/30">尽情投入角色，释放想象 ✨</p>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
