"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState } from "react";

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
  "让对方检查你的手机最近10条消息",
  "穿对方的内裤走一圈",
  "在对方面前做10个俯卧撑，每做一个亲一下",
  "用手指在对方手心画圈，看对方能不能忍住不笑",
  "蒙眼让对方亲你不同部位，猜是哪里",
  "边脱衣服边跳一段性感舞蹈",
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
];

export default function GayGame() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<"truth" | "dare" | "intimate" | null>(null);
  const [current, setCurrent] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [round, setRound] = useState(1);

  const draw = (type: "truth" | "dare" | "intimate") => {
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
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    setCurrent("");
    setMode(null);
  };

  const restart = () => {
    setStarted(false);
    setMode(null);
    setCurrent("");
    setHistory([]);
    setRound(1);
  };

  return (
    <LicenseGate gameName="他与他">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-4">
        <div className="game-container w-full">
          {!started && (
            <div className="text-center">
              <div className="mb-3 text-5xl">👨‍❤️‍👨</div>
              <h1 className="mb-2 text-xl font-bold text-white">他与他</h1>
              <p className="mb-1 text-sm text-pink-300">🌈 专为男同情侣设计</p>
              <p className="mb-4 text-sm text-white/70">真心话、大冒险、亲密任务，三种模式，属于两个男生的深夜游戏</p>
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs text-white/60">
                <p className="mb-1">📋 三种模式：</p>
                <p>💬 真心话 - 深入了解彼此的秘密</p>
                <p>🎯 大冒险 - 刺激有趣的挑战任务</p>
                <p>🔥 亲密时刻 - 仅限两人的私密玩法</p>
                <p className="mt-2">轮流选择模式，每轮一人抽卡</p>
              </div>
              <button
                onClick={() => setStarted(true)}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:from-pink-400 hover:to-purple-400"
              >
                开始游戏
              </button>
            </div>
          )}

          {started && (
            <div>
              <div className="mb-3 text-center text-xs text-white/50">第 {round} 轮</div>

              {current && (
                <div className={`mb-4 rounded-xl border p-4 ${
                  mode === "truth" ? "border-blue-400/30 bg-blue-500/10" :
                  mode === "dare" ? "border-orange-400/30 bg-orange-500/10" :
                  "border-pink-400/30 bg-pink-500/10"
                }`}>
                  <p className={`mb-2 text-xs font-semibold ${
                    mode === "truth" ? "text-blue-300" :
                    mode === "dare" ? "text-orange-300" :
                    "text-pink-300"
                  }`}>
                    {mode === "truth" ? "💬 真心话" : mode === "dare" ? "🎯 大冒险" : "🔥 亲密时刻"}
                  </p>
                  <p className="text-sm leading-relaxed text-white">{current}</p>
                </div>
              )}

              {!current && (
                <div className="mb-4 space-y-2">
                  <p className="text-center text-sm text-white/60 mb-3">选择一个模式抽卡</p>
                  <button
                    onClick={() => draw("truth")}
                    className="w-full rounded-xl border border-blue-400/30 bg-blue-500/10 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20"
                  >
                    💬 真心话
                  </button>
                  <button
                    onClick={() => draw("dare")}
                    className="w-full rounded-xl border border-orange-400/30 bg-orange-500/10 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/20"
                  >
                    🎯 大冒险
                  </button>
                  <button
                    onClick={() => draw("intimate")}
                    className="w-full rounded-xl border border-pink-400/30 bg-pink-500/10 py-3 text-sm font-semibold text-pink-200 transition hover:bg-pink-500/20"
                  >
                    🔥 亲密时刻
                  </button>
                </div>
              )}

              {current && (
                <div className="space-y-2">
                  <button
                    onClick={nextRound}
                    className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
                  >
                    下一轮
                  </button>
                  <button
                    onClick={() => {
                      setCurrent("");
                      setMode(null);
                    }}
                    className="w-full rounded-full border border-white/20 bg-white/5 py-2 text-xs text-white/60 transition hover:bg-white/10"
                  >
                    重新抽卡
                  </button>
                </div>
              )}

              <button
                onClick={restart}
                className="mt-2 w-full rounded-full border border-white/20 bg-white/5 py-2 text-xs text-white/60 transition hover:bg-white/10"
              >
                重新开始
              </button>

              <p className="mt-3 text-center text-xs text-white/40">🌈 爱就是爱，勇敢做自己</p>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
