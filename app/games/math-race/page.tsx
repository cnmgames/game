// v29 fixed import paths
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import GameLayout from "../GameLayout";

const generateQuestion = () => {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 50) + 30;
      b = Math.floor(Math.random() * 30) + 1;
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      answer = a * b;
      break;
    default:
      a = 1; b = 1; answer = 2;
  }
  return { a, b, op, answer };
};

export default function MathRaceGame() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "over">("menu");
  const [question, setQuestion] = useState(generateQuestion());
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [winner, setWinner] = useState(0);
  const [feedback1, setFeedback1] = useState("");
  const [feedback2, setFeedback2] = useState("");
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  const startGame = useCallback(() => {
    setQuestion(generateQuestion());
    setInput1("");
    setInput2("");
    setScore1(0);
    setScore2(0);
    setTimeLeft(60);
    setWinner(0);
    setFeedback1("");
    setFeedback2("");
    setGameState("playing");
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          setGameState("over");
          setWinner(score1 > score2 ? 1 : score2 > score1 ? 2 : 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, score1, score2]);

  const checkAnswer = (player: number, answer: string) => {
    const num = parseInt(answer);
    if (isNaN(num)) return;
    if (num === question.answer) {
      if (player === 1) {
        setScore1(s => s + 1);
        setFeedback1("✓ 正确！");
        setTimeout(() => setFeedback1(""), 800);
      } else {
        setScore2(s => s + 1);
        setFeedback2("✓ 正确！");
        setTimeout(() => setFeedback2(""), 800);
      }
      setQuestion(generateQuestion());
      setInput1("");
      setInput2("");
    } else {
      if (player === 1) {
        setFeedback1("✗ 错误");
        setTimeout(() => setFeedback1(""), 800);
      } else {
        setFeedback2("✗ 错误");
        setTimeout(() => setFeedback2(""), 800);
      }
    }
  };

  return (
    <GameLayout title="数学竞赛 · 对战">
      <div className="space-y-4">
        {/* 计时器 */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 rounded-full px-6 py-2 ${
            timeLeft <= 10 ? "bg-red-500/20 border border-red-400/40 animate-pulse" : "bg-white/10 border border-white/20"
          }`}>
            <span className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-300" : "text-white"}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* 题目 */}
        {gameState === "playing" && (
          <div className="text-center rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-8">
            <p className="text-5xl font-bold text-white tracking-wider">
              {question.a} {question.op} {question.b} = ?
            </p>
          </div>
        )}

        {/* 菜单 */}
        {gameState === "menu" && (
          <div className="text-center space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-bold text-white">数学竞赛</h2>
            <p className="text-white/60">60秒内谁答对的题多谁获胜</p>
            <button
              onClick={startGame}
              className="rounded-full px-8 py-3 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}
            >
              开始比赛
            </button>
          </div>
        )}

        {/* 结束 */}
        {gameState === "over" && (
          <div className="text-center space-y-4 rounded-2xl border border-green-400/30 bg-green-500/10 p-8 fade-in-up">
            <h2 className="text-2xl font-bold text-white">
              {winner === 0 ? "平局！" : `玩家 ${winner} 获胜！`}
            </h2>
            <p className="text-white/60">最终比分 {score1} : {score2}</p>
            <button
              onClick={startGame}
              className="rounded-full px-8 py-3 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #34C759 0%, #30D158 100%)" }}
            >
              再来一局
            </button>
          </div>
        )}

        {/* 玩家输入区 */}
        {gameState === "playing" && (
          <div className="grid grid-cols-2 gap-4">
            {/* 玩家1 */}
            <div className={`rounded-xl p-4 ${feedback1 === "✓ 正确！" ? "bg-green-500/20 border-2 border-green-400/50" : feedback1 === "✗ 错误" ? "bg-red-500/20 border-2 border-red-400/50" : "bg-pink-500/10 border border-pink-400/30"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-pink-200">玩家1</span>
                <span className="text-2xl font-bold text-pink-200">{score1}</span>
              </div>
              <input
                ref={inputRef1}
                type="number"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer(1, input1)}
                placeholder="输入答案"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center text-lg font-bold text-white outline-none focus:border-pink-400/50"
              />
              <button
                onClick={() => checkAnswer(1, input1)}
                className="mt-2 w-full rounded-lg bg-pink-500/30 py-2 text-sm font-semibold text-pink-200 hover:bg-pink-500/40 transition"
              >
                确认 (Enter)
              </button>
              {feedback1 && <p className="mt-1 text-center text-sm font-bold">{feedback1}</p>}
            </div>

            {/* 玩家2 */}
            <div className={`rounded-xl p-4 ${feedback2 === "✓ 正确！" ? "bg-green-500/20 border-2 border-green-400/50" : feedback2 === "✗ 错误" ? "bg-red-500/20 border-2 border-red-400/50" : "bg-purple-500/10 border border-purple-400/30"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-200">玩家2</span>
                <span className="text-2xl font-bold text-purple-200">{score2}</span>
              </div>
              <input
                ref={inputRef2}
                type="number"
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer(2, input2)}
                placeholder="输入答案"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center text-lg font-bold text-white outline-none focus:border-purple-400/50"
              />
              <button
                onClick={() => checkAnswer(2, input2)}
                className="mt-2 w-full rounded-lg bg-purple-500/30 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-500/40 transition"
              >
                确认 (Enter)
              </button>
              {feedback2 && <p className="mt-1 text-center text-sm font-bold">{feedback2}</p>}
            </div>
          </div>
        )}

        {/* 规则 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">游戏规则</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 60秒倒计时，两人同时答题</li>
            <li>• 答对一题得1分，答错不扣分</li>
            <li>• 玩家1用左边输入框，玩家2用右边</li>
            <li>• 时间结束得分高者获胜</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
