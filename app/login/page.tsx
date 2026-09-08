"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../components/Icon";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

function getDeviceId(): string {
  try { return localStorage.getItem("device_id") || "dev_unknown"; } catch (e) { return "dev_unknown"; }
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
        if (data.need_verify) {
          setNeedVerify(true);
        }
      }
    } catch (err) {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setResendMsg("请先输入邮箱");
      return;
    }
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
    } catch {
      setResendMsg("网络错误");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "20px" }}>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "40px 32px", width: "100%", maxWidth: "400px", backdropFilter: "blur(20px)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icon name="heart" size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>欢迎回来</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: "14px" }}>登录后激活游戏</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "15px", outline: "none", boxSizing: "border-box", color: "#fff" }}
              required
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "15px", outline: "none", boxSizing: "border-box", color: "#fff" }}
              required
            />
          </div>
          {error && <div style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)", color: "#FF3B30", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", textAlign: "center" }}>{error}</div>}
          {needVerify && (
            <div style={{ background: "rgba(255,149,0,0.1)", border: "1px solid rgba(255,149,0,0.2)", color: "#FF9500", padding: "14px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Icon name="mail" size={16} />
                <span>请先验证邮箱后登录</span>
              </div>
              <button type="button" onClick={handleResend} disabled={resending} style={{ width: "100%", padding: "10px", background: "rgba(255,149,0,0.2)", color: "#FF9500", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                {resending ? "发送中..." : "重新发送验证邮件"}
              </button>
              {resendMsg && <div style={{ marginTop: "8px", fontSize: "12px", textAlign: "center" }}>{resendMsg}</div>}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
          还没有账号？<a href="/register" style={{ color: "#007AFF", textDecoration: "none", fontWeight: 600 }}>立即注册</a>
        </div>
      </div>
    </div>
  );
}
