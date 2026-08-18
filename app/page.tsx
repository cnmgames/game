import Link from "next/link";
import { gamesList } from "@/lib/gameData";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-7 px-3.5 py-4 sm:gap-12 sm:px-6 sm:py-10 lg:gap-16 lg:px-10 lg:py-12">
        {/* Header / Hero */}
        <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:gap-8 sm:rounded-3xl sm:p-8">
          <div className="flex items-center justify-between gap-2 sm:flex-wrap sm:gap-4">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-pink-200 sm:px-4 sm:text-xs">
              18+ 体验
            </span>
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="inline-flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-xl sm:h-9 sm:px-4">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="hidden sm:inline">当前在线：128</span>
                <span className="sm:hidden">128人</span>
              </div>
              <div className="inline-flex h-8 items-center gap-1 rounded-full bg-white/10 px-2 text-xs sm:h-9">
                <span className="rounded-full px-2 py-1 text-white/70">En</span>
                <span className="rounded-full bg-white px-2 py-1 text-gray-900">简体</span>
              </div>
            </div>
          </div>

          <div className="max-w-3xl space-y-2.5 text-white sm:space-y-4">
            <h1 className="text-[1.7rem] font-semibold leading-tight sm:text-5xl">
              燃情此刻，<span className="gradient-text">放肆尽兴</span>
            </h1>
            <p className="text-sm leading-relaxed text-white/80 sm:text-lg">
              多款氛围火热的互动游戏，专为敢玩敢爱的亲密情侣而设。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/ludo" className="btn-primary animate-glow">
              开始探索
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="#games" className="btn-secondary">
              浏览全部游戏
            </Link>
          </div>
        </header>

        {/* 游戏合集 */}
        <section id="games" className="space-y-4 sm:space-y-8">
          <header className="max-w-3xl space-y-1.5 text-white sm:space-y-3">
            <h2 className="text-xl font-semibold sm:text-3xl">游戏合集</h2>
            <p className="text-xs leading-relaxed text-white/70 sm:text-base">
              挑一款游戏，跟随指令，让爱意升温。
            </p>
          </header>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {gamesList.map((game) => (
              <Link
                key={game.slug}
                href={`/${game.slug}`}
                className="game-card group"
              >
                <div
                  className={`absolute -right-2 -top-2 text-4xl opacity-20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-60 sm:-right-4 sm:-top-4 sm:text-7xl`}
                >
                  {game.emoji}
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="space-y-2 sm:space-y-4 relative z-10">
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-pink-200">
                    {game.title}
                  </span>
                  <p className="overflow-hidden text-[11px] leading-snug text-white/60 sm:block sm:text-sm sm:leading-relaxed sm:text-white/70">
                    {game.desc}
                  </p>
                </div>
                <div className="relative z-10 mt-3 flex items-center gap-1.5 text-xs font-semibold text-pink-200 transition group-hover:text-pink-100 sm:mt-6 sm:gap-2 sm:text-sm">
                  进入游戏
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/70 backdrop-blur">
          <p>请在充分沟通界限的前提下玩乐，确保每一步都建立在积极同意之上。</p>
          <div className="flex justify-center items-center gap-4 mt-2">
            <span>© 2026 LoveGame</span>
            <span className="text-white/30">|</span>
            <span>Made with ❤️ for couples</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
