"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "wx_tip_dismissed";

export default function WechatTip() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("micromessenger") === -1) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch (e) {}
    setShow(true);
  }, []);

  const dismiss = () => {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
    setShow(false);
  };

  if (!show) return null;

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
        padding: "24px",
      }}
      onClick={dismiss}
    >
      <div
        style={{ textAlign: "center", maxWidth: "320px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #07C160 0%, #06AD56 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            boxShadow: "0 8px 30px rgba(7,193,96,0.4)",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <h2 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: "700", marginBottom: "10px" }}>
          建议在浏览器中打开
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: "1.7", marginBottom: "20px" }}>
          微信内打开时部分功能可能受限（如声音播放）。
          <br />
          点右上角「···」选「在浏览器打开」体验更佳。
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 20px",
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)",
            color: "#fff",
            fontSize: "0.9rem",
            fontWeight: "600",
          }}
        >
          点右上角 ··· 打开
        </div>
        <div style={{ marginTop: "18px" }}>
          <button
            onClick={dismiss}
            style={{
              padding: "10px 26px",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            仍然继续访问
          </button>
        </div>
      </div>
    </div>
  );
}
