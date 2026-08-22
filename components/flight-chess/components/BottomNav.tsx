import { GamepadIcon, Layers } from 'lucide-react';

interface BottomNavProps {
  activeView: 'home' | 'game' | 'themes';
  onNavigate: (view: 'home' | 'themes') => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const isGameActive = activeView === 'home' || activeView === 'game';
  const isThemesActive = activeView === 'themes';

  return (
    <nav className="ios-glass border-t border-white/10 flex items-center justify-around px-4 shrink-0 z-50 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
      <button
        className={`flex flex-col items-center gap-1 px-8 py-1.5 rounded-xl transition-all ${
          isGameActive
            ? 'bg-white/15 text-white shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        onClick={() => onNavigate('home')}
      >
        <GamepadIcon size={22} />
        <span className="text-[11px] font-medium">游戏</span>
      </button>

      <button
        className={`flex flex-col items-center gap-1 px-8 py-1.5 rounded-xl transition-all ${
          isThemesActive
            ? 'bg-white/15 text-white shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        onClick={() => onNavigate('themes')}
      >
        <Layers size={22} />
        <span className="text-[11px] font-medium">题库</span>
      </button>
    </nav>
  );
}
