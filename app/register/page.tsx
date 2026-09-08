"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_BASE + "user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/login?registered=1");
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "40px 32px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "8px", color: "#1a1a1a" }}>创建账号</h1>
        <p style={{ textAlign: "center", color: "#888", marginBottom: "32px", fontSize: "14px" }}>注册后激活游戏</p>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              style={{ width: "100%", padding: "14px 16px", border: "1px solid #e0e0e0", borderRadius: "12px", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
              required
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6位"
              style={{ width: "100%", padding: "14px 16px", border: "1px solid #e0e0e0", borderRadius: "12px", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
              required
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              style={{ width: "100%", padding: "14px 16px", border: "1px solid #e0e0e0", borderRadius: "12px", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
              required
            />
          </div>
          {error && <div style={{ background: "rgba(255,59,48,0.1)", color: "#d70015", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px", textAlign: "center" }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "16px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#888" }}>
          已有账号？<a href="/login" style={{ color: "#007AFF", textDecoration: "none", fontWeight: 600 }}>立即登录</a>
        </div>
      </div>
    </div>
  );
}
