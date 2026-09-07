"use client";
import { useEffect, useState } from "react";

export default function WechatBlocker() {
  const [isWechat, setIsWechat] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsWechat(ua.indexOf("micromessenger") > -1);
    const t = setTimeout(() => setShowHint(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!isWechat) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "linear-gradient(180deg, #f2f2f7 0%, #e5e5ea 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* 右上角引导 */}
      <div
        style={{
          position: "absolute",
          top: "max(16px, env(safe-area-inset-top))",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "6px",
          opacity: showHint ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        <div style={{ fontSize: "28px", animation: "tap 1.2s ease-in-out infinite" }}>👆</div>
        <div
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "12px",
            padding: "6px 12px",
            fontSize: "13px",
            color: "#1c1c1e",
            fontWeight: 500,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          点右上角 ···
        </div>
      </div>

      {/* 主卡片 - 苹果风格毛玻璃 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "340px",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          border: "1px solid rgba(255,255,255,0.8)",
          borderRadius: "28px",
          padding: "40px 28px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* 图标 - 苹果风格圆角方形 */}
        <div
          style={{
            width: "72px",
            height: "72px",
            margin: "0 auto 20px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            boxShadow: "0 8px 24px rgba(0,122,255,0.35)",
          }}
        >
          🧭
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#1c1c1e",
            margin: "0 0 6px",
            letterSpacing: "-0.3px",
          }}
        >
          请在 Safari 中打开
        </h1>
        <p style={{ color: "#8e8e93", fontSize: "14px", margin: "0 0 28px", lineHeight: 1.5 }}>
          微信内无法体验完整功能
          <br />
          按以下步骤操作，即刻进入
        </p>

        {/* 步骤列表 - 苹果风格分组 */}
        <div
          style={{
            background: "rgba(118,118,128,0.08)",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          {[
            { num: "1", text: "点击右上角 ··· 按钮" },
            { num: "2", text: "选择「在 Safari 中打开」" },
            { num: "3", text: "开始畅玩全部游戏" },
          ].map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                borderBottom: i < 2 ? "1px solid rgba(60,60,67,0.1)" : "none",
                animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
              }}
            >
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: "#007AFF",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {step.num}
              </div>
              <span style={{ color: "#1c1c1e", fontSize: "15px", fontWeight: 400 }}>{step.text}</span>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div style={{ color: "#8e8e93", fontSize: "12px", fontWeight: 400 }}>
          14 款情侣游戏 · 持续更新中
        </div>
      </div>

      <style>{`
        @keyframes tap {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
