import { Theme } from '../../types';
import { Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  themes: Theme[];
  selectedThemeId: string | null;
  onSelect: (themeId: string) => void;
  onClose: () => void;
}

export function ThemeSelectorModal({
  isOpen,
  themes,
  selectedThemeId,
  onSelect,
  onClose
}: ThemeSelectorModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof window === 'undefined') return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-white/10 animate-slide-up">
        <div className="w-10 h-1 bg-gray-500 rounded-full mx-auto mb-4" />
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-white">选择主题</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto no-scrollbar">
          {themes.map(theme => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  onSelect(theme.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-500/20 to-pink-500/20 border-2 border-blue-400/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-blue-500/30' : 'bg-white/10'
                  }`}>
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{theme.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {theme.tasks?.length || 0} 个任务
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="text-white" size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
