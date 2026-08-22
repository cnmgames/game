import { GamepadIcon, Layers } from 'lucide-react';

interface BottomNavProps {
  activeView: 'home' | 'game' | 'themes';
  onNavigate: (view: 'home' | 'themes') => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const isGameActive = activeView === 'home' || activeView === 'game';
  const isThemesActive = activeView === 'themes';

  return (
    <nav className="h-20 ios-glass border-t border-white/10 flex items-center justify-around px-4 shrink-0 z-50">
      <button
        className={`flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all ${
          isGameActive
            ? 'bg-white/15 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        onClick={() => onNavigate('home')}
      >
        <GamepadIcon size={24} />
        <span className="text-xs font-medium">游戏</span>
      </button>

      <button
        className={`flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all ${
          isThemesActive
            ? 'bg-white/15 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        onClick={() => onNavigate('themes')}
      >
        <Layers size={24} />
        <span className="text-xs font-medium">题库</span>
      </button>
    </nav>
  );
}
