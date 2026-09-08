"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../components/Icon";

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
    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }
    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "20px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "40px 32px", width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(52,199,89,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon name="mail" size={32} color="#34C759" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>注册成功</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.6, margin: "0 0 8px" }}>验证邮件已发送至</p>
          <p style={{ color: "#007AFF", fontSize: "16px", fontWeight: 600, margin: "0 0 20px" }}>{email}</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: 1.6, margin: "0 0 24px" }}>请查收邮件并点击验证链接完成验证，验证后即可登录</p>
          <button onClick={() => router.push("/login")} style={{ width: "100%", padding: "14px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer", marginBottom: "12px" }}>
            去登录
          </button>
          <button onClick={() => setSuccess(false)} style={{ width: "100%", padding: "12px", background: "none", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "14px", cursor: "pointer" }}>
            返回注册
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "20px" }}>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "40px 32px", width: "100%", maxWidth: "400px", backdropFilter: "blur(20px)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icon name="heart" size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>创建账号</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: "14px" }}>注册后需验证邮箱</p>
        </div>
        <form onSubmit={handleRegister}>
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
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6位"
              style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "15px", outline: "none", boxSizing: "border-box", color: "#fff" }}
              required
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "15px", outline: "none", boxSizing: "border-box", color: "#fff" }}
              required
            />
          </div>
          {error && <div style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)", color: "#FF3B30", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", textAlign: "center" }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
          已有账号？<a href="/login" style={{ color: "#007AFF", textDecoration: "none", fontWeight: 600 }}>立即登录</a>
        </div>
      </div>
    </div>
  );
}
