"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

export default function Home() {
  const router = useRouter();
  const [visitCount, setVisitCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(-1);
  const [freeMode, setFreeMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "全部", icon: "gamepad" },
    { id: "interactive", name: "互动类", icon: "heart" },
    { id: "card", name: "卡牌类", icon: "cards" },
    { id: "advanced", name: "进阶类", icon: "rocket" },
    { id: "exclusive", name: "专属类", icon: "star" },
  ];

  const games = [
    { icon: "plane", title: "情侣飞行棋", desc: "掷骰子前进，每格都有惊喜任务，让感情迅速升温。", path: "/flight", type: "free", category: "interactive" },
    { icon: "target", title: "真心话大冒险转盘", desc: "旋转转盘抽题，真心话或大冒险，揭开彼此秘密。", path: "/truth", type: "paid", category: "interactive" },
    { icon: "dice", title: "情趣骰子", desc: "摇骰子比大小，输了喝酒或接受惩罚，越玩越刺激。", path: "/dice", type: "paid", category: "interactive" },
    { icon: "paw", title: "火辣暗兽棋", desc: "翻牌博弈策略对决，每翻一张牌都可能让对方卸下防备。", path: "/beast", type: "paid", category: "card" },
    { icon: "gamepad", title: "桃色老虎机", desc: "地点动作部位随机组合，摇出你的下一个亲密时刻。", path: "/slot", type: "paid", category: "card" },
    { icon: "gem", title: "午夜大富翁", desc: "绕棋盘冒险，每站都有欲望事件，一步步点燃激情。", path: "/monopoly", type: "paid", category: "card" },
    { icon: "rocket", title: "情侣飞行棋Pro", desc: "自定义任务主题、AI导入、3D骰子，打造专属游戏。", path: "/flight-pro", type: "paid", category: "advanced" },
    { icon: "heart", title: "姿势大全", desc: "12种经典姿势图文教程，难度分级，探索更多亲密可能。", path: "/posture", type: "paid", category: "advanced" },
    { icon: "eye", title: "心有灵犀", desc: "情侣默契考验，同时答题，一致得分，不一致甜蜜惩罚。", path: "/telepathy", type: "paid", category: "interactive" },
    { icon: "users", title: "角色扮演剧场", desc: "多种场景剧本，老师学生、医生病人、上司下属，分角色演绎剧情任务，释放想象。", path: "/roleplay", type: "paid", category: "advanced" },
    { icon: "cards", title: "情侣脱衣卡牌", desc: "扑克牌对战，输了脱衣或执行亲密惩罚，功能牌触发特殊挑战，越玩越火辣。", path: "/strip-cards", type: "paid", category: "card" },
    { icon: "moon", title: "感官探索", desc: "蒙眼感官游戏，触觉嗅觉味觉探索对方，各种感官挑战，放大每一次触碰的快感。", path: "/senses", type: "paid", category: "advanced" },
    { icon: "users", title: "他与他", desc: "专为男同情侣设计，真心话、大冒险、亲密任务三种模式，属于两个男生的深夜专属游戏。", path: "/gay", type: "paid", category: "exclusive" },
    { icon: "flame", title: "无界升温", desc: "温度无上限的情侣升温卡牌游戏，投骰子定先后，轮流抽卡完成任务，安全词是唯一刹车。", path: "/infinite-celsius/", type: "paid", category: "card" },
  ];

  const filteredGames = activeCategory === "all" ? games : games.filter(g => g.category === activeCategory);

  // 登录状态检查
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
  }, []);

  // 云端真实在线人数：上报访问 + 定时查询
  useEffect(() => {
    let retryCount = 0;
    fetch(API_BASE + "online/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "", device_id: getDeviceId() }),
    }).catch(() => {});
    const fetchOnline = () => {
      fetch(API_BASE + "online/count", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          setOnlineCount(data.online || 0);
          retryCount = 0;
        })
        .catch(() => {
          if (retryCount < 3) {
            retryCount++;
            setTimeout(fetchOnline, 5000);
          }
        });
    };
    setTimeout(fetchOnline, 500);
    const timer = setInterval(() => {
      if (!document.hidden) fetchOnline();
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // 本地累计访问次数
  useEffect(() => {
    const stored = localStorage.getItem("lovegame_visit_count");
    const count = stored ? parseInt(stored, 10) : 0;
    const newCount = count + 1;
    localStorage.setItem("lovegame_visit_count", String(newCount));
    setVisitCount(newCount);
  }, []);

  const handleGameClick = (e: React.MouseEvent, game: any) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push("/login");
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 20px) scale(1.15); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-gradient-shift { 
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .hero-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 30px rgba(255,55,95,0.5) !important;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="bg-aurora" />
      {/* 浮动光晕装饰 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-20 blur-3xl animate-float" style={{ background: "radial-gradient(circle, #FF375F, transparent)" }} />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full opacity-15 blur-3xl animate-float-delayed" style={{ background: "radial-gradient(circle, #BF5AF2, transparent)" }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full opacity-10 blur-3xl animate-float" style={{ background: "radial-gradient(circle, #FF9500, transparent)" }} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-3.5 py-4 sm:gap-8 sm:px-6 sm:py-8 lg:gap-10 lg:px-10 lg:py-10">
        {/* 顶部卡片 */}
        <div className="game-container relative overflow-hidden">
          {/* 顶部装饰线 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60" />
          
          <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-pink-200 sm:px-4 sm:text-xs animate-pulse-slow">18+ Experience</span>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="nav-pill">
                <span className="online-dot animate-pulse" />
                <span className="sm:hidden">在线 {onlineCount === -1 ? "--" : onlineCount}</span>
                <span className="hidden sm:inline">当前在线：{onlineCount === -1 ? "--" : onlineCount} 人</span>
              </div>
              {isLoggedIn ? (
                <Link href="/user" className="nav-pill !bg-pink-500/20 !border-pink-400/40 !text-pink-200 hover:!bg-pink-500/30 transition-all duration-300 hover:scale-105">
                  {userEmail ? userEmail.split("@")[0] : "用户中心"}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="nav-pill hover:!bg-white/10 transition-all duration-300 hover:scale-105">登录</Link>
                  <Link href="/register" className="nav-pill !bg-pink-500/20 !border-pink-400/40 !text-pink-200 hover:!bg-pink-500/30 transition-all duration-300 hover:scale-105">注册</Link>
                </>
              )}
            </div>
          </div>
          
          <div className="max-w-3xl space-y-2.5 text-white sm:space-y-4">
            <h1 className="text-[1.7rem] font-semibold leading-tight sm:text-5xl bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent bg-size-200 animate-gradient-shift">
              燃情此刻，放肆尽兴
            </h1>
            <p className="text-sm leading-relaxed text-white/80 sm:text-lg fade-in-up" style={{ animationDelay: "0.2s" }}>
              多款氛围火辣的私房游戏，专为敢玩敢爱的亲密情侣而设。
            </p>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-4 fade-in-up" style={{ animationDelay: "0.4s" }}>
              <a href="#games" className="hero-btn inline-flex items-center justify-center rounded-full px-2 py-2 text-xs font-bold text-white transition-all duration-300 sm:px-6 sm:py-3 sm:text-sm" style={{ background: "linear-gradient(135deg, #FF375F 0%, #FF2D55 50%, #D70040 100%)", boxShadow: "0 4px 20px rgba(255,55,95,0.4)" }}>
                开始探索
              </a>
              <Link href="/activate" className="hero-btn inline-flex items-center justify-center rounded-full px-2 py-2 text-xs font-bold text-white transition-all duration-300 sm:px-6 sm:py-3 sm:text-sm" style={{ background: "linear-gradient(135deg, #BF5AF2 0%, #5E5CE6 100%)", boxShadow: "0 4px 20px rgba(191,90,242,0.4)" }}>
                激活游戏
              </Link>
              <a href="https://weidian.com/?userid=1388425837" target="_blank" rel="noopener noreferrer" className="hero-btn inline-flex items-center justify-center rounded-full px-2 py-2 text-xs font-bold text-white transition-all duration-300 sm:px-6 sm:py-3 sm:text-sm" style={{ background: "linear-gradient(135deg, #FF9500 0%, #FF2D55 100%)", boxShadow: "0 4px 20px rgba(255,149,0,0.4)" }}>
                购买激活码
              </a>
            </div>
          </div>
        </div>

        {/* 游戏合集 */}
        <div id="games" className="space-y-4 sm:space-y-8">
          <div className="max-w-3xl space-y-1.5 text-white sm:space-y-3">
            <h2 className="text-xl font-semibold sm:text-3xl">游戏合集</h2>
            <p className="text-xs leading-relaxed text-white/70 sm:text-base">挑一款游戏，跟随指令，让欲望引路。</p>
          </div>

          {/* 分类标签 */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 sm:text-sm ${
                  activeCategory === cat.id
                    ? "text-white scale-105"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                }`}
                style={activeCategory === cat.id ? {
                  background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)",
                  boxShadow: "0 4px 16px rgba(255,55,95,0.3)",
                } : {}}
              >
                <Icon name={cat.icon} size={14} />
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {filteredGames.map((game, i) => (
              <Link key={game.path} href={game.path} className="game-card group fade-in-up" style={{ animationDelay: `${i * 0.06}s` }} onClick={(e) => handleGameClick(e, game)}>
                <span className="game-card-emoji flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon name={game.icon} size={40} color="#FF375F" />
                </span>
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="game-card-tag" style={{
                      position: 'relative',
                      display: 'inline-block',
                      paddingBottom: '4px'
                    }}>
                      {game.title}
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60%',
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #FF375F, #BF5AF2, transparent)',
                        borderRadius: '2px',
                        boxShadow: '0 0 8px rgba(255,55,95,0.5)'
                      }} />
                    </span>
                    {freeMode ? (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-pulse">
                        限时免费
                      </span>
                    ) : game.type === "free" ? (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                        免费
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                        付费
                      </span>
                    )}
                  </div>
                  <p className="game-card-desc">{game.desc}</p>
                </div>
                <span className="game-card-link">进入游戏 <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </div>

        {/* 底部区域 */}
        <div className="flex flex-col gap-4 mt-2">
        <div className="flex justify-center">
          <button
            onClick={() => {
              if (confirm('确定要清理所有本地缓存吗？这将清除游戏进度和激活状态。')) {
                localStorage.clear();
                sessionStorage.clear();
                if (window.caches) {
                  caches.keys().then(keys => {
                    keys.forEach(key => caches.delete(key));
                  });
                }
                alert('缓存已清理，页面即将刷新');
                setTimeout(() => window.location.reload(), 500);
              }
            }}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition-all duration-300"
          >
            清理缓存
          </button>
        </div>

        <div className="footer-card !py-2 !my-0">
          <p className="!text-xs">请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-white/30 leading-relaxed flex items-center justify-center gap-1.5">
            <Icon name="shield" size={14} color="rgba(255,255,255,0.3)" />
            本网站所有游戏仅供18岁以上成年情侣在双方自愿前提下娱乐使用
          </p>
          <p className="text-xs text-white/20 mt-1">
            请在安全、健康、互敬的原则下进行，如有不适请立即停止
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
