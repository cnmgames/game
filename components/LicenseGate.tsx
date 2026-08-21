"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { checkActivation, activateCode, clearActivation, TYPE_NAMES } from "../lib/license";

const API_BASE_URL = "https://api.ttla.top";

export default function LicenseGate({ children, gameName }: { children: React.ReactNode; gameName: string }) {
  const [activated, setActivated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [cloudVerifying, setCloudVerifying] = useState(false);
  const [activation, setActivation] = useState(checkActivation());
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const status = checkActivation();
    setActivation(status);

    if (status.active) {
      // 本地显示已激活，需要云端验证
      setCloudVerifying(true);
      const activationData = JSON.parse(localStorage.getItem("lg_activation") || "{}");
      const savedCode = activationData.code;

      if (savedCode) {
        // 调用云端API验证激活码是否真的已被使用
        fetch(`${API_BASE_URL}/check?code=${encodeURIComponent(savedCode)}`, {
          signal: AbortSignal.timeout(8000),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.used && data.exists) {
              // 云端验证通过，确实已激活
              setActivated(true);
            } else {
              // 云端验证失败，本地是伪造的，清除
              clearActivation();
              setActivated(false);
              setActivation({ active: false });
            }
          })
          .catch(() => {
            // 云端不可用时，信任本地状态（降级）
            setActivated(true);
          })
          .finally(() => {
            setCloudVerifying(false);
            setChecking(false);
          });
      } else {
        setActivated(true);
        setCloudVerifying(false);
        setChecking(false);
      }
    } else {
      setActivated(false);
      setChecking(false);
    }
  }, []);

  const handleActivate = async () => {
    if (!code.trim()) {
      setResult({ success: false, message: "请输入激活码" });
      return;
    }
    setResult({ success: false, message: "验证中..." });
    const res = await activateCode(code);
    setResult(res);
    if (res.success) {
      const status = checkActivation();
      setActivation(status);
      setActivated(true);
      setCode("");
    }
  };

  if (checking || cloudVerifying) {
    return (
      <>
        <div className="bg-aurora" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-white/60">{cloudVerifying ? "云端验证中..." : "加载中..."}</div>
        </div>
      </>
    );
  }

  if (!activated) {
    return (
      <>
        <div className="bg-aurora" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
          <div className="mb-6 text-center">
            <Link href="/" className="back-btn inline-flex">← 返回首页</Link>
          </div>
          <div className="game-container">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <h1 className="text-2xl font-bold text-white mb-2">{gameName}</h1>
              <p className="text-sm text-white/60">该游戏需要激活码才能使用</p>
              <p className="text-xs text-white/40 mt-1">飞行棋永久免费</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">输入激活码</label>
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
                className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-base font-bold text-white shadow-lg shadow-pink-500/50 hover:from-pink-400 hover:to-purple-500 hover:shadow-pink-500/70 transition animate-pulse"
              >
                🛒 购买激活码（全部通用）
              </a>
              <p className="text-center text-xs text-yellow-200/60">一个激活码解锁全部5个游戏</p>
              {result && (
                <div className={`rounded-xl p-3 text-center text-sm ${
                  result.success ? "border border-green-400/30 bg-green-500/10 text-green-200" : "border border-red-400/30 bg-red-500/10 text-red-200"
                }`}>
                  {result.message}
                </div>
              )}
            </div>
            <div className="mt-4 text-center text-xs text-white/40">
              <p>支持周卡 / 月卡 / 季卡 / 年卡 · 飞行棋永久免费</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 已激活，显示游戏内容，并在顶部显示激活状态
  return (
    <>
      {children}
      {/* 激活状态指示器（固定在右上角） */}
      <div className="fixed top-3 right-3 z-50 rounded-full border border-green-400/30 bg-black/60 px-3 py-1 text-xs text-green-300 backdrop-blur">
        ✓ {TYPE_NAMES[activation.type!]} · 剩{activation.daysLeft}天
      </div>
    </>
  );
}
