"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

// 斗兽棋等级：0=鼠,1=猫,2=狗,3=狼,4=豹,5=虎,6=狮,7=象
const beastNames = ["鼠", "猫", "狗", "狼", "豹", "虎", "狮", "象"];
const beastEmojis = ["🐭", "🐱", "🐶", "🐺", "🐆", "🐯", "🦁", "🐘"];
const penalties = [
  "脱一件外套", "喝一杯酒", "说一句情话", "亲对方手背",
  "做5个俯卧撑", "给对方抛个媚眼", "唱一句情歌", "交换小秘密",
];

interface Piece {
  level: number;
  owner: 1 | 2; // 1=男方🔥, 2=女方❄️
  revealed: boolean;
}

function initBoard(): (Piece | null)[] {
  const pieces: Piece[] = [];
  for (let i = 0; i < 8; i++) {
    pieces.push({ level: i, owner: 1, revealed: false });
    pieces.push({ level: i, owner: 2, revealed: false });
  }
  // 洗牌
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

export default function BeastGame() {
  const [board, setBoard] = useState<(Piece | null)[]>([]);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("🔥 男方先手，翻牌或移动");
  const [penalty, setPenalty] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [firstMove, setFirstMove] = useState(true);

  useEffect(() => { initGame(); }, []);

  const initGame = () => {
    setBoard(initBoard());
    setTurn(1);
    setSelected(null);
    setMessage("🔥 男方先手，翻牌或移动");
    setPenalty("");
    setGameOver(false);
    setFirstMove(true);
  };

  const canEat = (attacker: Piece, defender: Piece): boolean => {
    if (attacker.level === 0 && defender.level === 7) return true; // 鼠吃象
    if (attacker.level === 7 && defender.level === 0) return false; // 象不能吃鼠
    return attacker.level >= defender.level;
  };

  const isAdjacent = (a: number, b: number): boolean => {
    const ra = Math.floor(a / 4), ca = a % 4;
    const rb = Math.floor(b / 4), cb = b % 4;
    return (Math.abs(ra - rb) + Math.abs(ca - cb)) === 1;
  };

  const handleClick = (idx: number) => {
    if (gameOver) return;
    const piece = board[idx];

    // 翻牌
    if (piece && !piece.revealed) {
      const newBoard = [...board];
      newBoard[idx] = { ...piece, revealed: true };
      setBoard(newBoard);
      // 第一次翻牌决定归属
      if (firstMove) {
        setFirstMove(false);
        if (piece.owner === 2) {
          // 翻到女方的，交换先手
          setTurn(2);
          setMessage("❄️ 女方翻到己方棋子，女方先手！");
        } else {
          setMessage("🔥 男方翻到己方棋子，男方先手！");
        }
      } else {
        setMessage(`翻开了${piece.owner === 1 ? "🔥男方" : "❄️女方"}的${beastEmojis[piece.level]}${beastNames[piece.level]}`);
      }
      setTurn(turn === 1 ? 2 : 1);
      setSelected(null);
      return;
    }

    // 选择己方棋子
    if (piece && piece.revealed && piece.owner === turn) {
      setSelected(idx);
      setMessage(`选中${beastEmojis[piece.level]}${beastNames[piece.level]}，点击相邻格移动`);
      return;
    }

    // 移动或吃子
    if (selected !== null && isAdjacent(selected, idx)) {
      const attacker = board[selected]!;
      const newBoard = [...board];

      if (!piece) {
        // 移动到空格
        newBoard[idx] = attacker;
        newBoard[selected] = null;
        setBoard(newBoard);
        setMessage(`${attacker.owner === 1 ? "🔥" : "❄️"}${beastEmojis[attacker.level]}移动`);
      } else if (piece.revealed && piece.owner !== turn) {
        // 吃子
        if (canEat(attacker, piece)) {
          newBoard[idx] = attacker;
          newBoard[selected] = null;
          setBoard(newBoard);
          const p = penalties[Math.floor(Math.random() * penalties.length)];
          setPenalty(`${piece.owner === 1 ? "🔥男方" : "❄️女方"}的${beastEmojis[piece.level]}被吃！惩罚：${p}`);
          setMessage(`吃掉了对方的${beastEmojis[piece.level]}${beastNames[piece.level]}！`);
          // 检查胜负
          const remaining = newBoard.filter((p) => p && p.revealed && p.owner === piece.owner);
          if (remaining.length === 0) {
            setGameOver(true);
            setMessage(`🎉 ${attacker.owner === 1 ? "男方" : "女方"}获胜！`);
          }
        } else {
          setMessage(`${beastEmojis[attacker.level]}吃不了${beastEmojis[piece.level]}！`);
        }
      }
      setSelected(null);
      if (!gameOver) setTurn(turn === 1 ? 2 : 1);
    }
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-2xl px-3.5 py-4 sm:px-6 sm:py-10">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-pink-300 hover:text-pink-200">← 返回游戏列表</Link>
          <div className="hidden md:flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 border border-white/10">
            <span className="rounded-full px-3 py-1 text-sm bg-white text-gray-900">简体</span>
            <span className="rounded-full px-3 py-1 text-sm text-white/70">En</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-6 sm:rounded-3xl sm:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold sm:text-4xl">🦁 火辣暗兽棋</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">翻牌、博弈、策略对决，输了接受惩罚</p>
          </div>

          {/* 先手决定 */}
          <div className="flex justify-center gap-4">
            <div className={`rounded-full px-4 py-2 text-sm ${turn === 1 ? "bg-orange-500/30 text-orange-200 ring-1 ring-orange-400/50" : "bg-white/5 text-white/50"}`}>🔥 男方</div>
            <div className={`rounded-full px-4 py-2 text-sm ${turn === 2 ? "bg-blue-500/30 text-blue-200 ring-1 ring-blue-400/50" : "bg-white/5 text-white/50"}`}>❄️ 女方</div>
          </div>

          {/* 棋盘 */}
          <div className="mx-auto grid w-full max-w-xs grid-cols-4 gap-2">
            {board.map((piece, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`aspect-square rounded-xl border text-2xl sm:text-3xl transition-all ${
                  selected === i
                    ? "border-yellow-400 bg-yellow-500/20 ring-2 ring-yellow-400/50"
                    : piece && piece.revealed
                    ? piece.owner === 1
                      ? "border-orange-400/40 bg-orange-500/10"
                      : "border-blue-400/40 bg-blue-500/10"
                    : "border-white/10 bg-white/10 hover:border-pink-300/40"
                }`}
              >
                {piece ? (piece.revealed ? beastEmojis[piece.level] : "❓") : ""}
              </button>
            ))}
          </div>

          {/* 消息 */}
          <div className="min-h-[40px] rounded-xl border border-white/10 bg-black/20 p-3 text-center text-sm">{message}</div>

          {/* 惩罚 */}
          {penalty && (
            <div className="rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-center text-sm text-red-200 fade-in-up">{penalty}</div>
          )}

          {gameOver && (
            <div className="rounded-xl border border-yellow-300/30 bg-yellow-500/10 p-4 text-center">
              <div className="text-lg font-bold text-yellow-300">{message}</div>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button onClick={initGame} className="rounded-full bg-pink-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 hover:bg-pink-400">🔄 重新开始</button>
          </div>

          {/* 规则 */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/60 space-y-1">
            <p className="font-semibold text-white/80">游戏规则：</p>
            <p>• 4x4棋盘，双方各8枚棋子（鼠🐭→象🐘）</p>
            <p>• 点击覆盖的棋子翻牌，第一次翻牌决定先手</p>
            <p>• 大吃小，同级同归于尽；鼠🐭可以吃象🐘</p>
            <p>• 被吃棋子的一方接受惩罚</p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/40">
          请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。
          <br />© 2024 ~ 2026 www.hoothin.com
        </div>
      </div>
    </>
  );
}
