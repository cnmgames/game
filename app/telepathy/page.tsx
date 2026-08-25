"use client";
import Link from "next/link";
import LicenseGate from "../../components/LicenseGate";
import { useState } from "react";

const questions = [
  "对方最喜欢的颜色？", "对方最害怕的东西？", "对方最喜欢吃的食物？",
  "对方最想去的旅行地？", "对方的口头禅是什么？", "对方最喜欢的电影？",
  "对方最讨厌的性格特质？", "对方最浪漫的举动？", "对方最尴尬的经历？",
  "对方最骄傲的一件事？", "对方最喜欢的季节？", "对方最想养的宠物？",
  "对方最喜欢的歌曲类型？", "对方最在意的纪念日？", "对方最想学会的技能？",
  "对方最欣赏你的哪一点？", "对方最想和你一起做的事？", "对方最感动的瞬间？",
  "对方最生气的一次？", "对方最期待的生日礼物？",
];

const punishments = [
  "深情对视30秒不许笑", "给对方一个长达1分钟的拥抱", "亲一下对方的额头",
  "说五句不同的情话", "给对方按摩肩膀2分钟", "用撒娇语气说三句话",
  "模仿对方生气的样子", "在对方耳边说一句撩人的话", "十指相扣说我爱你",
  "喂对方吃一口东西", "公主抱或被公主抱10秒", "给对方唱一句情歌",
];

