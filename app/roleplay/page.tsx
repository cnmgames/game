"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState } from "react";

type Layer = "menu" | "scenario" | "roles" | "mode" | "game" | "ending";
type PlayMode = "story" | "free" | "challenge";

const scenarios = [
  {
    name: "老师与学生", icon: "👩‍🏫", gradient: "from-blue-500 to-purple-500",
    roles: ["老师", "学生"], difficulty: "⭐⭐",
    story: [
      { text: "放学后，老师把你叫到办公室：'这次考试成绩不理想，留下补课。'", choices: ["乖乖留下", "撒娇求情"] },
      { text: "办公室里只有你们两个人，老师慢慢走近...", choices: ["主动靠近", "假装紧张"] },
      { text: "老师的手搭在你肩上：'知道该怎么补偿吗？'", choices: ["点头答应", "反问怎么补偿"] },
      { text: "气氛越来越暧昧，灯突然闪了一下...", choices: ["趁机抱住老师", "等待老师主动"] },
    ],
    free: ["学生做错题目，老师用特殊方式惩罚", "老师在讲台上讲课，学生在桌下搞小动作", "老师批改作业时，学生从背后抱住老师"],
  },
  {
    name: "医生与病人", icon: "👨‍⚕️", gradient: "from-green-500 to-teal-500",
    roles: ["医生", "病人"], difficulty: "⭐⭐⭐",
    story: [
      { text: "诊室里，医生说：'需要做个全身检查，把外套脱了。'", choices: ["配合脱下", "有点犹豫"] },
      { text: "听诊器在胸口移动，医生的手越来越低...", choices: ["抓住医生的手", "闭上眼睛享受"] },
      { text: "'心率很快，是紧张吗？'医生凑近问。", choices: ["承认是因为医生", "说是生病了"] },
      { text: "医生说：'看来需要特殊治疗...'", choices: ["主动配合治疗", "询问治疗方式"] },
    ],
    free: ["病人来做全身检查，医生要求脱掉外套", "医生用听诊器听心跳，手慢慢往下移", "病房里只有医生和病人，发生了不该发生的事"],
  },
  {
    name: "上司与下属", icon: "💼", gradient: "from-gray-500 to-slate-600",
    roles: ["上司", "下属"], difficulty: "⭐⭐",
    story: [
      { text: "深夜加班，上司走进办公室：'还没走？'", choices: ["汇报工作进度", "抱怨加班太多"] },
      { text: "上司关上门：'这个项目，需要你额外付出...'", choices: ["询问什么付出", "直接答应"] },
      { text: "上司走到你身边，手放在你肩上...", choices: ["靠向上司", "微微闪躲"] },
      { text: "'办公室的隔音很好...'上司低声说。", choices: ["主动锁门", "等待下一步"] },
    ],
    free: ["下属加班到深夜，上司来到办公室", "会议室里只有两个人，上司慢慢靠近", "上司把下属叫到办公室，关上门拉上窗帘"],
  },
  {
    name: "快递员与住户", icon: "📦", gradient: "from-orange-500 to-red-500",
    roles: ["快递员", "住户"], difficulty: "⭐⭐⭐",
    story: [
      { text: "门铃响起，你穿着睡衣开门取快递...", choices: ["直接签收", "邀请进来喝杯水"] },
      { text: "快递员的目光在你身上停留，说：'这个需要当面验货。'", choices: ["当面拆开", "疑惑地看着他"] },
      { text: "拆快递时，手指不小心碰到一起...", choices: ["没有躲开", "赶紧收回手"] },
      { text: "'下次有快递，我还亲自送。'快递员意味深长地说。", choices: ["约好下次", "害羞地点头"] },
    ],
    free: ["快递员送错快递，住户要求当面拆开检查", "下雨天快递员来躲雨，孤男寡女共处一室", "货到付款但住户没钱，提出用其他方式支付"],
  },
  {
    name: "按摩师与顾客", icon: "💆", gradient: "from-pink-500 to-rose-500",
    roles: ["按摩师", "顾客"], difficulty: "⭐⭐⭐⭐",
    story: [
      { text: "按摩室里，按摩师说：'全身按摩需要脱掉衣服。'", choices: ["配合脱下", "只脱上衣"] },
      { text: "精油倒在背上，按摩师的手慢慢游走...", choices: ["发出满足的声音", "咬唇忍住"] },
      { text: "'这里也需要按吗？'手慢慢往下移...", choices: ["点头示意继续", "抓住他的手引导"] },
      { text: "按摩师俯身：'VIP服务，需要额外收费哦。'", choices: ["愿意支付任何代价", "询问还有什么服务"] },
    ],
    free: ["顾客要求全身按摩，按摩师慢慢解开顾客衣服", "精油按摩，按摩师的手滑过每一寸肌肤", "按摩到敏感部位，顾客忍不住发出声音"],
  },
  {
    name: "摄影师与模特", icon: "📸", gradient: "from-purple-500 to-indigo-500",
    roles: ["摄影师", "模特"], difficulty: "⭐⭐⭐",
    story: [
      { text: "私房照拍摄，摄影师说：'再脱一件，效果更好。'", choices: ["配合脱下", "有点害羞"] },
      { text: "摄影师放下相机：'这个角度，需要我亲自指导...'", choices: ["等待指导", "主动摆姿势"] },
      { text: "摄影师的手帮你调整姿势，触碰越来越多...", choices: ["没有拒绝", "故意靠近"] },
      { text: "'今天的拍摄，可以延长到晚上...'摄影师暗示。", choices: ["答应延长", "问晚上拍什么"] },
    ],
    free: ["拍摄写真，摄影师要求模特慢慢脱掉外套", "拍摄间隙，摄影师帮模特整理衣服，手慢慢游走", "私房照拍摄，房间里只有两个人"],
  },
];

