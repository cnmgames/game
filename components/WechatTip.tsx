"use client";
import { useState, useEffect } from "react";

export default function WechatTip() {
  const [isWechat, setIsWechat] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("micromessenger") > -1) {
      setIsWechat(true);
    }
  }, []);

  if (!isWechat) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        zIndex: 9999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "320px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #07C160 0%, #06AD56 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 8px 30px rgba(7,193,96,0.4)",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <h2 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px" }}>
          请在浏览器中打开
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", lineHeight: "1.7", marginBottom: "24px" }}>
          当前在微信内打开，部分功能可能受限。
          <br />
          请点击右上角「···」，选择「在浏览器打开」
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <path d="M19 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
            <polyline points="10 14 21 3" />
          </svg>
          在浏览器打开
        </div>
      </div>
    </div>
  );
}
