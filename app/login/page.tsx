"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "../../components/Icon";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

function getDeviceId(): string {
  if (typeof window === "undefined") return "dev_unknown";
  let did = localStorage.getItem("device_id");
  if (!did) {
    // 生成基于浏览器指纹的设备ID，与license.ts保持一致
    const nav = navigator as any;
    let canvasFp = "";
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillText("fingerprint_lovegame", 2, 2);
        canvasFp = canvas.toDataURL();
      }
    } catch (e) {}
    let hash = 0;
    const raw = [navigator.userAgent, navigator.language, navigator.platform, screen.width + "x" + screen.height, screen.colorDepth, new Date().getTimezoneOffset(), nav.hardwareConcurrency || 0, canvasFp.substring(0, 100)].join("|");
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    did = "dev_" + Math.abs(hash).toString(36);
    localStorage.setItem("device_id", did);
  }
  return did;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needVerify, setNeedVerify] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedVerify(false);
    try {
      const res = await fetch(API_BASE + "user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, device_id: getDeviceId() }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user_token", data.token);
        router.push("/user");
      } else {
        setError(data.message || "登录失败");
        if (data.need_verify) setNeedVerify(true);
      }
    } catch (err) {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setResendMsg("请先输入邮箱"); return; }
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch(API_BASE + "user/send_verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResendMsg(data.message || (data.success ? "验证邮件已发送" : "发送失败"));
    } catch { setResendMsg("网络错误"); }
    finally { setResending(false); }
  };

  return (
    <>
      <div className="bg-aurora" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center fade-in-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl" style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)", boxShadow: "0 8px 32px rgba(255,55,95,0.4)" }}>
              <Icon name="heart" size={32} color="#fff" />
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl" style={{ textShadow: "0 0 30px rgba(255,55,95,0.3)" }}>欢迎回来</h1>
            <p className="mt-2 text-sm text-white/60">登录后开启你的私密游戏时光</p>
          </div>

          <div className="game-container fade-in-up" style={{ animationDelay: "0.1s" }}>
            <form onSubmit={handleLogin} className="space-y-5">
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
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-pink-200">密码</label>
                  <Link href="/forgot" className="text-xs font-medium text-pink-300 hover:text-pink-200 transition">忘记密码？</Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/30 outline-none transition focus:border-pink-400/50 focus:bg-white/10 focus:ring-2 focus:ring-pink-500/20"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 fade-in-up">
                  {error}
                </div>
              )}

              {needVerify && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 fade-in-up">
                  <div className="mb-3 flex items-center gap-2 text-sm text-amber-200">
                    <Icon name="mail" size={16} />
                    <span>请先验证邮箱后登录</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full rounded-lg border border-amber-400/40 bg-amber-500/20 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/30 disabled:opacity-50"
                  >
                    {resending ? "发送中..." : "重新发送验证邮件"}
                  </button>
                  {resendMsg && <p className="mt-2 text-center text-xs text-amber-300/70">{resendMsg}</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #FF375F 0%, #FF2D55 50%, #D70040 100%)", boxShadow: "0 4px 24px rgba(255,55,95,0.4)" }}
              >
                {loading ? "登录中..." : "登 录"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-white/50">
              还没有账号？
              <Link href="/register" className="ml-1 font-semibold text-pink-300 hover:text-pink-200 transition">立即注册</Link>
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
