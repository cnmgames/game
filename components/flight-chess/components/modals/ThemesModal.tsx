"use client";
import { useState, useEffect, useRef } from 'react';
import { Theme } from '../../types';
import { X } from 'lucide-react';

interface ThemesModalProps {
  isOpen: boolean;
  themes: Theme[];
  onCreateTheme: () => void;
  onEditTheme: (themeId: string) => void;
  onClose: () => void;
}

const audienceLabel: Record<Theme['audience'], string> = {
  common: '通用',
  male: '仅男方',
  female: '仅女方'
};

const themeColors = [
  { bg: 'rgba(255,55,95,0.1)', border: 'rgba(255,55,95,0.3)', icon: '💕' },
  { bg: 'rgba(255,159,10,0.1)', border: 'rgba(255,159,10,0.3)', icon: '🔥' },
  { bg: 'rgba(191,90,242,0.1)', border: 'rgba(191,90,242,0.3)', icon: '💜' },
  { bg: 'rgba(10,132,255,0.1)', border: 'rgba(10,132,255,0.3)', icon: '💙' },
  { bg: 'rgba(48,209,88,0.1)', border: 'rgba(48,209,88,0.3)', icon: '💚' },
];

export function ThemesModal({ isOpen, themes, onCreateTheme, onEditTheme, onClose }: ThemesModalProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setDragY(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    } else {
      setDragY(0);
    }
    setIsDragging(false);
  };

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
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#1C1C1E',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '12px',
          paddingBottom: '8px'
        }}>
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '2px'
          }} />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
          }}>任务主题库</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onCreateTheme}
              style={{
                height: '32px',
                paddingLeft: '14px',
                paddingRight: '14px',
                borderRadius: '999px',
                backgroundColor: 'white',
                color: 'black',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              新建主题
            </button>
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
                cursor: 'pointer'
              }}
            >
              <X size={16} color="white" />
            </button>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {themes.map((theme, idx) => {
            const color = themeColors[idx % themeColors.length];
            return (
              <div
                key={theme.id}
                onClick={() => onEditTheme(theme.id)}
                style={{
                  backgroundColor: '#2C2C2E',
                  borderRadius: '14px',
                  padding: '14px',
                  border: `1px solid ${color.border}`,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '16px' }}>{color.icon}</span>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'white'
                    }}>{theme.name}</div>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: '2px',
                    lineHeight: 1.4
                  }}>{theme.desc}</div>
                  <div style={{
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      backgroundColor: color.bg,
                      paddingLeft: '6px',
                      paddingRight: '6px',
                      paddingTop: '3px',
                      paddingBottom: '3px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      color: 'rgba(255,255,255,0.7)'
                    }}>
                      {audienceLabel[theme.audience]}
                    </div>
                  </div>
                </div>
                <div style={{
                  backgroundColor: color.bg,
                  paddingLeft: '6px',
                  paddingRight: '6px',
                  paddingTop: '3px',
                  paddingBottom: '3px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  {theme.tasks.length}卡
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
