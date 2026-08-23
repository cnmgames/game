"use client";
import { MineRevealResult, MineTile, Player, TaskEventData, Theme } from '../../types';

interface Props {
  players: Player[];
  themes: Theme[];
  mineBoard: MineTile[];
  currentTurn: number;
  onRevealTile: (index: number) => MineRevealResult | null;
  onTaskTrigger: (data: TaskEventData) => void;
  onBombTrigger: () => void;
  onEndTurn: () => void;
  onBack: () => void;
}

const tileMeta: Record<string, { label: string; emoji: string; bg: string; color: string; border: string }> = {
  bomb: { label: '炸弹', emoji: '💣', bg: '#3A1F1F', color: '#FF453A', border: 'rgba(255,69,58,0.3)' },
  truth: { label: '真心话', emoji: '💬', bg: '#102B3A', color: '#64D2FF', border: 'rgba(100,210,255,0.3)' },
  dare: { label: '大冒险', emoji: '🔥', bg: '#35230A', color: '#FF9F0A', border: 'rgba(255,159,10,0.3)' },
  blank: { label: '空白', emoji: '✓', bg: '#1C1C1E', color: '#666', border: 'rgba(255,255,255,0.05)' },
  theme: { label: '主题', emoji: '✨', bg: '#221634', color: '#BF5AF2', border: 'rgba(191,90,242,0.3)' }
};

export function MineModeView({ players, themes, mineBoard, currentTurn, onRevealTile, onTaskTrigger, onBombTrigger, onEndTurn, onBack }: Props) {
  const activePlayer = players[currentTurn];
  const activeTheme = themes.find(t => t.id === activePlayer.themeId);
  const revealedCount = mineBoard.filter(t => t.revealed).length;
  const remainingCount = mineBoard.length - revealedCount;

  const handleReveal = (index: number) => {
    const result = onRevealTile(index);
    if (!result) return;
    if (navigator.vibrate) navigator.vibrate(result.type === 'bomb' ? [30, 40, 30] : 18);
    if (result.type === 'bomb') { onBombTrigger(); return; }
    if (result.type === 'task') { onTaskTrigger(result.task); return; }
    onEndTurn();
  };

  return (
    <div style={{position:'fixed',inset:0,zIndex:50,background:'#000',display:'flex',flexDirection:'column'}}>
      <div style={{position:'absolute',inset:0,zIndex:0,background:'linear-gradient(135deg, #1a1a2e, #000, #1a1a2e)',opacity:0.6}} />
      <div style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',height:'100%',maxWidth:430,margin:'0 auto',width:'100%'}}>
        <header style={{padding:'48px 16px 8px',display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
          <button onClick={onBack} style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.05)',color:'#fff',fontSize:18,cursor:'pointer'}}>←</button>
          <div style={{flex:1,display:'flex',justifyContent:'center'}}>
            <div style={{padding:6,background:'#1C1C1E',borderRadius:999,display:'flex',alignItems:'center',gap:8,border:'1px solid rgba(255,255,255,0.1)'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:999,background:currentTurn===0?'#0A84FF':'transparent',color:currentTurn===0?'#fff':'#0A84FF',opacity:currentTurn===0?1:0.6,fontSize:12,fontWeight:700}}>
                <span>👨</span><span>男方</span>
              </div>
              <div style={{fontSize:10,fontWeight:700,color:'#666',padding:'0 8px'}}>扫雷</div>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:999,background:currentTurn===1?'#FF375F':'transparent',color:currentTurn===1?'#fff':'#FF375F',opacity:currentTurn===1?1:0.6,fontSize:12,fontWeight:700}}>
                <span>女方</span><span>👩</span>
              </div>
            </div>
          </div>
          <div style={{width:40}} />
        </header>

        <div style={{padding:'12px 16px 8px',flexShrink:0}}>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:20,padding:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:14,fontWeight:500,color:currentTurn===0?'#0A84FF':'#FF375F'}}>{activePlayer.name}回合</div>
              <div style={{fontSize:12,color:'#666',marginTop:4}}>{activeTheme?.name || '未选择主题'}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:24,fontWeight:700,color:'#fff'}}>{remainingCount}</div>
              <div style={{fontSize:10,color:'#666',letterSpacing:1}}>剩余方格</div>
            </div>
          </div>
        </div>

        <div style={{flex:1,minHeight:0,padding:'12px 16px',display:'flex',alignItems:'center'}}>
          <div style={{width:'100%',aspectRatio:'1',display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8}}>
            {mineBoard.map((tile, index) => {
              const meta = tileMeta[tile.type];
              return (
                <button key={index} disabled={tile.revealed} onClick={() => handleReveal(index)}
                  style={{
                    aspectRatio:'1',borderRadius:16,border:`1px solid ${tile.revealed ? meta.border : 'rgba(255,255,255,0.05)'}`,
                    background: tile.revealed ? meta.bg : '#1C1C1E',
                    color: tile.revealed ? meta.color : '#666',
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                    cursor: tile.revealed ? 'default' : 'pointer', transition:'all 0.2s',
                    boxShadow: tile.revealed ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.2)'
                  }}>
                  <span style={{fontSize: tile.revealed ? 24 : 18}}>{tile.revealed ? meta.emoji : ''}</span>
                  <span style={{marginTop:4,fontSize:10,fontWeight:700,opacity:tile.revealed?0.9:0.6}}>{tile.revealed ? meta.label : index + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{margin:'0 16px 16px',borderRadius:28,padding:16,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)',flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#666',marginBottom:12}}>
            <span>已翻开 {revealedCount}</span>
            <span>炸弹由另一方指定任务类型</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {(['truth','dare','theme','blank'] as const).map(type => {
              const meta = tileMeta[type];
              const count = mineBoard.filter(t => t.revealed && t.type === type).length;
              return (
                <div key={type} style={{borderRadius:14,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.05)',padding:8,textAlign:'center'}}>
                  <div style={{fontSize:16,marginBottom:4}}>{meta.emoji}</div>
                  <div style={{fontSize:10,color:'#666'}}>{meta.label}</div>
                  <div style={{fontSize:12,fontWeight:700,color:'#fff',marginTop:4}}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
