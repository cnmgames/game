interface PostureIllustrationProps {
  type: number; // 姿势类型 1-12
  color: string;
}

// 用SVG绘制简单的人物姿势示意图
export function PostureIllustration({ type, color }: PostureIllustrationProps) {
  const renderPosture = () => {
    switch (type) {
      case 1: // 传教士式
        return (
          <g>
            {/* 下方人物 */}
            <ellipse cx="50" cy="65" rx="25" ry="8" fill={color} opacity="0.6" />
            <circle cx="35" cy="55" r="8" fill={color} />
            <line x1="43" y1="55" x2="65" y2="55" stroke={color} strokeWidth="4" strokeLinecap="round" />
            {/* 上方人物 */}
            <ellipse cx="50" cy="45" rx="20" ry="6" fill={color} opacity="0.8" />
            <circle cx="65" cy="38" r="7" fill={color} />
          </g>
        );
      case 2: // 女上位
        return (
          <g>
            {/* 下方人物 */}
            <ellipse cx="50" cy="70" rx="25" ry="6" fill={color} opacity="0.6" />
            <circle cx="30" cy="65" r="7" fill={color} />
            {/* 上方人物 */}
            <ellipse cx="50" cy="45" rx="15" ry="20" fill={color} opacity="0.8" />
            <circle cx="50" cy="25" r="8" fill={color} />
            <line x1="42" y1="35" x2="35" y2="50" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1="58" y1="35" x2="65" y2="50" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 3: // 后入式
        return (
          <g>
            {/* 跪姿人物 */}
            <ellipse cx="40" cy="55" rx="18" ry="8" fill={color} opacity="0.8" />
            <circle cx="25" cy="48" r="7" fill={color} />
            <line x1="55" y1="55" x2="70" y2="45" stroke={color} strokeWidth="4" strokeLinecap="round" />
            {/* 后方人物 */}
            <ellipse cx="65" cy="40" rx="15" ry="6" fill={color} opacity="0.6" />
            <circle cx="78" cy="35" r="6" fill={color} />
          </g>
        );
      case 4: // 侧入式
        return (
          <g>
            <ellipse cx="35" cy="50" rx="20" ry="7" fill={color} opacity="0.7" />
            <circle cx="20" cy="45" r="7" fill={color} />
            <ellipse cx="65" cy="50" rx="18" ry="6" fill={color} opacity="0.8" />
            <circle cx="80" cy="45" r="6" fill={color} />
            <line x1="50" y1="50" x2="55" y2="50" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 5: // 坐莲式
        return (
          <g>
            {/* 坐着的人物 */}
            <ellipse cx="50" cy="65" rx="18" ry="6" fill={color} opacity="0.6" />
            <circle cx="50" cy="50" r="8" fill={color} />
            <line x1="50" y1="58" x2="50" y2="42" stroke={color} strokeWidth="4" strokeLinecap="round" />
            {/* 对面人物 */}
            <ellipse cx="50" cy="35" rx="12" ry="15" fill={color} opacity="0.8" />
            <circle cx="50" cy="18" r="7" fill={color} />
          </g>
        );
      case 6: // 站立式
        return (
          <g>
            <line x1="35" y1="70" x2="35" y2="35" stroke={color} strokeWidth="5" strokeLinecap="round" />
            <circle cx="35" cy="25" r="8" fill={color} />
            <line x1="65" y1="70" x2="65" y2="40" stroke={color} strokeWidth="5" strokeLinecap="round" />
            <circle cx="65" cy="30" r="7" fill={color} />
            <line x1="42" y1="45" x2="58" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 7: // 69式
        return (
          <g>
            <ellipse cx="35" cy="35" rx="15" ry="8" fill={color} opacity="0.7" />
            <circle cx="20" cy="30" r="6" fill={color} />
            <ellipse cx="65" cy="60" rx="15" ry="8" fill={color} opacity="0.8" />
            <circle cx="80" cy="55" r="6" fill={color} />
            <path d="M 45 40 Q 50 50 55 55" stroke={color} strokeWidth="2" fill="none" strokeDasharray="3,3" />
          </g>
        );
      case 8: // 拱桥式
        return (
          <g>
            <path d="M 20 65 Q 50 25 80 65" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="20" cy="65" r="7" fill={color} />
            <ellipse cx="80" cy="65" rx="8" ry="5" fill={color} opacity="0.6" />
          </g>
        );
      case 9: // 牛仔式
        return (
          <g>
            <ellipse cx="50" cy="70" rx="22" ry="6" fill={color} opacity="0.6" />
            <circle cx="30" cy="65" r="7" fill={color} />
            <ellipse cx="55" cy="40" rx="14" ry="18" fill={color} opacity="0.8" />
            <circle cx="55" cy="20" r="7" fill={color} />
            <line x1="47" y1="30" x2="40" y2="50" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1="63" y1="30" x2="70" y2="50" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 10: // 摇篮式
        return (
          <g>
            <ellipse cx="50" cy="60" rx="20" ry="10" fill={color} opacity="0.6" />
            <circle cx="35" cy="52" r="7" fill={color} />
            <ellipse cx="55" cy="38" rx="14" ry="12" fill={color} opacity="0.8" />
            <circle cx="55" cy="22" r="7" fill={color} />
            <path d="M 40 45 Q 50 55 60 45" stroke={color} strokeWidth="2" fill="none" />
          </g>
        );
      case 11: // 蜻蜓点水
        return (
          <g>
            <line x1="30" y1="70" x2="30" y2="45" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <circle cx="30" cy="35" r="7" fill={color} />
            <line x1="70" y1="70" x2="70" y2="40" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="30" r="6" fill={color} />
            <line x1="37" y1="50" x2="63" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 12: // 背靠背式
        return (
          <g>
            <ellipse cx="35" cy="50" rx="18" ry="8" fill={color} opacity="0.7" />
            <circle cx="20" cy="42" r="7" fill={color} />
            <ellipse cx="65" cy="50" rx="18" ry="8" fill={color} opacity="0.8" />
            <circle cx="80" cy="42" r="7" fill={color} />
            <line x1="50" y1="50" x2="50" y2="65" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      default:
        return <circle cx="50" cy="50" r="20" fill={color} opacity="0.5" />;
    }
  };

  return (
    <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }}>
      {renderPosture()}
    </svg>
  );
}
