"use client";
import { Theme } from '../../types';
import { Check, X } from 'lucide-react';
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
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#1C1C1E',
          borderRadius: '20px',
          padding: '20px',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'fcModalFade 0.25s ease-out'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
          }}>选择主题</h3>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
              padding: 0
            }}
          >
            <X size={18} />
          </button>
        </div>
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
                  touchAction: 'manipulation',
                  textAlign: 'left'
                }}
              >
                <span style={{ color: 'white', fontWeight: 500, fontSize: '15px' }}>{theme.name}</span>
                {isSelected && (
                  <Check style={{ color: '#0A84FF', flexShrink: 0 }} size={20} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{
          marginTop: '12px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)'
        }}>
          点击空白处关闭
        </div>
      </div>
      <style>{`
        @keyframes fcModalFade {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
