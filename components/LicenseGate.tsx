"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { checkActivation, activateCode, clearActivation, TYPE_NAMES } from "../lib/license";
import GameFeedbackButton from "./GameFeedbackButton";

// API 地址（域名混淆拼接，不在代码中出现完整域名）
const _API_HOST = ["k", "ttla", "top"];
const API_BASE_URL = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

// 日期字符串转时间戳
function dateToTs(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const t = new Date(dateStr.replace(" ", "T")).getTime();
  return isNaN(t) ? 0 : t;
}

// 激活码输入自动格式化：转大写、每4位加横杠、最多16位
function formatCodeInput(raw: string): string {
  const v = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
  const parts: string[] = [];
  for (let i = 0; i < v.length; i += 4) parts.push(v.slice(i, i + 4));
  return parts.join("-");
}

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

  // 云端验证：检查激活码是否被封禁/过期
  const verifyWithCloud = async (): Promise<{ valid: boolean; message?: string }> => {
    try {
      const activationData = JSON.parse(localStorage.getItem("lg_activation") || "{}");
      const savedCode = activationData.code;
      if (!savedCode) return { valid: false, message: "未激活" };

      const res = await fetch(API_BASE_URL + "check&code=" + encodeURIComponent(savedCode), {
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json();

      if (data.status === "disabled") {
        return { valid: false, message: data.message || "激活码被封禁，请联系客服" };
      }
      if (data.expired) {
        return { valid: false, message: "激活码已过期，请重新购买" };
      }
      if (data.used && data.exists) {
        return { valid: true };
      }
      return { valid: false, message: data.message || "激活码无效" };
    } catch {
      // 云端不可用时，信任本地状态（降级）
      return { valid: true };
    }
  };

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
      if (typeof document !== "undefined") {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };
    resetScroll();
    const timer1 = setTimeout(resetScroll, 0);
    const timer2 = setTimeout(resetScroll, 100);
    const timer3 = setTimeout(resetScroll, 300);
    const status = checkActivation();
    setActivation(status);

    const init = async () => {
      if (status.active) {
        setCloudVerifying(true);
        const result = await verifyWithCloud();
        if (result.valid) {
          setActivated(true);
        } else {
          clearActivation();
          setActivated(false);
          setActivation({ active: false });
          if (result.message?.includes("封禁") || result.message?.includes("禁用")) {
            setBanned(true);
            setBanMessage(result.message);
          }
        }
        setCloudVerifying(false);
        setChecking(false);
      } else {
        // 本地未激活，尝试通过IP查询云端激活状态
        setCloudVerifying(true);
        try {
          const res = await fetch(API_BASE_URL + "ip-check", {
            signal: AbortSignal.timeout(8000),
          });
          const data = await res.json();
          if (data.success && data.code) {
            // IP已激活，恢复激活状态到本地
            const activationData = {
              code: data.code,
              type: data.type || "forever",
              activatedAt: dateToTs(data.activatedAt) || Date.now(),
              expireAt: dateToTs(data.expiresAt), // 0=永久
              active: true,
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

    // 定时检查：每3分钟检查一次激活码状态
    const interval = setInterval(async () => {
      const currentStatus = checkActivation();
      if (currentStatus.active) {
        const result = await verifyWithCloud();
        if (!result.valid && (result.message?.includes("封禁") || result.message?.includes("禁用"))) {
          clearActivation();
          setActivated(false);
          setActivation({ active: false });
          setBanned(true);
          setBanMessage(result.message);
        }
      }
    }, 3 * 60 * 1000);

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

  // 输入框组件（统一格式）
  const CodeInput = () => (
    <input
      type="text"
      value={code}
      onChange={(e) => setCode(formatCodeInput(e.target.value))}
      onKeyDown={(e) => e.key === "Enter" && handleActivate()}
      placeholder="请输入激活码"
      maxLength={19}
      className="w-full rounded-2xl px-4 py-3.5 text-center text-lg font-mono tracking-widest text-white outline-none transition"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "rgba(255,55,95,0.5)";
        e.target.style.boxShadow = "0 0 0 3px rgba(255,55,95,0.1)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(255,255,255,0.1)";
        e.target.style.boxShadow = "none";
      }}
    />
  );

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

  // 被封禁
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
          <div
            className="w-full p-8 text-center"
            style={{
              background: "rgba(20,20,30,0.85)",
              borderRadius: "24px",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <h1
                className="text-2xl font-extrabold mb-2"
                style={{
                  background: "linear-gradient(135deg, #FF375F 0%, #FF2D55 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {gameName}
              </h1>
              <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                ✨ 一码通用 · 解锁全部游戏
              </p>
              <p className="text-xs" style={{ color: "#FF6B8A" }}>
                激活后所有游戏畅玩无阻
              </p>
            </div>
            <div className="space-y-4">
              {bannedMessage && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-center text-sm text-red-200">
                  ⚠️ {bannedMessage}
                </div>
              )}
              <CodeInput />
              <button
                onClick={handleActivate}
                className="w-full rounded-full py-3.5 text-base font-bold text-white transition"
                style={{
                  background: "linear-gradient(135deg, #FF375F 0%, #FF2D55 50%, #D70040 100%)",
                  boxShadow: "0 4px 20px rgba(255,55,95,0.4)",
                }}
              >
                立即激活
              </button>
              <a
                href="https://weidian.com/?userid=1388425837"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-full py-3 text-sm font-bold transition"
                style={{
                  color: "#FF6B8A",
                  background: "rgba(255,55,95,0.08)",
                  border: "1px solid rgba(255,55,95,0.25)",
                }}
              >
                购买激活码
              </a>
              {result && (
                <div
                  className="text-sm text-center"
                  style={{
                    color: result.success ? "#6BCB77" : "#FF6B6B",
                    minHeight: "20px",
                  }}
                >
                  {result.message}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm transition hover:text-white/80" style={{ color: "rgba(255,255,255,0.5)" }}>
              ← 返回首页
            </Link>
          </div>
        </div>
      </>
    );
  }

  // bannedMessage 状态（已激活但有封禁提示）
  if (bannedMessage) {
    return (
      <>
        <div className="bg-aurora" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
          <div
            className="w-full p-8 text-center"
            style={{
              background: "rgba(20,20,30,0.85)",
              borderRadius: "24px",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🚫</div>
              <h1
                className="text-2xl font-extrabold mb-2"
                style={{
                  background: "linear-gradient(135deg, #FF375F 0%, #FF2D55 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {gameName}
              </h1>
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
                ⚠️ {bannedMessage}
              </div>
            </div>
            <div className="space-y-4">
              <CodeInput />
              <button
                onClick={handleActivate}
                className="w-full rounded-full py-3.5 text-base font-bold text-white transition"
                style={{
                  background: "linear-gradient(135deg, #FF375F 0%, #FF2D55 50%, #D70040 100%)",
                  boxShadow: "0 4px 20px rgba(255,55,95,0.4)",
                }}
              >
                立即激活
              </button>
              <a
                href="https://weidian.com/?userid=1388425837"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-full py-3 text-sm font-bold transition"
                style={{
                  color: "#FF6B8A",
                  background: "rgba(255,55,95,0.08)",
                  border: "1px solid rgba(255,55,95,0.25)",
                }}
              >
                购买激活码
              </a>
              {result && (
                <div
                  className="text-sm text-center"
                  style={{
                    color: result.success ? "#6BCB77" : "#FF6B6B",
                    minHeight: "20px",
                  }}
                >
                  {result.message}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm transition hover:text-white/80" style={{ color: "rgba(255,255,255,0.5)" }}>
              ← 返回首页
            </Link>
          </div>
        </div>
      </>
    );
  }

  // 已激活，显示游戏内容
  return (
    <>
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
      <div style={{ paddingTop: "60px" }}>
        {children}
      </div>
      <GameFeedbackButton gameName={gameName} />
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

      {/* 激活状态指示器 */}
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
          {activation.type ? TYPE_NAMES[activation.type] || "已激活" : "已激活"}
          {activation.timeLeftText ? "·" + activation.timeLeftText : ""}
        </div>
      )}
    </>
  );
}
