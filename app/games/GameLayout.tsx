// @ts-nocheck
// v32 remove external Icon import
"use client";
import Link from "next/link";
import { ReactNode } from "react";
import GameFeedbackButton from "../../components/GameFeedbackButton";

export default function GameLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
      `}</style>
      {/* 统一固定定位返回按钮 */}
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
      {/* 统一建议反馈按钮 */}
      <GameFeedbackButton gameName={title} />
      <div className="bg-aurora" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-20 blur-3xl animate-float" style={{ background: "radial-gradient(circle, #FF375F, transparent)" }} />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full opacity-15 blur-3xl animate-float" style={{ background: "radial-gradient(circle, #BF5AF2, transparent)", animationDelay: "2s" }} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col px-3.5 sm:px-6">
        {/* 顶部占位，避免内容被固定返回按钮遮挡 */}
        <div className="pt-14" style={{ paddingTop: "max(56px, calc(env(safe-area-inset-top) + 44px))" }} />
        <div className="mb-4 text-center">
          <h1 className="text-lg font-bold text-white sm:text-xl bg-gradient-to-r from-pink-200 to-purple-300 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        <div className="game-container flex-1 flex flex-col justify-center pb-8">
          {children}
        </div>
      </div>
    </>
  );
}
