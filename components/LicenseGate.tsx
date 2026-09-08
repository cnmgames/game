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
      {/* 统一顶部返回按钮 */}
      <a
        href="/"
        style={{
          position: "fixed",
          top: "max(12px, env(safe-area-inset-top))",
          left: "max(12px, env(safe-area-inset-left))",
          zIndex: 9999,
          padding: "6px 14px",
          borderRadius: "9999px",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.6)",
          color: "rgba(255,255,255,0.85)",
          fontSize: "13px",
          textDecoration: "none",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          fontWeight: 500,
          whiteSpace: "nowrap",
          lineHeight: 1.5,
        }}
      >
        返回
      </a>
      {/* 顶部占位，避免内容贴死边缘 */}
      <div style={{ height: "max(56px, calc(env(safe-area-inset-top) + 44px))" }} />
      {children}
    </>
  );
}
