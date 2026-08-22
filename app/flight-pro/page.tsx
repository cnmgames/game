"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "../../components/flight-chess/flight-chess.css";

const FlightChessApp = dynamic(
  () => import("../../components/flight-chess/FlightChessApp"),
  { ssr: false }
);

const TEMP_PASSWORD = "529";

export default function FlightProPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // 检查本地是否已通过临时密码验证
    const tempAuth = localStorage.getItem("flight_pro_temp_auth");
    if (tempAuth === "true") {
      setAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === TEMP_PASSWORD) {
      localStorage.setItem("flight_pro_temp_auth", "true");
      setAuthenticated(true);
      setError("");
    } else {
      setError("密码错误，请重试");
    }
  };

  if (!authenticated) {
    return (
      <>
        <div className="bg-aurora" />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
          <div className="mb-6 text-center">
            <a href="/" className="back-btn inline-flex">← 返回首页</a>
          </div>
          <div className="game-container">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🚀</div>
              <h1 className="text-2xl font-bold text-white mb-2">情侣飞行棋Pro</h1>
              <p className="text-sm text-white/60">开发中 · 请输入临时密码进入</p>
              <p className="text-xs text-orange-300/60 mt-1">临时密码：529</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">临时密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入临时密码"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-center text-lg font-mono tracking-wider text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400/50"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/40 hover:from-orange-400 hover:to-red-400 transition"
              >
                进入游戏
              </button>
              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-center text-sm text-red-200">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </>
    );
  }

  return <FlightChessApp />;
}
