"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "../../components/Icon";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);

  const checkEmail = async (emailVal: string) => {
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) return;
    try {
      const res = await fetch(API_BASE + "user/check_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal }),
      });
      const data = await res.json();
      if (data.exists) {
        setEmailError("registered");
      } else {
        setEmailError("");
      }
    } catch {}
  };

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
        body: JSON.stringify({ email, type: "register" }),
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("两次密码不一致"); return; }
    if (password.length < 6) { setError("密码至少6位"); return; }
    if (!code) { setError("请输入验证码"); return; }
    setLoading(true);
    try {
      const res = await fetch(API_BASE + "user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/login");
      } else {
        setError(data.message || "注册失败");
      }
    } catch (err) {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center fade-in-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl" style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)", boxShadow: "0 8px 32px rgba(255,55,95,0.4)" }}>
              <Icon name="sparkles" size={32} color="#fff" />
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl" style={{ textShadow: "0 0 30px rgba(255,55,95,0.3)" }}>创建账号</h1>
            <p className="mt-2 text-sm text-white/60">邮箱验证码注册，即注册即验证</p>
          </div>

          <div className="game-container fade-in-up" style={{ animationDelay: "0.1s" }}>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-pink-200">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  onBlur={() => checkEmail(email)}
                  placeholder="your@email.com"
                  className={`w-full rounded-xl border bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:bg-white/10 focus:ring-2 ${emailError ? "border-red-500/50 focus:border-red-400/50 focus:ring-red-500/20" : "border-white/10 focus:border-pink-400/50 focus:ring-pink-500/20"}`}
                  required
                />
                {emailError === "registered" && (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 fade-in-up">
                    <span className="text-xs text-amber-200">这个邮箱已经有账号啦</span>
                    <Link href="/login" className="shrink-0 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition">
                      去登录
                    </Link>
                  </div>
                )}
                {emailError && emailError !== "registered" && (
                  <p className="mt-1.5 text-xs text-red-300 fade-in-up">{emailError}</p>
                )}
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

          <p className="mt-6 text-center text-xs text-white/30 flex items-center justify-center gap-1.5">
            <Icon name="shield" size={14} color="rgba(255,255,255,0.3)" />
            仅供18岁以上成年情侣在双方自愿前提下使用
          </p>
        </div>
      </div>
    </>
  );
}
