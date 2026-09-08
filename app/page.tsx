"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const _API_HOST = ["k", "ttla", "top"];
const API_BASE = "https://" + _API_HOST[0] + "." + _API_HOST[1] + "." + _API_HOST[2] + "/api.php?action=";

function getDeviceId(): string {
  try {
    let dev = localStorage.getItem("device_id");
    if (!dev) {
      const s = screen, n = navigator;
      const r = [n.userAgent, n.language, s.width + "x" + s.height, s.colorDepth, new Date().getTimezoneOffset()].join("|");
      let h = 0;
      for (let i = 0; i < r.length; i++) { h = ((h << 5) - h + r.charCodeAt(i)) | 0; }
      dev = "dev_" + Math.abs(h).toString(36) + "_" + Math.random().toString(36).substr(2, 6);
      localStorage.setItem("device_id", dev);
    }
    return dev;
  } catch (e) { return "dev_unknown"; }
}

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem("user_token");
    if (token) {
      fetch(API_BASE + "user/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setIsLoggedIn(true);
            setUserEmail(data.user?.email || "");
          } else {
            localStorage.removeItem("user_token");
          }
        })
        .catch(() => {});
    }

    // 上报在线心跳
    const heartbeat = () => {
      fetch(API_BASE + "online/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "", device_id: getDeviceId() }),
      }).catch(() => {});
    };
    heartbeat();
    setInterval(heartbeat, 30000);

    // 获取在线人数
    const fetchOnline = () => {
      fetch(API_BASE + "online/count")
        .then((r) => r.json())
        .then((data) => setOnlineCount(data.online || 0))
        .catch(() => {});
    };
    fetchOnline();
    setInterval(fetchOnline, 5000);
  }, []);

  const games = [
    { id: 1, name: "情趣飞行棋", desc: "情侣互动经典游戏", icon: "🎲", color: "#FF6B6B" },
    { id: 2, name: "真心话大冒险", desc: "深入了解彼此", icon: "💬", color: "#4ECDC4" },
    { id: 3, name: "夫妻骰子", desc: "随机趣味挑战", icon: "🎯", color: "#45B7D1" },
    { id: 4, name: "卡牌游戏", desc: "多种玩法合集", icon: "🃏", color: "#96CEB4" },
    { id: 5, name: "转盘游戏", desc: "幸运大转盘", icon: "🎡", color: "#FFEAA7" },
    { id: 6, name: "更多游戏", desc: "持续更新中", icon: "✨", color: "#DDA0DD" },
  ];

  const handleGameClick = (game: any) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    const token = localStorage.getItem("game_token");
    if (!token) {
      router.push("/user");
      return;
    }
    alert("游戏：" + game.name + "（开发中）");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", color: "#fff" }}>
      {/* 顶部导航 */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(26,26,46,0.9)", backdropFilter: "blur(20px)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: "20px", fontWeight: 700, background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          情侣游戏
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
            👥 {onlineCount} 人在线
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => router.push("/user")}
              style={{ padding: "8px 16px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              {userEmail ? userEmail.split("@")[0] : "用户中心"}
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                登录
              </button>
              <button
                onClick={() => router.push("/register")}
                style={{ padding: "8px 16px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                注册
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero 区域 */}
      <div style={{ padding: "60px 20px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "16px", lineHeight: 1.2 }}>
          情侣互动小游戏合集
        </h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)", marginBottom: "32px" }}>
          14款游戏 · 千种玩法 · 持续更新
        </p>
        <button
          onClick={() => (isLoggedIn ? router.push("/user") : router.push("/login"))}
          style={{ padding: "16px 48px", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff", border: "none", borderRadius: "30px", fontSize: "18px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 30px rgba(102,126,234,0.4)" }}
        >
          {isLoggedIn ? "进入用户中心" : "立即开始"}
        </button>
      </div>

      {/* 游戏列表 */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 60px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>热门游戏</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "24px", cursor: "pointer", transition: "all 0.3s", hover: { transform: "translateY(-4px)" } }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: game.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "16px" }}>
                {game.icon}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{game.name}</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>{game.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 底部 */}
      <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.4)", fontSize: "13px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        ⚠️ 18+成年情侣娱乐 | 双方自愿安全 | 不适即停
      </div>
    </div>
  );
}