export default function RoleplayGame() {
  const [layer, setLayer] = useState<Layer>("menu");
  const [selected, setSelected] = useState<number | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode>("story");
  const [nameA, setNameA] = useState("玩家A");
  const [nameB, setNameB] = useState("玩家B");
  const [roleA, setRoleA] = useState("");
  const [roleB, setRoleB] = useState("");
  const [storyIndex, setStoryIndex] = useState(0);
  const [affection, setAffection] = useState(50);
  const [currentFree, setCurrentFree] = useState("");
  const [challengeTime, setChallengeTime] = useState(60);
  const [challengeRunning, setChallengeRunning] = useState(false);
  const [ending, setEnding] = useState("");

  const goBack = () => {
    if (layer === "scenario") setLayer("menu");
    else if (layer === "roles") setLayer("scenario");
    else if (layer === "mode") setLayer("roles");
    else if (layer === "game") setLayer("mode");
    else if (layer === "ending") setLayer("menu");
  };

  const selectScenario = (idx: number) => {
    setSelected(idx);
    setRoleA(scenarios[idx].roles[0]);
    setRoleB(scenarios[idx].roles[1]);
    setLayer("roles");
  };

  const startGame = () => {
    setStoryIndex(0);
    setAffection(50);
    setCurrentFree("");
    setLayer("game");
    if (playMode === "free") {
      drawFree();
    } else if (playMode === "challenge") {
      setChallengeTime(60);
      setChallengeRunning(true);
      drawFree();
    }
  };

  const drawFree = () => {
    if (selected === null) return;
    const tasks = scenarios[selected].free;
    setCurrentFree(tasks[Math.floor(Math.random() * tasks.length)]);
  };

  const makeChoice = (choiceIdx: number) => {
    // 第一个选择加好感，第二个减好感（模拟分支）
    const change = choiceIdx === 0 ? 15 : -10;
    setAffection((a) => Math.max(0, Math.min(100, a + change)));
    
    if (storyIndex + 1 >= scenarios[selected!].story.length) {
      // 结局
      if (affection + change >= 70) setEnding("perfect");
      else if (affection + change >= 40) setEnding("good");
      else setEnding("bad");
      setLayer("ending");
    } else {
      setStoryIndex((i) => i + 1);
    }
  };

  const swapRoles = () => {
    const t = roleA; setRoleA(roleB); setRoleB(t);
    const tn = nameA; setNameA(nameB); setNameB(tn);
  };

  const BackButton = () => (
    <button onClick={goBack} className="mb-4 flex items-center gap-1 text-xs text-white/50 transition hover:text-white/80">
      ← 返回上一层
    </button>
  );

  return (
    <LicenseGate gameName="角色扮演剧场">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-4 py-6">
        <div className="game-container w-full">
          {/* 主菜单 */}
          {layer === "menu" && (
            <div className="text-center">
              <div className="mb-4 text-6xl">🎭</div>
              <h1 className="mb-2 text-2xl font-bold text-white">角色扮演剧场</h1>
              <p className="mb-6 text-sm text-white/70">剧情分支·好感度·多结局，释放你们的想象</p>
              <div className="space-y-3">
                <button onClick={() => setLayer("scenario")} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60">
                  ▶️ 开始游戏
                </button>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left text-xs text-white/60">
                  <p className="mb-2 font-semibold text-white/80">🎮 三种玩法：</p>
                  <p>• 📖 剧情模式：分支选择，影响好感度和结局</p>
                  <p>• 🎲 自由模式：随机抽取剧情任务</p>
                  <p>• ⏱️ 挑战模式：60秒内完成尽可能多的任务</p>
                  <p className="mt-2">• 6个场景，每个都有独立剧情线</p>
                </div>
              </div>
            </div>
          )}

          {/* 选择场景 */}
          {layer === "scenario" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">选择场景</h2>
              <div className="grid grid-cols-2 gap-3">
                {scenarios.map((s, i) => (
                  <button key={i} onClick={() => selectScenario(i)} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${s.gradient} p-4 text-left transition-all hover:scale-105 hover:border-white/30`}>
                    <div className="absolute -right-2 -top-2 text-4xl opacity-30">{s.icon}</div>
                    <div className="relative z-10">
                      <div className="mb-1 text-2xl">{s.icon}</div>
                      <p className="text-sm font-bold text-white">{s.name}</p>
                      <p className="mt-0.5 text-[10px] text-white/70">{s.roles[0]}×{s.roles[1]}</p>
                      <p className="mt-1 text-[10px] text-white/60">{s.difficulty}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 角色分配 */}
          {layer === "roles" && selected !== null && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">{scenarios[selected].name}</h2>
              <div className="mb-4 flex justify-center gap-3">
                <div className="flex-1 rounded-2xl border border-pink-500/30 bg-pink-500/10 p-3 text-center">
                  <p className="text-[10px] text-pink-300/70">玩家A</p>
                  <input value={nameA} onChange={(e) => setNameA(e.target.value)} className="mt-1 w-full bg-transparent text-center text-sm font-bold text-pink-200 outline-none" />
                  <p className="mt-0.5 text-xs font-semibold text-white">{roleA}</p>
                </div>
                <div className="flex items-center text-white/30">⚔️</div>
                <div className="flex-1 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 text-center">
                  <p className="text-[10px] text-purple-300/70">玩家B</p>
                  <input value={nameB} onChange={(e) => setNameB(e.target.value)} className="mt-1 w-full bg-transparent text-center text-sm font-bold text-purple-200 outline-none" />
                  <p className="mt-0.5 text-xs font-semibold text-white">{roleB}</p>
                </div>
              </div>
              <button onClick={swapRoles} className="mb-4 w-full rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/60 transition hover:bg-white/10">
                🔄 交换角色
              </button>
              <button onClick={() => setLayer("mode")} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60">
                下一步 →
              </button>
            </div>
          )}

          {/* 模式选择 */}
          {layer === "mode" && (
            <div>
              <BackButton />
              <h2 className="mb-4 text-center text-lg font-bold text-white">选择玩法</h2>
              <div className="space-y-3">
                {[
                  { key: "story" as PlayMode, icon: "📖", label: "剧情模式", desc: "分支选择，好感度系统，多结局", color: "from-blue-500 to-purple-500" },
                  { key: "free" as PlayMode, icon: "🎲", label: "自由模式", desc: "随机抽取剧情任务，自由发挥", color: "from-pink-500 to-rose-500" },
                  { key: "challenge" as PlayMode, icon: "⏱️", label: "挑战模式", desc: "60秒倒计时，完成尽可能多任务", color: "from-orange-500 to-red-500" },
                ].map((m) => (
                  <button key={m.key} onClick={() => { setPlayMode(m.key); startGame(); }} className={`flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r ${m.color} p-4 text-left transition hover:scale-[1.02]`}>
                    <span className="text-3xl">{m.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{m.label}</p>
                      <p className="text-[11px] text-white/70">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 游戏中 */}
          {layer === "game" && selected !== null && (
            <div>
              <BackButton />
              
              {/* 状态栏 */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-2xl">{scenarios[selected].icon}</span>
                {playMode === "story" && (
                  <div className="flex-1 mx-3">
                    <div className="flex justify-between text-[10px] text-white/50 mb-1">
                      <span>好感度</span><span>{affection}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 transition-all" style={{ width: `${affection}%` }} />
                    </div>
                  </div>
                )}
                {playMode === "challenge" && (
                  <div className={`rounded-full px-3 py-1 text-sm font-bold ${challengeTime <= 10 ? "bg-red-500/30 text-red-300 animate-pulse" : "bg-white/10 text-white"}`}>
                    ⏱️ {challengeTime}s
                  </div>
                )}
              </div>

              {/* 剧情模式 */}
              {playMode === "story" && (
                <div>
                  <div className="mb-4 rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/15 to-purple-500/10 p-5">
                    <p className="mb-1 text-[10px] text-pink-300">第 {storyIndex + 1}/{scenarios[selected].story.length} 幕</p>
                    <p className="text-sm leading-relaxed text-white">{scenarios[selected].story[storyIndex].text}</p>
                  </div>
                  <div className="space-y-2">
                    {scenarios[selected].story[storyIndex].choices.map((c, i) => (
                      <button key={i} onClick={() => makeChoice(i)} className="w-full rounded-xl border border-white/15 bg-white/5 py-3 text-sm text-white/80 transition hover:border-pink-400/50 hover:bg-pink-500/10">
                        {i === 0 ? "🅰️ " : "🅱️ "}{c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 自由/挑战模式 */}
              {(playMode === "free" || playMode === "challenge") && (
                <div>
                  {currentFree && (
                    <div className="mb-4 rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/15 to-purple-500/10 p-5">
                      <p className="mb-2 text-[10px] text-pink-300">剧情任务</p>
                      <p className="text-sm leading-relaxed text-white">{currentFree}</p>
                    </div>
                  )}
                  <button onClick={drawFree} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60">
                    🎲 {currentFree ? "下一个任务" : "抽取任务"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 结局 */}
          {layer === "ending" && (
            <div className="text-center">
              <div className="mb-4 text-6xl">
                {ending === "perfect" ? "💕" : ending === "good" ? "💗" : "💔"}
              </div>
              <h2 className="mb-2 text-xl font-bold text-white">
                {ending === "perfect" ? "完美结局" : ending === "good" ? "甜蜜结局" : "遗憾结局"}
              </h2>
              <p className="mb-2 text-sm text-pink-300">好感度：{affection}%</p>
              <p className="mb-6 text-sm leading-relaxed text-white/70">
                {ending === "perfect" && "你们的配合天衣无缝，剧情走向了最甜蜜的方向。这个夜晚，将成为你们难忘的回忆。"}
                {ending === "good" && "虽然有些小波折，但总体还是甜蜜的。下次可以试试不同的选择，解锁完美结局。"}
                {ending === "bad" && "似乎有些误会...不过没关系，重新来过，选择不同的答案，也许会有不一样的结局。"}
              </p>
              <div className="space-y-2">
                <button onClick={() => { setLayer("mode"); }} className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:shadow-pink-500/60">
                  🔄 再玩一次
                </button>
                <button onClick={() => setLayer("menu")} className="w-full rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/50 transition hover:bg-white/10">
                  返回主菜单
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
