"use client";
import { useRef, useState, useEffect } from 'react';
import { GameMode, Player, Theme } from '../../types';

interface HomeViewProps {
  players: Player[];
  themes: Theme[];
  gameMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onSelectTheme: (playerId: number) => void;
  onStartGame: () => void;
}

const gameModes: Array<{ id: GameMode; title: string; desc: string; emoji: string }> = [
  { id: 'board', title: '飞行棋模式', desc: '投骰子走棋，落格触发任务', emoji: '🎲' },
  { id: 'card', title: '任务卡牌模式', desc: '轮流抽取任务，不用投骰子', emoji: '🃏' },
  { id: 'mine', title: '扫雷模式', desc: '点击方格，触发隐藏事件', emoji: '💣' },
  { id: 'dice', title: '亲密骰子模式', desc: '上下骰子组合动作与部位', emoji: '🎯' },
  { id: 'pose', title: '姿势模式', desc: '轮流抽取姿势图片', emoji: '🖼️' }
];

export function HomeView({ players, themes, gameMode, onSelectMode, onSelectTheme, onStartGame }: HomeViewProps) {
  const shouldShowThemeSelectors = gameMode !== 'pose';
  const themeHint = gameMode === 'dice' ? '选择上骰子动作主题和下骰子部位主题'
    : gameMode === 'card' ? '选择游戏模式和双方抽卡题库'
    : gameMode === 'mine' ? '选择游戏模式和双方扫雷主题题库'
    : '选择游戏模式和双方任务主题包';

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollHint, setScrollHint] = useState({ left: false, right: false });

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const update = () => {
      setScrollHint({
        left: scroller.scrollLeft > 24,
        right: scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 2
      });
    };
    update();
    scroller.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scrollModeIntoView = (modeId: GameMode) => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector<HTMLElement>(`[data-mode-id="${modeId}"]`);
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  };

  const handleArrow = (dir: -1 | 1) => {
    const idx = gameModes.findIndex(m => m.id === gameMode);
    const next = gameModes[idx + dir];
    if (next) { onSelectMode(next.id); scrollModeIntoView(next.id); return; }
    scrollerRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  const startLabel = gameMode === 'card' ? '开始抽卡' : gameMode === 'pose' ? '开始抽姿势'
    : gameMode === 'dice' ? '开始骰子' : gameMode === 'mine' ? '开始扫雷' : '开始游戏';

  return (
    <div style={{height:'100%',minHeight:0}}>
      <div className="no-scrollbar" style={{height:'100%',minHeight:0,overflowY:'auto',padding:'8px 0 24px',background:'transparent',scrollbarWidth:'none',msOverflowStyle:'none'}}>
        <div style={{textAlign:'center',marginBottom:8}}>
          <h2 style={{fontSize:20,color:'#ccc',fontWeight:500,margin:0}}>配置游戏角色</h2>
          <p style={{fontSize:13,color:'#666',marginTop:8,margin:'8px 0 0'}}>
            {shouldShowThemeSelectors ? themeHint : '选择游戏模式即可开始'}
          </p>
        </div>

        {/* 模式选择 */}
        <div style={{position:'relative',marginBottom:12}}>
          <div ref={scrollerRef} className="no-scrollbar" style={{
            overflowX:'auto',paddingBottom:4,display:'flex',gap:12,touchAction:'pan-x',
            scrollbarWidth:'none',msOverflowStyle:'none',WebkitOverflowScrolling:'touch',
            touchAction:'pan-x'
          }}>
            {gameModes.map(mode => {
              const isActive = mode.id === gameMode;
              return (
                <button key={mode.id} data-mode-id={mode.id} onClick={() => { onSelectMode(mode.id); scrollModeIntoView(mode.id); }}
                  style={{
                    minHeight:108,flex:'0 0 calc(50% - 6px)',minWidth:168,
                    borderRadius:20,border:`1px solid ${isActive?'#fff':'rgba(255,255,255,0.05)'}`,
                    padding:16,textAlign:'left',cursor:'pointer',transition:'all 0.2s',
                    background:isActive?'#fff':'#1C1C1E',color:isActive?'#000':'#fff'
                  }}>
                  <div style={{
                    width:40,height:40,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                    marginBottom:12,background:isActive?'#000':'rgba(255,255,255,0.05)',fontSize:22
                  }}>{mode.emoji}</div>
                  <div style={{fontSize:14,fontWeight:700,lineHeight:1.2}}>{mode.title}</div>
                  <div style={{fontSize:12,lineHeight:1.5,marginTop:4,color:isActive?'rgba(0,0,0,0.6)':'#666'}}>{mode.desc}</div>
                </button>
              );
            })}
          </div>
          {scrollHint.left && (
            <button onClick={() => handleArrow(-1)} style={{position:'absolute',left:-2,top:0,bottom:4,width:64,display:'flex',alignItems:'center',justifyContent:'flex-start',paddingLeft:4,background:'linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.7), transparent)',border:'none',cursor:'pointer',color:'#fff',zIndex:5,pointerEvents:'auto'}}>‹</button>
          )}
          {scrollHint.right && (
            <button onClick={() => handleArrow(1)} style={{position:'absolute',right:-2,top:0,bottom:4,width:64,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:4,background:'linear-gradient(to left, rgba(0,0,0,0.9), rgba(0,0,0,0.7), transparent)',border:'none',cursor:'pointer',color:'#fff',zIndex:5,pointerEvents:'auto'}}>›</button>
          )}
        </div>

        {/* 玩家主题选择 */}
        {shouldShowThemeSelectors && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {players.map((player, idx) => {
              const theme = themes.find(t => t.id === player.themeId);
              const isMale = idx === 0;
              const selectorName = gameMode === 'dice' ? (idx === 0 ? '上骰子' : '下骰子') : player.name;
              const selectedLabel = theme?.name || (gameMode === 'dice' ? (idx === 0 ? '未选择动作主题' : '未选择部位主题') : '未选择主题');
              return (
                <div key={player.id} onClick={() => onSelectTheme(player.id)}
                  style={{
                    background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.05)',
                    borderRadius:20,padding:20,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'
                  }}>
                  <div style={{display:'flex',alignItems:'center',gap:16}}>
                    <div style={{
                      width:48,height:48,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                      background:player.color,boxShadow:`0 10px 15px -3px ${player.color}30`,fontSize:24,flexShrink:0
                    }}>{isMale ? '👨' : '👩'}</div>
                    <div>
                      <div style={{fontSize:16,fontWeight:600,color:'#fff'}}>{selectorName}</div>
                      <div style={{fontSize:14,color:'#fff',marginTop:2,fontWeight:500}}>{selectedLabel}</div>
                    </div>
                  </div>
                  <div style={{color:'#555',fontSize:20}}>›</div>
                </div>
              );
            })}
          </div>
        )}
        {/* 开始按钮 */}
        <div style={{marginTop:16}}>
          <button onClick={onStartGame} style={{
            width:'100%',height:56,background:'#fff',borderRadius:999,color:'#000',fontWeight:600,fontSize:18,
            border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            boxShadow:'0 10px 15px -3px rgba(0,0,0,0.3)'
          }}>
            <span>{startLabel}</span>
            <span>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
    