// @ts-nocheck
// v34 mobile-friendly couple game
"use client";
import { useState, useCallback } from "react";
import GameLayout from "../GameLayout";

interface Question {
  q: string;
  options: string[];
  answer: number;
}

const QUESTIONS: Question[] = [
  { q: "对方最喜欢的颜色是？", options: ["红色", "蓝色", "粉色", "黑色"], answer: 2 },
  { q: "第一次约会去了哪里？", options: ["电影院", "餐厅", "公园", "商场"], answer: 1 },
  { q: "对方最害怕什么？", options: ["蟑螂", "打雷", "孤独", "鬼"], answer: 0 },
  { q: "在一起多久了？", options: ["不到半年", "1-2年", "3-5年", "5年以上"], answer: 1 },
  { q: "对方最喜欢吃什么？", options: ["火锅", "烧烤", "甜品", "海鲜"], answer: 0 },
  { q: "谁先追的谁？", options: ["我追的TA", "TA追的我", "互相吸引", "朋友介绍"], answer: 2 },
  { q: "对方最讨厌什么？", options: ["迟到", "撒谎", "脏乱", "吵闹"], answer: 1 },
  { q: "最浪漫的一次是？", options: ["生日惊喜", "旅行", "烛光晚餐", "日常陪伴"], answer: 3 },
  { q: "对方的口头禅是？", options: ["好的", "随便", "都行", "爱你"], answer: 3 },
  { q: "最想一起去的地方？", options: ["海边", "雪山", "国外", "家里"], answer: 0 },
  { q: "对方睡觉习惯？", options: ["早睡", "熬夜", "打呼噜", "抢被子"], answer: 3 },
  { q: "谁更爱撒娇？", options: ["我", "TA", "都爱", "都不"], answer: 1 },
  { q: "对方最喜欢的季节？", options: ["春天", "夏天", "秋天", "冬天"], answer: 2 },
  { q: "吵架谁先道歉？", options: ["我", "TA", "看情况", "不吵架"], answer: 0 },
  { q: "对方最想要什么礼物？", options: ["鲜花", "首饰", "陪伴", "旅行"], answer: 2 },
];

export default function MathRaceGame() {
  const [qIndex, setQIndex] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [questions, setQuestions] = useState(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  });

  const currentQ = questions[qIndex];

  const handleAnswer = (idx: number) => {
    if (showResult || gameOver) return;
    setSelected(idx);
    setShowResult(true);

    if (idx === currentQ.answer) {
      if (currentPlayer === 1) setScore1(s => s + 10);
      else setScore2(s => s + 10);
    }

    setTimeout(() => {
      if (qIndex >= questions.length - 1) {
        setGameOver(true);
      } else {
        setQIndex(i => i + 1);
        setCurrentPlayer(p => p === 1 ? 2 : 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1200);
  };

  const restart = useCallback(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 10));
    setQIndex(0);
    setCurrentPlayer(1);
    setScore1(0);
    setScore2(0);
    setSelected(null);
    setShowResult(false);
    setGameOver(false);
  }, []);

  const winner = score1 > score2 ? 1 : score2 > score1 ? 2 : 0;

  return (
    <GameLayout title="情侣快问快答">
      <div className="space-y-4">
        {/* 比分 */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 text-center ${currentPlayer === 1 && !gameOver ? "bg-pink-500/20 border-2 border-pink-400/50" : "bg-pink-500/10 border border-pink-400/20"}`}>
            <p className="text-xs text-pink-200/70">玩家1</p>
            <p className="text-2xl font-bold text-pink-200">{score1}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${currentPlayer === 2 && !gameOver ? "bg-purple-500/20 border-2 border-purple-400/50" : "bg-purple-500/10 border border-purple-400/20"}`}>
            <p className="text-xs text-purple-200/70">玩家2</p>
            <p className="text-2xl font-bold text-purple-200">{score2}</p>
          </div>
        </div>

        <div className="text-center text-xs text-white/50">
          {gameOver ? "游戏结束" : `第 ${qIndex + 1}/10 题 · 玩家 ${currentPlayer} 回答`}
        </div>

        {/* 游戏结束 */}
        {gameOver && (
          <div className="text-center space-y-3 rounded-xl border border-green-400/30 bg-green-500/10 p-6 fade-in-up">
            <h2 className="text-xl font-bold text-white">{winner === 0 ? "平局！默契满分！" : `玩家 ${winner} 更懂对方！`}</h2>
            <p className="text-white/60">最终比分 {score1} : {score2}</p>
            <p className="text-sm text-pink-200">输的人要接受甜蜜惩罚哦~</p>
            <button onClick={restart} className="rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}>
              再来一局
            </button>
          </div>
        )}

        {/* 题目 */}
        {!gameOver && currentQ && (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-base font-semibold text-white text-center leading-relaxed">{currentQ.q}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {currentQ.options.map((opt, idx) => {
                let bg = "bg-white/5 border-white/10 hover:bg-white/10";
                if (showResult) {
                  if (idx === currentQ.answer) bg = "bg-green-500/20 border-green-400/50";
                  else if (idx === selected) bg = "bg-red-500/20 border-red-400/50";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showResult}
                    className={`rounded-xl border p-4 text-sm font-medium text-white transition-all active:scale-95 ${bg}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 两人轮流回答关于对方的问题</li>
            <li>• 答对得10分，答错不得分</li>
            <li>• 10题后得分高者获胜，输的接受惩罚</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
