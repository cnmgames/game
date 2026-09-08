// v32 remove external Icon import
"use client";
import Link from "next/link";
import { ReactNode } from "react";

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
      <div className="bg-aurora" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-20 blur-3xl animate-float" style={{ background: "radial-gradient(circle, #FF375F, transparent)" }} />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full opacity-15 blur-3xl animate-float" style={{ background: "radial-gradient(circle, #BF5AF2, transparent)", animationDelay: "2s" }} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col px-3.5 py-4 sm:px-6 sm:py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="nav-pill hover:!bg-white/10 transition-all duration-300 inline-flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            <span>返回</span>
          </Link>
          <h1 className="text-lg font-bold text-white sm:text-xl bg-gradient-to-r from-pink-200 to-purple-300 bg-clip-text text-transparent">
            {title}
          </h1>
          <div className="w-16" />
        </div>
        <div className="game-container flex-1">
          {children}
        </div>
      </div>
    </>
  );
}
