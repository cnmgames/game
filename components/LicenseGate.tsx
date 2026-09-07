"use client";
import { useState, useEffect, useCallback } from "react";
import { activateCode, checkActivation, getDeviceId, clearActivation } from "../lib/license";

export default function LicenseGate({
  children,
  gameName,
  gameIcon,
}: {
  children: React.ReactNode;
  gameName: string;
  gameIcon?: string;
}) {
  const [status, setStatus] = useState<"checking" | "unactivated" | "active">("checking");
  const [inputCode, setInputCode] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activationInfo, setActivationInfo] = useState<{ type?: string; timeLeftText?: string } | null>(null);

  const verify = useCallback(async () => {
    setStatus("checking");
    try {
      const result = await checkActivation();
      if (result.active) {
        setActivationInfo({ type: result.type, timeLeftText: result.timeLeftText });
        setStatus("active");
      } else {
        if (result.message) {
          setMessage({ type: "error", text: result.message });
        }
        setStatus("unactivated");
      }
    } catch {
      setStatus("unactivated");
    }
  }, []);

  useEffect(() => {
    verify();
  }, [verify]);

  const formatInput = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    return parts.join("-");
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim() || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await activateCode(inputCode);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setTimeout(() => {
          verify();
        }, 800);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch {
      setMessage({ type: "error", text: "网络异常，请重试" });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(236,72,153,0.2)", borderTopColor: "#ec4899", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>验证中...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "unactivated") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "radial-gradient(ellipse at top, #1a0a1a 0%, #000 60%)" }}>
        <div style={{ width: "100%", maxWidth: "380px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "32px 24px", backdropFilter: "blur(20px)" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>{gameIcon || "🔒"}</div>
            <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: "0 0 6px" }}>{gameName}</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0 }}>请输入激活码解锁全部玩法</p>
          </div>
          <form onSubmit={handleActivate}>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(formatInput(e.target.value))}
              placeholder="请输入激活码"
              maxLength={19}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: "16px",
                letterSpacing: "1px",
                textAlign: "center",
                outline: "none",
                marginBottom: "12px",
                fontFamily: "'SF Mono', Menlo, monospace",
              }}
            />
            {message && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "12px",
                background: message.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: message.type === "success" ? "#86efac" : "#fca5a5",
              }}>
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={!inputCode.trim() || submitting}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: inputCode.trim() && !submitting ? "#007AFF" : "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: inputCode.trim() && !submitting ? "pointer" : "not-allowed",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "激活中..." : "立即激活"}
            </button>
          </form>
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <a href="https://weidian.com/?userid=1388425837" target="_blank" rel="noopener noreferrer" style={{ color: "#007AFF", fontSize: "13px", textDecoration: "none" }}>
              没有激活码？点此购买 →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {activationInfo && (
        <div style={{ position: "fixed", top: "max(12px, env(safe-area-inset-top))", left: "12px", zIndex: 9998, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", padding: "6px 12px", borderRadius: "9999px", fontSize: "11px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
          {activationInfo.type === "week" ? "周卡" : "永久卡"} · {activationInfo.timeLeftText || "有效"}
        </div>
      )}
    </>
  );
}
