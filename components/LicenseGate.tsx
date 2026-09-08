"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    // 未激活直接跳转到用户中心
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("user_token");
      setTimeout(() => {
        router.push(token ? "/user" : "/login");
      }, 300);
    }
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at top, #1a0a1a 0%, #000 60%)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(236,72,153,0.2)", borderTopColor: "#ec4899", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>正在跳转...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
