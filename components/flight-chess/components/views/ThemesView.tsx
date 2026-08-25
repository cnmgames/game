"use client";
import { useState, useMemo } from 'react';
import { Theme } from '../../types';

interface ThemesViewProps {
  themes: Theme[];
  onCreateTheme: () => void;
  onEditTheme: (themeId: string) => void;
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

// 根据主题id推断支持的模式
function getThemeModes(theme: Theme): string[] {
  const id = theme.id;
  if (id.includes('mine_truth') || id.includes('mine_dare')) return ['mine'];
  if (id.includes('dice_action') || id.includes('dice_body')) return ['dice'];
  return ['board', 'card', 'mine'];
}

const modeFilters = [
  { id: 'all', label: '全部' },
  { id: 'board', label: '飞行棋' },
  { id: 'card', label: '抽卡' },
  { id: 'mine', label: '扫雷' },
  { id: 'dice', label: '骰子' },
];

const audienceFilters = [
  { id: 'all', label: '全部对象' },
  { id: 'common', label: '通用' },
  { id: 'male', label: '男方' },
  { id: 'female', label: '女方' },
];

export function ThemesView({ themes, onCreateTheme, onEditTheme }: ThemesViewProps) {
  const [searchText, setSearchText] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');

  const filteredThemes = useMemo(() => {
    return themes.filter(theme => {
      // 搜索过滤
      if (searchText) {
        const text = searchText.toLowerCase();
        if (!theme.name.toLowerCase().includes(text) && !theme.desc.toLowerCase().includes(text)) {
          return false;
        }
      }
      // 模式过滤
      if (modeFilter !== 'all') {
        const modes = getThemeModes(theme);
        if (!modes.includes(modeFilter)) return false;
      }
      // 对象过滤
      if (audienceFilter !== 'all') {
        if (theme.audience !== audienceFilter) return false;
      }
      return true;
    });
  }, [themes, searchText, modeFilter, audienceFilter]);

  const totalTasks = themes.reduce((sum, t) => sum + t.tasks.length, 0);

  return (
    <div className="no-scrollbar" style={{
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      paddingBottom: '12px',
      backgroundColor: '#000000',
      position: 'relative',
      zIndex: 10,
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
        paddingTop: '4px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>任务主题库</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
            {themes.length} 个题库 · {totalTasks} 张任务卡
          </p>
        </div>
        <button
          style={{
            height: '36px',
            paddingLeft: '16px',
            paddingRight: '16px',
            borderRadius: '999px',
            backgroundColor: 'white',
            color: 'black',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onClick={onCreateTheme}
        >
          <span style={{ fontSize: '16px' }}>+</span> 新建
        </button>
      </div>

      {/* 搜索框 */}
      <div style={{
        position: 'relative',
        marginBottom: '12px'
      }}>
        <span style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '16px',
          opacity: 0.4
        }}>🔍</span>
        <input
          type="text"
          placeholder="搜索题库名称或描述"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: '42px',
            paddingRight: '14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* 模式筛选 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        {modeFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setModeFilter(filter.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: modeFilter === filter.id ? 'white' : 'rgba(255,255,255,0.08)',
              color: modeFilter === filter.id ? 'black' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 对象筛选 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {audienceFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setAudienceFilter(filter.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: audienceFilter === filter.id ? 'white' : 'rgba(255,255,255,0.08)',
              color: audienceFilter === filter.id ? 'black' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 主题列表 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {filteredThemes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '14px'
          }}>
            没有找到匹配的题库
          </div>
        ) : (
          filteredThemes.map((theme, idx) => {
            const color = themeColors[idx % themeColors.length];
            return (
              <div
                key={theme.id}
                onClick={() => onEditTheme(theme.id)}
                style={{
                  backgroundColor: '#1C1C1E',
                  borderRadius: '16px',
                  padding: '16px',
                  border: `1px solid ${color.border}`,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{ fontSize: '18px' }}>{color.icon}</span>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'white'
                    }}>{theme.name}</div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: '4px',
                    lineHeight: 1.4
                  }}>{theme.desc}</div>
                  <div style={{
                    marginTop: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      backgroundColor: color.bg,
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.7)'
                    }}>
                      {audienceLabel[theme.audience]}
                    </div>
                  </div>
                </div>
                <div style={{
                  backgroundColor: color.bg,
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  {theme.tasks.length}卡
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

    <style>{`
      .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
      .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    `}</style>