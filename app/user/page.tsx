"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "../../components/Icon";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

function getDeviceId(): string {
  try { return localStorage.getItem("device_id") || "dev_unknown"; } catch (e) { return "dev_unknown"; }
}

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [codeInfo, setCodeInfo] = useState<any>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(API_BASE + "user/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setCodeInfo(data.code_info);
        } else {
          localStorage.removeItem("user_token");
          router.push("/login");
        }
      })
      .catch(() => setMessage("网络错误"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleActivate = () => {
    const token = localStorage.getItem("user_token");
    if (!token) return;
    if (!code.trim()) {
      setMessage("请输入激活码");
      return;
    }
    setActivating(true);
    setMessage("");
    fetch(API_BASE + "user/bind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, code: code.trim(), device_id: getDeviceId() }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("game_token", data.token);
          setMessage("激活成功！");
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setMessage(data.message || "激活失败");
        }
      })
      .catch(() => setMessage("网络错误"))
      .finally(() => setActivating(false));
  };

  const handleLogout = () => {
    const token = localStorage.getItem("user_token");
    if (token) {
      fetch(API_BASE + "user/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    }
    localStorage.removeItem("user_token");
    localStorage.removeItem("game_token");
    router.push("/");
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>加载中...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", color: "#fff", paddingBottom: "70px" }}>
      <div style={{ background: "linear-gradient(135deg, rgba(102,126,234,0.4), rgba(118,75,162,0.4))", padding: "40px 20px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user" size={32} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px" }}>{user?.email?.split("@")[0]}</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: 0 }}>{user?.email}</p>
          </div>
        </div>
        {!user?.email_verified && (
          <div style={{ marginTop: "16px", background: "rgba(255,149,0,0.15)", border: "1px solid rgba(255,149,0,0.3)", padding: "10px 14px", borderRadius: "12px", fontSize: "13px", color: "#FF9500", display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="alert" size={16} />
            邮箱未验证，请查收邮件完成验证
          </div>
        )}
      </div>

      <div style={{ padding: "16px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="ticket" size={18} color="#007AFF" />
            激活状态
          </h3>
          {codeInfo ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>激活码</span>
                <span style={{ fontFamily: "monospace" }}>{codeInfo.code?.match(/.{1,4}/g)?.join("-")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>类型</span>
                <span>{codeInfo.type === "forever" ? "永久卡" : "周卡"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>激活时间</span>
                <span>{codeInfo.used_at?.replace("T", " ").substring(0, 16)}</span>
              </div>
              {codeInfo.expiry_at && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>到期时间</span>
                  <span>{codeInfo.expiry_at?.replace("T", " ").substring(0, 16)}</span>
                </div>
              )}
              <div style={{ marginTop: "16px", padding: "10px", background: "rgba(52,199,89,0.1)", borderRadius: "10px", textAlign: "center", color: "#34C759", fontSize: "14px", fontWeight: 600 }}>
                已激活 · 可正常使用
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", margin: "0 0 12px" }}>尚未激活，输入激活码开始游戏</p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="LOVE-XXXX-XXXX-XXXX"
                style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "15px", fontFamily: "monospace", marginBottom: "12px", boxSizing: "border-box" }}
              />
              {message && <p style={{ fontSize: "13px", color: message.includes("成功") ? "#34C759" : "#FF3B30", margin: "0 0 12px" }}>{message}</p>}
              <button
                onClick={handleActivate}
                disabled={activating}
                style={{ width: "100%", padding: "14px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: activating ? "not-allowed" : "pointer" }}
              >
                {activating ? "激活中..." : "立即激活"}
              </button>
            </div>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden" }}>
          <div onClick={() => router.push("/")} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
            <Icon name="gamepad" size={18} color="#007AFF" />
            <span style={{ flex: 1, fontSize: "15px" }}>开始游戏</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
          </div>
          <div onClick={() => alert("工单功能开发中")} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
            <Icon name="message" size={18} color="#FF9500" />
            <span style={{ flex: 1, fontSize: "15px" }}>联系客服</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
          </div>
          <div onClick={handleLogout} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
            <Icon name="logout" size={18} color="#FF3B30" />
            <span style={{ flex: 1, fontSize: "15px", color: "#FF3B30" }}>退出登录</span>
          </div>
        </div>
      </div>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(20,20,35,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", padding: "8px 0 calc(8px + env(safe-area-inset-bottom))" }}>
        <button onClick={() => router.push("/")} style={{ flex: 1, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "6px 0" }}>
          <Icon name="home" size={22} />
          <span style={{ fontSize: "10px", fontWeight: 500 }}>首页</span>
        </button>
        <button onClick={() => router.push("/")} style={{ flex: 1, background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "6px 0" }}>
          <Icon name="gamepad" size={22} />
          <span style={{ fontSize: "10px", fontWeight: 500 }}>游戏</span>
        </button>
        <button style={{ flex: 1, background: "none", border: "none", color: "#007AFF", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "6px 0" }}>
          <Icon name="user" size={22} />
          <span style={{ fontSize: "10px", fontWeight: 500 }}>我的</span>
        </button>
      </nav>
    </div>
  );
}
