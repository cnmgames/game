"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState } from "react";

const scenarios = [
  {
    name: "老师与学生",
    icon: "👩‍🏫",
    roles: ["老师", "学生"],
    tasks: [
      "学生放学后被老师留下补课，老师慢慢靠近",
      "学生做错题目，老师用特殊方式惩罚",
      "老师在讲台上讲课，学生在桌下搞小动作",
      "学生请教问题，身体越靠越近",
      "老师批改作业时，学生从背后抱住老师",
    ],
  },
  {
    name: "医生与病人",
    icon: "👨‍⚕️",
    roles: ["医生", "病人"],
    tasks: [
      "病人来做全身检查，医生要求脱掉外套",
      "医生用听诊器听心跳，手慢慢往下移",
      "病人说身体不舒服，医生用特殊方式治疗",
      "体检时医生要求做各种羞羞的姿势",
      "病房里只有医生和病人，发生了不该发生的事",
    ],
  },
  {
    name: "上司与下属",
    icon: "💼",
    roles: ["上司", "下属"],
    tasks: [
      "下属加班到深夜，上司来到办公室",
      "下属工作出错，上司要求特殊的补偿方式",
      "会议室里只有两个人，上司慢慢靠近",
      "出差住同一间房，发生了尴尬又刺激的事",
      "上司把下属叫到办公室，关上门拉上窗帘",
    ],
  },
  {
    name: "快递员与住户",
    icon: "📦",
    roles: ["快递员", "住户"],
    tasks: [
      "快递员送错快递，住户要求当面拆开检查",
      "住户穿着睡衣开门取快递，快递员看呆了",
      "快递很重，快递员帮忙搬进屋，然后...",
      "下雨天快递员来躲雨，孤男寡女共处一室",
      "货到付款但住户没钱，提出用其他方式支付",
    ],
  },
  {
    name: "按摩师与顾客",
    icon: "💆",
    roles: ["按摩师", "顾客"],
    tasks: [
      "顾客要求全身按摩，按摩师慢慢解开顾客衣服",
      "按摩师的手越来越不规矩，顾客没有拒绝",
      "精油按摩，按摩师的手滑过每一寸肌肤",
      "顾客要求特殊服务，按摩师心领神会",
      "按摩到敏感部位，顾客忍不住发出声音",
    ],
  },
];

export default function RoleplayGame() {
  const [selected, setSelected] = useState<number | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [roleA, setRoleA] = useState("");
  const [roleB, setRoleB] = useState("");

  const selectScenario = (idx: number) => {
    setSelected(idx);
    setTaskIndex(0);
    setCurrentTask("");
    setRoleA(scenarios[idx].roles[0]);
    setRoleB(scenarios[idx].roles[1]);
  };

  const nextTask = () => {
    const scenario = scenarios[selected!];
    const task = scenario.tasks[taskIndex % scenario.tasks.length];
    setCurrentTask(task);
    setTaskIndex((i) => i + 1);
  };

  const swapRoles = () => {
    const temp = roleA;
    setRoleA(roleB);
    setRoleB(temp);
  };

  const back = () => {
    setSelected(null);
    setCurrentTask("");
  };

  return (
    <LicenseGate gameName="角色扮演剧场">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-4">
        <div className="game-container w-full">
          {/* 选择场景 */}
          {selected === null && (
            <div className="text-center">
              <div className="mb-3 text-5xl">🎭</div>
              <h1 className="mb-2 text-xl font-bold text-white">角色扮演剧场</h1>
              <p className="mb-4 text-sm text-white/70">选择一个场景，分配角色，跟随剧情演绎</p>
              <div className="space-y-2">
                {scenarios.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectScenario(i)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-pink-400/50 hover:bg-pink-500/10"
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{s.name}</p>
                      <p className="text-xs text-white/50">{s.roles[0]} × {s.roles[1]}</p>
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
                <button onClick={back} className="text-xs text-white/50 hover:text-white/80">← 换场景</button>
                <span className="text-lg">{scenarios[selected].icon}</span>
              </div>

              <h2 className="mb-3 text-center text-lg font-bold text-white">{scenarios[selected].name}</h2>

              {/* 角色分配 */}
              <div className="mb-4 flex justify-center gap-3">
                <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 text-center">
                  <p className="text-xs text-white/50">玩家A</p>
                  <p className="text-sm font-bold text-pink-300">{roleA}</p>
                </div>
                <div className="flex items-center text-white/30">VS</div>
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-center">
                  <p className="text-xs text-white/50">玩家B</p>
                  <p className="text-sm font-bold text-purple-300">{roleB}</p>
                </div>
              </div>

              <button
                onClick={swapRoles}
                className="mb-4 w-full rounded-full border border-white/20 bg-white/5 py-2 text-xs text-white/70 transition hover:bg-white/10"
              >
                🔄 交换角色
              </button>

              {/* 剧情任务 */}
              {currentTask && (
                <div className="mb-4 rounded-xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-4">
                  <p className="mb-1 text-xs text-pink-300">剧情任务 {taskIndex}</p>
                  <p className="text-sm leading-relaxed text-white">{currentTask}</p>
                </div>
              )}

              <button
                onClick={nextTask}
                className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
              >
                {currentTask ? "下一个剧情" : "开始演绎"}
              </button>

              <p className="mt-3 text-center text-xs text-white/40">尽情投入角色，释放你们的想象</p>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
