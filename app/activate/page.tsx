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
      <div className="fixed inset-0 z-0" style={{
        background: 'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(255,55,95,0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(191,90,242,0.12) 0%, transparent 50%), linear-gradient(180deg, #0a0a12 0%, #060609 100%)'
      }} />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-5 py-8">
        <div
          className="w-full rounded-[20px] p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="text-5xl mb-3">🔒</div>
          <h1
            className="text-2xl font-extrabold mb-1.5"
            style={{
              background: 'linear-gradient(135deg, #FF375F 0%, #FF2D55 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            激活游戏
          </h1>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', fontWeight: 500 }}>
            ✨ 一码通用 · 解锁全部游戏
            <br />
            <span style={{ fontSize: '12px', color: 'rgba(255,107,138,0.6)', fontWeight: 400 }}>激活后所有游戏畅玩无阻</span>
          </p>

          {/* 已激活状态 */}
          {activation.active && (
            <div
              className="mb-5 rounded-2xl p-4 text-center"
              style={{
                background: 'rgba(77,255,184,0.06)',
                border: '1px solid rgba(77,255,184,0.25)',
              }}
            >
              <div className="text-base font-bold mb-2" style={{ color: '#6BCB77' }}>✅ 已激活</div>
              <div className="text-sm space-y-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <div className="font-mono text-base tracking-wider" style={{ color: '#FF6B8A' }}>
                  {typeof window !== 'undefined' && localStorage.getItem("lg_activation")
                    ? JSON.parse(localStorage.getItem("lg_activation") || "{}").code
                    : ""}
                </div>
                <div>类型：{TYPE_NAMES[activation.type!]}</div>
                <div>剩余：{activation.timeLeftText}</div>
                <div>过期：{formatDate(activation.expireAt!)}</div>
              </div>
            </div>
          )}

          {/* 激活码输入 */}
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleActivate()}
            placeholder="输入7位激活码"
            maxLength={7}
            className="w-full mb-3 rounded-2xl px-4 py-3.5 text-center text-lg font-mono tracking-widest text-white outline-none transition"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(255,55,95,0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(255,55,95,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={handleActivate}
            className="w-full mb-3 rounded-full py-3.5 text-base font-bold text-white transition"
            style={{
              background: 'linear-gradient(135deg, #FF375F 0%, #FF2D55 50%, #D70040 100%)',
              boxShadow: '0 4px 20px rgba(255,55,95,0.4)',
            }}
          >
            立即激活
          </button>
          <a
            href="https://weidian.com/?userid=1388425837"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-full py-3 text-sm font-bold transition mb-2"
            style={{
              color: '#FF6B8A',
              background: 'rgba(255,55,95,0.08)',
              border: '1px solid rgba(255,55,95,0.25)',
            }}
          >
            购买激活码
          </a>

          {result && (
            <div
              className="mt-2 text-sm"
              style={{
                color: result.success ? '#6BCB77' : '#FF6B6B',
                minHeight: '20px',
              }}
            >
              {result.message}
            </div>
          )}
        </div>

        <Link href="/" className="mt-5 text-sm transition hover:text-white/80" style={{ color: 'rgba(255,255,255,0.5)' }}>
          ← 返回首页
        </Link>
      </div>
    </>
  );
}
