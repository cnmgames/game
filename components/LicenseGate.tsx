"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { checkActivation, activateCode, clearActivation, TYPE_NAMES } from "../lib/license";
import GameFeedbackButton from "./GameFeedbackButton";

const API_BASE_URL = "https://api.ttla.top";

export default function LicenseGate({ children, gameName }: { children: React.ReactNode; gameName: string }) {
  const [activated, setActivated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [cloudVerifying, setCloudVerifying] = useState(false);
  const [activation, setActivation] = useState(checkActivation());
  const [banned, setBanned] = useState(false);
  const [banMessage, setBanMessage] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [bannedMessage, setBannedMessage] = useState<string>("");

  // 云端验证函数：检查激活码是否被封禁
  const verifyWithCloud = async (): Promise<{ valid: boolean; message?: string }> => {
    try {
      const activationData = JSON.parse(localStorage.getItem("lg_activation") || "{}");
      const savedCode = activationData.code;
      if (!savedCode) return { valid: false, message: "未激活" };
      
      const res = await fetch(`${API_BASE_URL}/check?code=${encodeURIComponent(savedCode)}`, {
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json();
      
      // 检查是否被封禁
      if (data.disabled || data.message?.includes("封禁") || data.message?.includes("禁用")) {
        return { valid: false, message: data.message || "激活码被封禁，请联系客服" };
      }
      // 检查是否已使用（确实已激活）
      if (data.used && data.exists) {
        return { valid: true };
      }
      // 其他情况视为无效
      return { valid: false, message: data.message || "激活码无效" };
    } catch {
      // 云端不可用时，信任本地状态（降级）
      return { valid: true };
    }
  };

  useEffect(() => {
    // 进入游戏页面时重置滚动位置，防止列表页滚动影响游戏内
    window.scrollTo(0, 0);
    if (typeof document !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    const status = checkActivation();
    setActivation(status);

    const init = async () => {
      if (status.active) {
        // 本地显示已激活，需要云端验证
        setCloudVerifying(true);
        const result = await verifyWithCloud();
        if (result.valid) {
          setActivated(true);
        } else {
          // 云端验证失败或被封禁，清除本地状态
          clearActivation();
          setActivated(false);
          setActivation({ active: false });
          if (result.message?.includes("封禁")) {
            setBanned(true);
            setBanMessage(result.message);
          }
        }
        setCloudVerifying(false);
        setChecking(false);
      } else {
        // 本地未激活，尝试通过IP查询云端激活状态（清理缓存后恢复）
        setCloudVerifying(true);
        try {
          const res = await fetch(`${API_BASE_URL}/ip-check`, {
            signal: AbortSignal.timeout(8000),
          });
          const data = await res.json();
          if (data.success && data.code) {
            // IP已激活，恢复激活状态到本地
            const activationData = {
              code: data.code,
              type: data.type,
              activatedAt: data.activatedAt,
              expiresAt: data.expiresAt,
              active: true
            };
            localStorage.setItem("lg_activation", JSON.stringify(activationData));
            const newStatus = checkActivation();
            setActivation(newStatus);
            setActivated(true);
          } else {
            setActivated(false);
          }
        } catch {
          setActivated(false);
        }
        setCloudVerifying(false);
        setChecking(false);
      }
    };
    init();

    // 定时检查：每3分钟检查一次激活码是否被封禁
    const interval = setInterval(async () => {
      const currentStatus = checkActivation();
      if (currentStatus.active) {
        const result = await verifyWithCloud();
        if (!result.valid && result.message?.includes("封禁")) {
          // 被封禁，立即踢出
          clearActivation();
          setActivated(false);
          setActivation({ active: false });
          setBanned(true);
          setBanMessage(result.message);
        }
      }
    }, 3 * 60 * 1000); // 每3分钟检查一次

    return () => clearInterval(interval);
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
      setBanned(false);
      setBanMessage("");
      setBannedMessage("");
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

  // 被封禁，显示封禁提示
  if (banned) {
    return (
      <>
        <div className="bg-aurora" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
          <div className="game-container">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-white mb-2">访问被拒绝</h1>
              <p className="text-sm text-red-300">{banMessage || "激活码被封禁，请联系客服"}</p>
            </div>
            <a
              href="https://weidian.com/?userid=1388425837"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-base font-bold text-white shadow-lg shadow-pink-500/50 hover:from-pink-400 hover:to-purple-50 transition"
            >
              🛒 联系客服
            </a>
          </div>
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
            </div>
            <div className="space-y-4">
              {bannedMessage && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-center text-sm text-red-200">
                  ⚠️ {bannedMessage}
                </div>
              )}
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
      </>
    );
  }

  // 已激活，显示游戏内容，并在顶部显示激活状态
  if (bannedMessage) {
    return (
      <>
        <div className="bg-aurora" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
          <div className="game-container">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-white mb-2">{gameName}</h1>
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
                ⚠️ {bannedMessage}
              </div>
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
                className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-base font-bold text-white shadow-lg shadow-pink-500/50 hover:from-pink-400 hover:to-purple-500 transition animate-pulse"
              >
                🛒 购买激活码（全部通用）
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
      </>
    );
  }
  return (
    <>
      {/* 顶部背景条，让固定按钮有背景不透明 */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "50px",
        background: "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0) 100%)",
        zIndex: 9998,
        pointerEvents: "none",
      }} />
      {/* 游戏内容容器，顶部留空避免被固定按钮遮挡 */}
      <div style={{ paddingTop: "60px" }}>
        {children}
      </div>
      {/* 游戏内反馈按钮 */}
      <GameFeedbackButton gameName={gameName} />
      {/* 返回游戏列表按钮（固定在左上角） */}
      <Link href="/" style={{
        position: "fixed",
        top: "max(12px, env(safe-area-inset-top))",
        left: "max(12px, env(safe-area-inset-left))",
        zIndex: 9999,
        padding: "4px 10px",
        borderRadius: "9999px",
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(0,0,0,0.6)",
        color: "rgba(255,255,255,0.8)",
        fontSize: "12px",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        whiteSpace: "nowrap",
        textDecoration: "none",
        lineHeight: "1.5",
      }}>
        ← 返回游戏列表
      </Link>

      {/* 激活状态指示器（固定在右上角） */}
      {activated && activation && activation.active && (
        <div style={{
          position: "fixed",
          top: "max(12px, env(safe-area-inset-top))",
          right: "100px",
          zIndex: 9999,
          padding: "4px 10px",
          borderRadius: "9999px",
          border: "1px solid rgba(74,222,128,0.3)",
          background: "rgba(0,0,0,0.6)",
          color: "#86efac",
          fontSize: "12px",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          whiteSpace: "nowrap",
          maxWidth: "150px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: "1.5",
        }}>
          {activation.type ? TYPE_NAMES[activation.type] : "已激活"}·{activation.timeLeftText ? "剩" + activation.timeLeftText : "永久有效"}
        </div>
      )}
    </>
  );
}
