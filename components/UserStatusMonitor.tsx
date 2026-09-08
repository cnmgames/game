"use client";
import { useEffect, useState } from "react";
import { checkUserStatus, getUserToken } from "../lib/api";

export default function UserStatusMonitor() {
  const [banned, setBanned] = useState(false);
  const [banMessage, setBanMessage] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let mounted = true;

    const check = async () => {
      if (!getUserToken()) return;
      const result = await checkUserStatus();
      if (mounted && result.banned) {
        setBanned(true);
        setBanMessage(result.message);
      }
    };

    // 初始检查
    check();
    // 每30秒检查一次
    timer = setInterval(check, 30000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  if (!banned) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #1e1e3a 0%, #15152a 100%)",
          border: "1px solid rgba(255,59,48,0.3)",
          borderRadius: "20px",
          padding: "32px 24px",
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 40px rgba(255,59,48,0.2)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(255,59,48,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <h2 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: "700", marginBottom: "12px" }}>
          账号已被禁用
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "16px" }}>
          {banMessage}
        </p>
        <div
          onClick={() => {
            navigator.clipboard?.writeText("nbioss");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>联系客服微信：</span>
          <span style={{ color: "#4CAF50", fontSize: "0.95rem", fontWeight: "600" }}>nbioss</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>点击复制</span>
        </div>
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            background: "#FF3B30",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          我知道了
        </button>
      </div>
    </div>
  );
}
