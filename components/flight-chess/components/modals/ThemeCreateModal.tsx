import { useEffect, useMemo, useState } from 'react';
import { Theme } from '../../types';
import { X } from 'lucide-react';

interface ThemeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: { name: string; desc: string; audience: Theme['audience'] }) => void;
  onOpenAiImport: (themeInfo: { name: string; desc: string; audience: Theme['audience'] }) => void;
}

const audienceOptions: Array<{ value: Theme['audience']; label: string }> = [
  { value: 'common', label: '通用' },
  { value: 'male', label: '仅限男方' },
  { value: 'female', label: '仅限女方' }
];

export function ThemeCreateModal({ isOpen, onClose, onCreate, onOpenAiImport }: ThemeCreateModalProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [audience, setAudience] = useState<Theme['audience']>('common');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setDesc('');
    setAudience('common');
    setError('');
  }, [isOpen]);

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

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999999
    }}>
      <div
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '20px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          margin: '0 auto 16px'
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
          }}>新建主题</h3>
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

        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '16px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>主题名称</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '14px',
                paddingRight: '14px',
                borderRadius: '10px',
                backgroundColor: '#2C2C2E',
                color: 'white',
                outline: 'none',
                border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="例如：甜蜜互动"
              maxLength={24}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>描述（可选）</div>
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '14px',
                paddingRight: '14px',
                borderRadius: '10px',
                backgroundColor: '#2C2C2E',
                color: 'white',
                outline: 'none',
                border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="例如：日常小甜饼、轻量互动"
              maxLength={60}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>适用对象</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {audienceOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAudience(opt.value)}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: audience === opt.value ? 'white' : '#2C2C2E',
                    color: audience === opt.value ? 'black' : 'rgba(255,255,255,0.7)'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ fontSize: '13px', color: '#FF453A', marginBottom: '12px' }}>{error}</div>}
        </div>

        <button
          onClick={() => onOpenAiImport({ name: name.trim() || 'AI导入主题', desc: desc.trim(), audience })}
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #BF5AF2, #FF375F)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}
        >
          ✨ AI 导入任务卡
        </button>
        <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '999px',
              backgroundColor: '#3A3A3C',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => {
              if (!name.trim()) {
                setError('请输入主题名称');
                return;
              }
              onCreate({ name: name.trim(), desc: desc.trim(), audience });
            }}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '999px',
              background: canSubmit ? 'linear-gradient(90deg, #0A84FF, #007AFF)' : '#3A3A3C',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.5
            }}
          >
            创建并编辑
          </button>
        </div>
      </div>
    </div>
  );
}
