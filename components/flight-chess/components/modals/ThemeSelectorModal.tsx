"use client";
import { Theme } from '../../types';
import { Check } from 'lucide-react';
import { useEffect } from 'react';

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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999]"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div 
        className="absolute bottom-0 left-0 right-0 bg-[#1C1C1E] rounded-t-[32px] p-6"
        style={{ 
          maxHeight: '70vh',
          animation: 'fcSlideUp 0.3s ease-out',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: '48px', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>选择主题</h3>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(70vh - 100px)' }}>
          {themes.map(theme => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  onSelect(theme.id);
                  onClose();
                }}
                style={{
                  padding: '14px 16px',
                  backgroundColor: isSelected ? 'rgba(10,132,255,0.15)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid rgba(10,132,255,0.5)' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <span style={{ color: 'white', fontWeight: 500, fontSize: '15px' }}>{theme.name}</span>
                {isSelected && (
                  <Check style={{ color: '#0A84FF' }} size={20} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes fcSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
