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
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '448px',
          backgroundColor: '#1C1C1E',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '20px',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          animation: 'fcModalUp 0.3s ease-out'
        }}
      >
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          margin: '0 auto 16px'
        }} />
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '16px',
          textAlign: 'center'
        }}>选择主题</h3>
        <div style={{
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
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
                  backgroundColor: isSelected ? 'rgba(10,132,255,0.2)' : 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid rgba(10,132,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  touchAction: 'manipulation'
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
        @keyframes fcModalUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
