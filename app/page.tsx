"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [visitCount, setVisitCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(-1);

  // 云端真实在线人数：上报访问 + 定时查询
  useEffect(() => {
    const API_BASE = "https://api.ttla.top";
    let retryCount = 0;
    fetch(`${API_BASE}/online/visit`, { method: "POST", mode: "no-cors" }).catch(() => {});
    const fetchOnline = () => {
      fetch(`${API_BASE}/online/count`, { cache: "no-store" })
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
    setTimeout(fetchOnline, 1000);
    // 10秒实时刷新，页面不可见时暂停
    const timer = setInterval(() => {
      if (!document.hidden) {
        fetchOnline();
      }
    }, 10000);
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

const games = [
    { emoji: "✈️", title: "情侣飞行棋", desc: "掷骰子前进，每格都有惊喜任务，让感情迅速升温。", path: "/flight", type: "free" },
    { emoji: "🎡", title: "真心话大冒险转盘", desc: "旋转转盘抽题，真心话或大冒险，揭开彼此秘密。", path: "/truth", type: "paid" },
    { emoji: "🎲", title: "情趣骰子", desc: "摇骰子比大小，输了喝酒或接受惩罚，越玩越刺激。", path: "/dice", type: "paid" },
    { emoji: "🦁", title: "火辣暗兽棋", desc: "翻牌博弈策略对决，每翻一张牌都可能让对方卸下防备。", path: "/beast", type: "paid" },
    { emoji: "🎰", title: "桃色老虎机", desc: "地点动作部位随机组合，摇出你的下一个亲密时刻。", path: "/slot", type: "paid" },
    { emoji: "💎", title: "午夜大富翁", desc: "绕棋盘冒险，每站都有欲望事件，一步步点燃激情。", path: "/monopoly", type: "paid" },
    { emoji: "🚀", title: "情侣飞行棋Pro", desc: "自定义任务主题、AI导入、3D骰子，打造专属游戏。", path: "/flight-pro", type: "paid" },
    { emoji: "💕", title: "姿势大全", desc: "12种经典姿势图文教程，难度分级，探索更多亲密可能。", path: "/posture", type: "paid" },
    { emoji: "🧠", title: "心有灵犀", desc: "情侣默契考验，同时答题，一致得分，不一致甜蜜惩罚。", path: "/telepathy", type: "paid" },
    { emoji: "🎭", title: "角色扮演剧场", desc: "多种场景剧本，老师学生、医生病人、上司下属，分角色演绎剧情任务，释放想象。", path: "/roleplay", type: "paid" },
    { emoji: "🃏", title: "情侣脱衣卡牌", desc: "扑克牌对战，输了脱衣或执行亲密惩罚，功能牌触发特殊挑战，越玩越火辣。", path: "/strip-cards", type: "paid" },
    { emoji: "🌙", title: "感官探索", desc: "蒙眼感官游戏，触觉嗅觉味觉探索对方，各种感官挑战，放大每一次触碰的快感。", path: "/senses", type: "paid" },
    { emoji: "👨‍❤️‍👨", title: "他与他", desc: "专为男同情侣设计，真心话、大冒险、亲密任务三种模式，属于两个男生的深夜专属游戏。", path: "/gay", type: "paid" },
  ];

  return (
    <>
      <div className="bg-aurora" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-3.5 py-4 sm:gap-8 sm:px-6 sm:py-8 lg:gap-10 lg:px-10 lg:py-10">
        {/* 顶部卡片 */}
        <div className="game-container">
          <div className="flex items-center justify-between gap-2 mb-6">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-pink-200 sm:px-4 sm:text-xs">18+ Experience</span>
            <div className="nav-pill">
                <span className="online-dot" />
                <span className="sm:hidden">在线 {onlineCount === -1 ? "--" : onlineCount}</span>
                <span className="hidden sm:inline">当前在线：{onlineCount === -1 ? "--" : onlineCount} 人</span>
            </div>
          </div>
          <div className="max-w-3xl space-y-2.5 text-white sm:space-y-4">
            <h1 className="text-[1.7rem] font-semibold leading-tight sm:text-5xl">燃情此刻，放肆尽兴</h1>
            <p className="text-sm leading-relaxed text-white/80 sm:text-lg">多款氛围火辣的私房游戏，专为敢玩敢爱的亲密情侣而设。</p>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
              <a href="#games" className="inline-flex items-center justify-center rounded-full bg-pink-500 px-2 py-2 text-xs font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 sm:px-6 sm:py-3 sm:text-sm">开始探索</a>
              <Link href="/activate" className="inline-flex items-center justify-center rounded-full bg-pink-500 px-2 py-2 text-xs font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 sm:px-6 sm:py-3 sm:text-sm">激活游戏</Link>
              <a href="https://weidian.com/?userid=1388425837" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-pink-500 px-2 py-2 text-xs font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 sm:px-6 sm:py-3 sm:text-sm">购买激活码</a>
            </div>
          </div>
        </div>

        {/* 游戏合集 */}
        <div id="games" className="space-y-4 sm:space-y-8">
          <div className="max-w-3xl space-y-1.5 text-white sm:space-y-3">
            <h2 className="text-xl font-semibold sm:text-3xl">游戏合集</h2>
            <p className="text-xs leading-relaxed text-white/70 sm:text-base">挑一款游戏，跟随指令，让欲望引路。</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {games.map((game, i) => (
              <Link key={game.path} href={game.path} className="game-card group fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="game-card-emoji">{game.emoji}</span>
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
                    {game.type === "free" ? (
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

        {/* 底部区域 - 最小间距 */}
        <div className="flex flex-col gap-4 mt-2">
        {/* 清理缓存按钮 */}
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
            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition"
          >
            清理缓存
          </button>
        </div>

        {/* 底部声明 */}
        <div className="footer-card !py-2 !my-0">
          <p className="!text-xs">请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
        </div>
        
        {/* 免责声明 */}
        <div className="text-center">
          <p className="text-xs text-white/30 leading-relaxed">
            🔞 本网站所有游戏仅供18岁以上成年情侣在双方自愿前提下娱乐使用
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
