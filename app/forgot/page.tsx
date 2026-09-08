"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "../../components/Icon";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

export default function ForgotPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) { setError("请先输入邮箱"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("邮箱格式不正确"); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch(API_BASE + "user/send_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setCountdown(60);
        setError("");
      } else {
        setError(data.message || "发送失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSending(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("两次密码不一致"); return; }
    if (newPassword.length < 6) { setError("新密码至少6位"); return; }
    if (!code) { setError("请输入验证码"); return; }
    setLoading(true);
    try {
      const res = await fetch(API_BASE + "user/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message || "重置失败");
      }
    } catch {
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
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, rgba(52,199,89,0.2), rgba(16,185,129,0.2))", boxShadow: "0 0 40px rgba(52,199,89,0.3)" }}>
                <Icon name="check" size={40} color="#34C759" />
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white">密码重置成功</h2>
              <p className="mb-6 text-sm text-white/60">正在跳转到登录页...</p>
              <Link href="/login" className="inline-block rounded-full px-8 py-3 text-sm font-bold text-white transition hover:scale-105" style={{ background: "linear-gradient(135deg, #FF375F 0%, #D70040 100%)", boxShadow: "0 4px 24px rgba(255,55,95,0.4)" }}>
                立即登录
              </Link>
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
          <div className="mb-8 text-center fade-in-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl" style={{ background: "linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)", boxShadow: "0 8px 32px rgba(255,149,0,0.4)" }}>
              <Icon name="lock" size={32} color="#fff" />
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl" style={{ textShadow: "0 0 30px rgba(255,149,0,0.3)" }}>重置密码</h1>
            <p className="mt-2 text-sm text-white/60">通过邮箱验证码重置你的密码</p>
          </div>

          <div className="game-container fade-in-up" style={{ animationDelay: "0.1s" }}>
            <form onSubmit={handleReset} className="space-y-4">
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
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-pink-200">验证码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6位验证码"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-pink-400/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || sending}
                    className="shrink-0 rounded-xl border border-pink-400/40 bg-pink-500/20 px-4 text-sm font-semibold text-pink-200 transition hover:bg-pink-500/30 disabled:opacity-50"
                  >
                    {countdown > 0 ? `${countdown}s` : sending ? "发送中" : "获取验证码"}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-pink-200">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="至少6位"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-pink-400/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-pink-200">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
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
                style={{ background: "linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)", boxShadow: "0 4px 24px rgba(255,149,0,0.4)" }}
              >
                {loading ? "重置中..." : "重置密码"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-white/50">
              想起来了？
              <Link href="/login" className="ml-1 font-semibold text-pink-300 hover:text-pink-200 transition">返回登录</Link>
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
