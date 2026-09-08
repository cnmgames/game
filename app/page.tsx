"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "../components/Icon";

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

const games = [
  { id: 1, name: "情趣飞行棋", desc: "情侣互动经典游戏", icon: "dice", color: "#FF6B6B" },
  { id: 2, name: "真心话大冒险", desc: "深入了解彼此", icon: "message", color: "#4ECDC4" },
  { id: 3, name: "夫妻骰子", desc: "随机趣味挑战", icon: "target", color: "#45B7D1" },
  { id: 4, name: "卡牌游戏", desc: "多种玩法合集", icon: "cards", color: "#96CEB4" },
  { id: 5, name: "转盘游戏", desc: "幸运大转盘", icon: "gamepad", color: "#FFEAA7" },
  { id: 6, name: "更多游戏", desc: "持续更新中", icon: "sparkles", color: "#DDA0DD" },
];

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
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

    const heartbeat = () => {
      fetch(API_BASE + "online/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "", device_id: getDeviceId() }),
      }).catch(() => {});
    };
    heartbeat();
    setInterval(heartbeat, 30000);

    const fetchOnline = () => {
      fetch(API_BASE + "online/count")
        .then((r) => r.json())
        .then((data) => setOnlineCount(data.online || 0))
        .catch(() => {});
    };
    fetchOnline();
    setInterval(fetchOnline, 5000);
  }, []);

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

  const goTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === "user") {
      router.push("/user");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", color: "#fff", paddingBottom: "70px" }}>
      {/* 顶部状态栏 */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(26,26,46,0.95)", backdropFilter: "blur(20px)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="heart" size={18} color="#fff" />
          </div>
          <span style={{ fontSize: "17px", fontWeight: 700 }}>情侣游戏</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", padding: "6px 12px", borderRadius: "20px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34C759", display: "inline-block" }}></span>
          {onlineCount} 人在线
        </div>
      </div>

      {/* Banner */}
      <div style={{ margin: "16px", padding: "28px 24px", borderRadius: "20px", background: "linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 8px" }}>情侣互动小游戏</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", margin: "0 0 20px" }}>14款游戏 · 千种玩法 · 持续更新</p>
        <button
          onClick={() => (isLoggedIn ? router.push("/user") : router.push("/login"))}
          style={{ padding: "12px 28px", background: "#007AFF", color: "#fff", border: "none", borderRadius: "24px", fontSize: "15px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Icon name="gamepad" size={16} />
          {isLoggedIn ? "进入游戏" : "立即开始"}
        </button>
      </div>

      {/* 游戏列表 */}
      <div style={{ padding: "0 16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "8px 0 16px" }}>热门游戏</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px 16px", cursor: "pointer" }}
            >
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: game.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Icon name={game.icon} size={22} color="#fff" />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px" }}>{game.name}</h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>{game.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 底部导航栏 */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(20,20,35,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", padding: "8px 0 calc(8px + env(safe-area-inset-bottom))" }}>
        <button onClick={() => goTab("home")} style={{ flex: 1, background: "none", border: "none", color: activeTab === "home" ? "#007AFF" : "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "6px 0" }}>
          <Icon name="home" size={22} />
          <span style={{ fontSize: "10px", fontWeight: 500 }}>首页</span>
        </button>
        <button onClick={() => goTab("game")} style={{ flex: 1, background: "none", border: "none", color: activeTab === "game" ? "#007AFF" : "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "6px 0" }}>
          <Icon name="gamepad" size={22} />
          <span style={{ fontSize: "10px", fontWeight: 500 }}>游戏</span>
        </button>
        <button onClick={() => goTab("user")} style={{ flex: 1, background: "none", border: "none", color: activeTab === "user" ? "#007AFF" : "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "6px 0" }}>
          <Icon name="user" size={22} />
          <span style={{ fontSize: "10px", fontWeight: 500 }}>我的</span>
        </button>
      </nav>
    </div>
  );
}
