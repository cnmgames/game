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

export function ThemesView({ themes, onCreateTheme, onEditTheme }: ThemesViewProps) {
  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      paddingBottom: '24px',
      backgroundColor: '#000000',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '16px'
            }}
          >
            ←
          </button>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
          }}>任务主题库</h2>
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
            cursor: 'pointer'
          }}
          onClick={onCreateTheme}
        >
          新建主题
        </button>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {themes.map((theme, idx) => {
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
        })}
      </div>
    </div>
  );
}
