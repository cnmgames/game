"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("两次密码不一致"); return; }
    if (password.length < 6) { setError("密码至少6位"); return; }
    setLoading(true);
    try {
      const res = await fetch(API_BASE + "user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "注册失败");
      }
    } catch (err) {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="bg-aurora" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="game-container text-center fade-in-up">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl" style={{ background: "linear-gradient(135deg, rgba(52,199,89,0.2), rgba(16,185,129,0.2))", boxShadow: "0 0 40px rgba(52,199,89,0.3)" }}>
                📧
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white">注册成功</h2>
              <p className="mb-2 text-sm text-white/60">验证邮件已发送至</p>
              <p className="mb-6 text-lg font-semibold text-pink-300">{email}</p>
              <p className="mb-8 text-sm leading-relaxed text-white/50">
                请查收邮件并点击验证链接完成验证<br />验证后即可登录使用
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/login")}
                  className="w-full rounded-full py-3.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #FF375F 0%, #FF2D55 50%, #D70040 100%)", boxShadow: "0 4px 24px rgba(255,55,95,0.4)" }}
                >
                  去登录
                </button>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full rounded-full border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white/80"
                >
                  返回注册
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center fade-in-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-2xl" style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)", boxShadow: "0 8px 32px rgba(255,55,95,0.4)" }}>
              ✨
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl" style={{ textShadow: "0 0 30px rgba(255,55,95,0.3)" }}>创建账号</h1>
            <p className="mt-2 text-sm text-white/60">注册后需验证邮箱即可畅玩</p>
          </div>

          {/* 注册卡片 */}
          <div className="game-container fade-in-up" style={{ animationDelay: "0.1s" }}>
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-pink-200">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-pink-400/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-pink-200">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6位"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-pink-400/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-pink-200">确认密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-pink-400/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 fade-in-up">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #FF375F 0%, #FF2D55 50%, #D70040 100%)", boxShadow: "0 4px 24px rgba(255,55,95,0.4)" }}
              >
                {loading ? "注册中..." : "注 册"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-white/50">
              已有账号？
              <Link href="/login" className="ml-1 font-semibold text-pink-300 hover:text-pink-200 transition">立即登录</Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/30">
            🔞 仅供18岁以上成年情侣在双方自愿前提下使用
          </p>
        </div>
      </div>
    </>
  );
}
