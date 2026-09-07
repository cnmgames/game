"use client";
import { useEffect, useState } from "react";

export default function WechatBlocker() {
  const [isWechat, setIsWechat] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsWechat(ua.indexOf("micromessenger") > -1);
    const t = setTimeout(() => setShowArrow(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (!isWechat) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "radial-gradient(ellipse at 30% 20%, rgba(255,55,95,0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(191,90,242,0.2) 0%, transparent 50%), linear-gradient(180deg, #0a0a12 0%, #060609 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* 背景装饰粒子 */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              borderRadius: "50%",
              background: i % 2 === 0 ? "rgba(255,55,95,0.3)" : "rgba(191,90,242,0.3)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 右上角引导箭头 */}
      <div
        style={{
          position: "absolute",
          top: "max(20px, env(safe-area-inset-top))",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
          opacity: showArrow ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      >
        <div style={{ fontSize: "32px", animation: "bounce 1s infinite" }}>👆</div>
        <div
          style={{
            background: "rgba(255,55,95,0.15)",
            border: "1px solid rgba(255,55,95,0.3)",
            borderRadius: "12px",
            padding: "8px 14px",
            fontSize: "13px",
            color: "#FF6B8A",
            fontWeight: 600,
            backdropFilter: "blur(10px)",
          }}
        >
          点右上角 ···
        </div>
      </div>

      {/* 主内容卡片 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "360px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "28px",
          padding: "40px 28px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* 图标 */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 20px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            boxShadow: "0 8px 32px rgba(255,55,95,0.4)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          🎮
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            margin: "0 0 8px",
            background: "linear-gradient(135deg, #FF375F 0%, #FF6B8A 50%, #BF5AF2 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          请在浏览器打开
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0 0 24px", lineHeight: 1.6 }}>
          微信内无法体验完整游戏功能
          <br />
          跟随下方步骤，10秒进入游戏
        </p>

        {/* 步骤 */}
        <div style={{ textAlign: "left", marginBottom: "24px" }}>
          {[
            { icon: "1️⃣", text: "点击右上角 ··· 按钮", color: "#FF375F" },
            { icon: "2️⃣", text: "选择「在浏览器打开」", color: "#BF5AF2" },
            { icon: "3️⃣", text: "开始畅玩全部游戏", color: "#30D158" },
          ].map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                marginBottom: i < 2 ? "8px" : 0,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${step.color}22`,
                borderRadius: "14px",
                animation: `slideIn 0.5s ease-out ${i * 0.15}s both`,
              }}
            >
              <span style={{ fontSize: "20px" }}>{step.icon}</span>
              <span style={{ color: "#fff", fontSize: "14px", fontWeight: 500 }}>{step.text}</span>
            </div>
          ))}
        </div>

        {/* 游戏标签 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
          {["🎲 骰子", "✈️ 飞行棋", "🎯 转盘", "🃏 卡牌", "🎭 角色扮演"].map((tag) => (
            <span
              key={tag}
              style={{
                background: "rgba(255,55,95,0.1)",
                border: "1px solid rgba(255,55,95,0.2)",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "11px",
                color: "#FF6B8A",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 底部提示 */}
      <div style={{ marginTop: "24px", color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
        ✨ 14款情侣游戏 · 千种玩法等你解锁
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(255,55,95,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 8px 48px rgba(255,55,95,0.6); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
