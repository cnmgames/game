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
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "24px" }}>
          {banMessage}
        </p>
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
