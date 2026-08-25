"use client";
import Link from "next/link";
import { useState } from "react";
import { activateCode, checkActivation, TYPE_NAMES } from "../../lib/license";

export default function ActivatePage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activation, setActivation] = useState(checkActivation());

  const handleActivate = async () => {
    if (!code.trim()) {
      setResult({ success: false, message: "请输入激活码" });
      return;
    }
    setResult({ success: false, message: "验证中..." });
    const res = await activateCode(code);
    setResult(res);
    if (res.success) {
      setActivation(checkActivation());
      setCode("");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
        <div className="mb-6 text-center">
          <Link href="/" className="back-btn inline-flex">← 返回首页</Link>
        </div>

        <div className="game-container">
          <div className="text-center mb-6">
            <h1 className="game-title">激活游戏</h1>
            <div className="game-title-underline" />
            <p className="mt-3 text-sm text-white/60">输入激活码解锁全部游戏</p>
          </div>

          {/* 已激活状态 */}
          {activation.active && (
            <div className="mb-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-center">
              <div className="text-lg font-bold text-green-300 mb-2">✅ 已激活</div>
              <div className="text-sm text-white/70 space-y-1">
                <div className="font-mono text-base text-pink-200 tracking-wider">{localStorage.getItem("lg_activation") ? JSON.parse(localStorage.getItem("lg_activation") || "{}").code : ""}</div>
                <div>类型：{TYPE_NAMES[activation.type!]}</div>
                <div>剩余：{activation.timeLeftText}</div>
                <div>过期：{formatDate(activation.expireAt!)}</div>
              </div>
            </div>
          )}

          {/* 激活码输入 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">激活码</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                placeholder="7位激活码"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-lg font-mono tracking-wider text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400/50"
              />
            </div>

            <button
              onClick={handleActivate}
              className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 hover:bg-pink-400 transition"
            >
              立即激活
            </button>

            <a
              href="https://weidian.com/?userid=1388425837"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-pink-500/50 bg-black/40 py-3 text-base font-bold shadow-lg shadow-pink-500/30 hover:border-pink-400/70 hover:bg-black/60 hover:shadow-pink-500/50 transition"
              style={{
                background: 'linear-gradient(90deg, rgba(0,0,0,0.4), rgba(20,0,30,0.6), rgba(0,0,0,0.4))',
                backgroundSize: '200% auto',
                animation: 'btnShine 3s ease infinite'
              }}
            >
              <span style={{
                background: 'linear-gradient(90deg, #FF6B9D, #C44DFF, #FF6B9D)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'textShine 2s linear infinite',
                filter: 'drop-shadow(0 0 8px rgba(255,107,157,0.6))'
              }}>
                购买激活码（全部通用）
              </span>
            </a>

            {result && (
              <div className={`rounded-xl p-3 text-center text-sm ${
                result.success ? "border border-green-400/30 bg-green-500/10 text-green-200" : "border border-red-400/30 bg-red-500/10 text-red-200"
              }`}>
                {result.message}
              </div>
            )}
          </div>

        </div>
      </div>
    <style jsx global>{`
      @keyframes textShine {
        to { background-position: 200% center; }
      }
      @keyframes btnShine {
        0%, 100% { background-position: 0% center; }
        50% { background-position: 100% center; }
      }
    `}</style>
    </>
  );
}
