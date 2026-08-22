"use client";
import { useState, useEffect } from 'react';
import { TaskEventData } from '../../types';
import { Heart, Lock, HandshakeIcon } from 'lucide-react';

interface TaskCardModalProps {
  isOpen: boolean;
  taskData: TaskEventData | null;
  onAccept: () => void;
  onReject: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  favorite: <Heart size={36} fill="currentColor" />,
  lock: <Lock size={36} />,
  handshake: <HandshakeIcon size={36} />
};

export function TaskCardModal({ isOpen, taskData, onAccept, onReject }: TaskCardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsFlipped(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !taskData) return null;

  const rejectLabel = taskData.type === 'collision' ? '拒绝（回到起点）' : '拒绝（倒退1~3格）';
  const executorLabel = taskData.executorPlayerId === 0 ? '男方' : '女方';
  const executorColor = taskData.executorPlayerId === 0 ? '#0A84FF' : '#FF375F';
  const iconColor = taskData.color || '#FF375F';

  return (
    <div
      onClick={onReject}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '440px',
          perspective: '1000px'
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          {/* 正面 */}
          <div
            onClick={() => setIsFlipped(true)}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: '#1C1C1E',
              borderRadius: '24px',
              padding: '32px 24px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              color: iconColor,
              animation: 'pulse 2s infinite'
            }}>
              {iconMap[taskData.icon] || iconMap.favorite}
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              marginBottom: '12px',
              textAlign: 'center'
            }}>{taskData.title}</h3>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: 0
            }}>
              点击翻转查看任务
            </p>
          </div>

          {/* 背面 */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: '#1C1C1E',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ color: iconColor, marginBottom: '12px' }}>
                {iconMap[taskData.icon] || iconMap.favorite}
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                marginBottom: '8px',
                textAlign: 'center'
              }}>{taskData.title}</h3>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                lineHeight: 1.5
              }}>
                <div>{taskData.subtitle}</div>
                <div style={{ marginTop: '4px' }}>
                  由 <span style={{ color: executorColor, fontWeight: 600 }}>{executorLabel}</span> 执行
                </div>
              </div>
            </div>

            <div style={{
              width: '100%',
              backgroundColor: '#2C2C2E',
              borderRadius: '16px',
              padding: '20px',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '20px',
              flex: 1
            }}>
              <p style={{
                fontSize: '16px',
                fontWeight: 500,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.6,
                margin: 0
              }}>
                {taskData.task}
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={onReject}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '999px',
                  backgroundColor: '#3A3A3C',
                  color: '#FF453A',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {rejectLabel}
              </button>
              <button
                onClick={onAccept}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '999px',
                  backgroundColor: 'white',
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
                }}
              >
                接受任务
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
