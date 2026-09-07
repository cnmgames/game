"use client";
import { useEffect, useState } from "react";

export default function WechatBlocker() {
  const [isWechat, setIsWechat] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsWechat(ua.indexOf("micromessenger") > -1);
  }, []);

  if (!isWechat) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌐</div>
      <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "0 0 12px" }}>
        请在浏览器中打开
      </h2>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", lineHeight: 1.8, margin: "0 0 28px", maxWidth: "320px" }}>
        当前在微信内打开，部分功能可能受限。
        <br />
        请点击右上角 <span style={{ color: "#FF6B8A", fontWeight: 600 }}>···</span> ，选择「在浏览器打开」
      </p>
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          padding: "20px 24px",
          maxWidth: "320px",
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "8px" }}>操作步骤</div>
        <div style={{ color: "#fff", fontSize: "14px", lineHeight: 2, textAlign: "left" }}>
          1. 点击右上角 <span style={{ color: "#FF6B8A" }}>···</span> 按钮<br />
          2. 选择「在浏览器打开」<br />
          3. 即可正常使用全部功能
        </div>
      </div>
    </div>
  );
}