export default function TelepathyGame() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState("");
  const [answerA, setAnswerA] = useState("");
  const [answerB, setAnswerB] = useState("");
  const [phase, setPhase] = useState<"question" | "answerA" | "answerB" | "result">("question");
  const [match, setMatch] = useState<boolean | null>(null);
  const [punishment, setPunishment] = useState("");
  const [finished, setFinished] = useState(false);
  const totalRounds = 10;

  const startGame = () => {
    setStarted(true);
    setRound(1);
    setScore(0);
    setFinished(false);
    nextQuestion();
  };

  const nextQuestion = () => {
    const q = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQ(q);
    setAnswerA("");
    setAnswerB("");
    setMatch(null);
    setPunishment("");
    setPhase("answerA");
  };

  const submitA = () => {
    if (!answerA.trim()) return;
    setPhase("answerB");
  };

  const submitB = () => {
    if (!answerB.trim()) return;
    // 简单匹配：判断答案是否包含相同关键词或完全一致
    const a = answerA.trim().toLowerCase();
    const b = answerB.trim().toLowerCase();
    const isMatch = a === b || a.includes(b) || b.includes(a);
    setMatch(isMatch);
    if (isMatch) {
      setScore((s) => s + 1);
    } else {
      setPunishment(punishments[Math.floor(Math.random() * punishments.length)]);
    }
    setPhase("result");
  };

  const nextRound = () => {
    if (round >= totalRounds) {
      setFinished(true);
      return;
    }
    setRound((r) => r + 1);
    nextQuestion();
  };

  const restart = () => {
    setStarted(false);
    setFinished(false);
    setRound(0);
    setScore(0);
  };

  const telepathyPercent = Math.round((score / totalRounds) * 100);

  return (
    <LicenseGate gameName="心有灵犀">
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-4">
        <div className="game-container w-full">
          {/* 轮次显示 */}
          {started && !finished && (
            <div className="mb-4 flex justify-center gap-4 text-center">
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">第 {round}/{totalRounds} 轮</div>
              <div className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-300">默契分：{score}</div>
            </div>
          )}

          {/* 开始界面 */}
          {!started && !finished && (
            <div className="text-center">
              <div className="mb-3 text-5xl">💞</div>
              <h1 className="mb-2 text-xl font-bold text-white">心有灵犀</h1>
              <p className="mb-4 text-sm leading-relaxed text-white/70">
                情侣默契大考验。同时回答关于彼此的问题，答案一致得分，不一致接受甜蜜惩罚。看看你们是不是真的心有灵犀。
              </p>
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs text-white/60">
                <p className="mb-2">📋 游戏规则：</p>
                <p>• 共 {totalRounds} 轮，每轮一个关于彼此的问题</p>
                <p>• 两人分别输入自己心中的答案</p>
                <p>• 答案一致 +1分，不一致执行甜蜜惩罚</p>
                <p>• 最后计算你们的默契度百分比</p>
              </div>
              <button
                onClick={startGame}
                className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
              >
                开始考验
              </button>
            </div>
          )}

          {/* 游戏中 - 玩家A答题 */}
          {started && !finished && phase === "answerA" && (
            <div className="text-center">
              <div className="mb-3 rounded-xl border border-pink-500/30 bg-pink-500/10 p-3">
                <p className="text-xs text-white/50 mb-1">问题</p>
                <p className="text-lg font-semibold text-white">{currentQ}</p>
              </div>
              <div className="mb-3">
                <label className="mb-2 block text-sm font-medium text-pink-300">👩 玩家A 请输入答案</label>
                <input
                  type="text"
                  value={answerA}
                  onChange={(e) => setAnswerA(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitA()}
                  placeholder="输入你心中的答案..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400/50"
                  autoFocus
                />
              </div>
              <p className="mb-3 text-xs text-white/40">（玩家B请不要看屏幕）</p>
              <button
                onClick={submitA}
                className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 disabled:opacity-50"
                disabled={!answerA.trim()}
              >
                确认答案
              </button>
            </div>
          )}

          {/* 游戏中 - 玩家B答题 */}
          {started && !finished && phase === "answerB" && (
            <div className="text-center">
              <div className="mb-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3">
                <p className="text-xs text-white/50 mb-1">问题</p>
                <p className="text-lg font-semibold text-white">{currentQ}</p>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-purple-300">👨 玩家B 请输入答案</label>
                <input
                  type="text"
                  value={answerB}
                  onChange={(e) => setAnswerB(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitB()}
                  placeholder="输入你心中的答案..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50"
                  autoFocus
                />
              </div>
              <button
                onClick={submitB}
                className="w-full rounded-full bg-purple-500 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/40 transition hover:bg-purple-400 disabled:opacity-50"
                disabled={!answerB.trim()}
              >
                揭晓答案
              </button>
            </div>
          )}

          {/* 结果 */}
          {started && !finished && phase === "result" && (
            <div className="text-center">
              <div className="mb-2 text-4xl">{match ? "✨" : "💔"}</div>
              <h2 className={`mb-3 text-xl font-bold ${match ? "text-green-300" : "text-pink-300"}`}>
                {match ? "心有灵犀！" : "默契不足"}
              </h2>
              <div className="mb-3 space-y-2 text-left">
                <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-3">
                  <p className="text-xs text-pink-300">👩 玩家A</p>
                  <p className="text-white">{answerA}</p>
                </div>
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
                  <p className="text-xs text-purple-300">👨 玩家B</p>
                  <p className="text-white">{answerB}</p>
                </div>
              </div>
              {match ? (
                <div className="mb-4 rounded-xl border border-green-400/30 bg-green-500/10 p-3 text-sm text-green-200">
                  🎉 太棒了！默契 +1分，当前得分：{score}
                </div>
              ) : (
                <div className="mb-4 rounded-xl border border-pink-400/30 bg-pink-500/10 p-3">
                  <p className="mb-1 text-xs text-pink-300">甜蜜惩罚</p>
                  <p className="text-sm text-white">{punishment}</p>
                </div>
              )}
              <button
                onClick={nextRound}
                className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
              >
                {round >= totalRounds ? "查看结果" : "下一轮"}
              </button>
            </div>
          )}

          {/* 最终结果 */}
          {finished && (
            <div className="text-center">
              <div className="mb-2 text-5xl">💞</div>
              <h2 className="mb-2 text-xl font-bold text-white">默契度测试完成</h2>
              <div className="my-4">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  {telepathyPercent}%
                </div>
                <p className="mt-2 text-sm text-white/60">心有灵犀指数</p>
              </div>
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                {telepathyPercent >= 80 && "🔥 你们简直是天作之合，心有灵犀一点通！"}
                {telepathyPercent >= 60 && telepathyPercent < 80 && "💕 默契不错，你们很了解彼此！"}
                {telepathyPercent >= 40 && telepathyPercent < 60 && "😊 还有提升空间，多聊聊彼此吧~"}
                {telepathyPercent < 40 && "🤭 看来需要更多时间了解对方哦，加油！"}
                <p className="mt-2 text-xs text-white/50">答对 {score}/{totalRounds} 题</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={restart}
                  className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400"
                >
                  再玩一次
                </button>
                <Link href="/" className="block w-full rounded-full border border-white/20 bg-white/5 py-3 text-center text-sm text-white/70 transition hover:bg-white/10">
                  返回首页
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </LicenseGate>
  );
}
