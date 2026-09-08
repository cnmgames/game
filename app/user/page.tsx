"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, getDeviceId, getUserToken, clearUserToken } from "../../lib/api";

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [codeInfo, setCodeInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activateCode, setActivateCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserInfo(token);
  }, [router]);

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch(API_BASE + "user/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setCodeInfo(data.code_info);
      } else {
        clearUserToken();
        router.push("/login");
      }
    } catch (err) {
      setMessage("网络错误");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activateCode.trim()) return;
    setActivating(true);
    setMessage("");
    try {
      const token = getUserToken();
      const res = await fetch(API_BASE + "user/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, code: activateCode, device_id: getDeviceId() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("激活成功！");
        setMessageType("success");
        // 保存游戏token
        try { localStorage.setItem("game_token", data.token); } catch (e) {}
        setTimeout(() => {
          fetchUserInfo(token);
          router.push("/");
        }, 1500);
      } else {
        setMessage(data.message || "激活失败");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("网络错误，请重试");
      setMessageType("error");
    } finally {
      setActivating(false);
    }
  };

  const handleLogout = () => {
    const token = getUserToken();
    fetch(API_BASE + "user/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {});
    clearUserToken();
    try { localStorage.removeItem("game_token"); } catch (e) {}
    router.push("/login");
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}><div style={{ fontSize: "16px", color: "#888" }}>加载中...</div></div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", padding: "20px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        {/* 顶部导航 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a" }}>用户中心</h1>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "rgba(255,59,48,0.1)", color: "#d70015", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>退出登录</button>
        </div>

        {/* 用户信息卡片 */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", fontWeight: 700, marginRight: "16px" }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a" }}>{user?.email}</div>
              <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>注册于 {user?.created_at?.substring(0, 10)}</div>
            </div>
          </div>
        </div>

        {/* 激活状态 */}
        {codeInfo ? (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#1a1a1a" }}>激活状态</h2>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ color: "#888" }}>激活码</span>
              <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#1a1a1a" }}>{codeInfo.code}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ color: "#888" }}>卡类型</span>
              <span style={{ fontWeight: 600, color: codeInfo.type === "forever" ? "#8e34b8" : "#c26d00" }}>
                {codeInfo.type === "forever" ? "永久卡" : "周卡"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
              <span style={{ color: "#888" }}>到期时间</span>
              <span style={{ fontWeight: 600, color: codeInfo.expiry_at ? "#d70015" : "#248a3d" }}>
                {codeInfo.expiry_at || "永久有效"}
              </span>
            </div>
            <button
              onClick={() => router.push("/")}
              style={{ width: "100%", marginTop: "20px", padding: "14px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 600, cursor: "pointer" }}
            >
              开始游戏
            </button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#1a1a1a" }}>激活游戏</h2>
            <form onSubmit={handleActivate}>
              <input
                type="text"
                value={activateCode}
                onChange={(e) => setActivateCode(e.target.value.toUpperCase())}
                placeholder="请输入激活码，如 XXXX-XXXX-XXXX-XXXX"
                style={{ width: "100%", padding: "14px 16px", border: "1px solid #e0e0e0", borderRadius: "12px", fontSize: "16px", outline: "none", boxSizing: "border-box", fontFamily: "monospace", marginBottom: "16px" }}
              />
              {message && (
                <div style={{ background: messageType === "success" ? "rgba(52,199,89,0.1)" : "rgba(255,59,48,0.1)", color: messageType === "success" ? "#248a3d" : "#d70015", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px", textAlign: "center" }}>
                  {message}
                </div>
              )}
              <button
                type="submit"
                disabled={activating}
                style={{ width: "100%", padding: "14px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 600, cursor: "pointer", opacity: activating ? 0.6 : 1 }}
              >
                {activating ? "激活中..." : "立即激活"}
              </button>
            </form>
          </div>
        )}

        {/* 购买链接 */}
        {!codeInfo && (
          <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>还没有激活码？</div>
            <a
              href="https://weidian.com/?userid=1388425837"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", padding: "12px 32px", background: "#fff", color: "#667eea", borderRadius: "12px", fontSize: "16px", fontWeight: 600, textDecoration: "none" }}
            >
              立即购买
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
