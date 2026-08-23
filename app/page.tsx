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
    { emoji: "✈️", title: "情侣飞行棋", desc: "经典飞行棋的情趣浪漫升级版，专为情侣设计的增进感情的情趣游戏。掷骰子前进，每格都有惊喜任务，让感情迅速升温。", path: "/flight", type: "free" },
    { emoji: "🎡", title: "真心话大冒险转盘", desc: "终极派对游戏。旋转转盘抽取题目，回答劲爆的真心话问题或接受刺激大胆的挑战，揭开彼此心底的秘密。", path: "/truth", type: "paid" },
    { emoji: "🎲", title: "情趣骰子", desc: "喝酒助兴必备神器。摇骰子比大小，挑战上家的点数，输了就喝酒或接受大冒险惩罚，越玩越刺激。", path: "/dice", type: "paid" },
    { emoji: "🦁", title: "火辣暗兽棋", desc: "翻牌、博弈、宽衣，心跳加速的策略对决。记忆与运气的较量，每翻一张牌都可能让对方卸下防备。", path: "/beast", type: "paid" },
    { emoji: "🎰", title: "桃色老虎机", desc: "一拉定情。地点、动作、部位随机组合，摇出你的下一个亲密时刻。先集满欲望条者获胜，体验前所未有的刺激。", path: "/slot", type: "paid" },
    { emoji: "💎", title: "午夜大富翁", desc: "绕着棋盘冒险，每一站都有欲望事件等待完成。买房、收租、触发惊喜，在游戏中一步步点燃激情。", path: "/monopoly", type: "paid" },
    { emoji: "🚀", title: "情侣飞行棋Pro", desc: "功能增强版飞行棋，支持自定义任务主题、AI智能导入、3D骰子动画，男女双方专属任务包，打造你们的专属游戏。", path: "/flight-pro", dev: true, type: "paid" },
    { emoji: "💕", title: "姿势大全", desc: "12种经典性爱姿势，详细图文教程与难度分级，从入门到高阶，探索更多亲密可能，让每一晚都充满新鲜感。", path: "/posture", dev: true, type: "paid" },
  ];

  return (
    <>
      <div className="bg-aurora" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-7 px-3.5 py-4 sm:gap-12 sm:px-6 sm:py-10 lg:gap-16 lg:px-10 lg:py-12">
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
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a href="#games" className="btn-primary md:hidden">开始探索</a>
              <a href="#games" className="hidden items-center gap-2 rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/40 transition hover:bg-pink-400 md:inline-flex">开始探索</a>
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
                    {game.dev && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-pulse">
                        开发中
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

        {/* 激活入口 */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/activate" className="rounded-full border border-pink-400/40 bg-pink-500/10 px-6 py-2.5 text-sm font-semibold text-pink-200 hover:bg-pink-500/20 transition">
            🔑 激活游戏
          </Link>
          <a href="https://weidian.com/?userid=1388425837" target="_blank" rel="noopener noreferrer" className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/50 hover:from-pink-400 hover:to-purple-500 hover:shadow-pink-500/70 transition animate-pulse">
            🛒 购买激活码
          </a>
        </div>

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
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition"
          >
            🗑️ 清理缓存
          </button>
        </div>

        {/* 底部声明 */}
        <div className="footer-card">
          <p>请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
        </div>
        
        {/* 免责声明 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/30 leading-relaxed">
            🔞 本网站所有游戏仅供18岁以上成年情侣在双方自愿前提下娱乐使用
          </p>
          <p className="text-xs text-white/20 mt-1">
            请在安全、健康、互敬的原则下进行，如有不适请立即停止
          </p>
        </div>
      </div>
    </>
  );
}
