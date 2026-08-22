import { Player, Theme } from '../../types';
import { ChevronRight, User, UserRound } from 'lucide-react';

interface HomeViewProps {
  players: Player[];
  themes: Theme[];
  onSelectTheme: (playerId: number) => void;
  onStartGame: () => void;
}

export function HomeView({ players, themes, onSelectTheme, onStartGame }: HomeViewProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white">配置游戏角色</h2>
        <p className="text-sm text-gray-400 mt-1.5">选择双方的任务主题包</p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {players.map((player, idx) => {
          const theme = themes.find(t => t.id === player.themeId);
          const isMale = idx === 0;

          return (
            <div
              key={player.id}
              className="w-full ios-card p-4 flex items-center justify-between ios-btn cursor-pointer border border-white/10 active:scale-[0.98] transition-transform"
              onClick={() => onSelectTheme(player.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg shrink-0"
                  style={{
                    backgroundColor: player.color,
                    boxShadow: `0 8px 12px -3px ${player.color}40`
                  }}
                >
                  {isMale ? (
                    <User className="text-white" size={22} />
                  ) : (
                    <UserRound className="text-white" size={22} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-base font-semibold text-white truncate">
                    {player.name}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5 truncate">
                    {theme?.name || '未选择主题'}
                  </div>
                </div>
              </div>
              <ChevronRight className="text-gray-500 shrink-0" size={20} />
            </div>
          );
        })}
      </div>

      <button
        className="w-full h-12 bg-white rounded-full text-black font-semibold text-base shadow-lg flex items-center justify-center gap-2 mt-2 active:scale-[0.98] transition-transform"
        onClick={onStartGame}
      >
        <span>开始游戏</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
