"use client";
import { useState, useRef, useEffect, useMemo } from 'react';
import { Player, Theme } from '../../types';

interface Props {
  players: Player[];
  themes: Theme[];
  currentTurn: number;
  onEndTurn: () => void;
  onBack: () => void;
}

const FACE_ROTATIONS = [
  'rotateY(0deg)', 'rotateY(-90deg)', 'rotateY(180deg)', 'rotateY(90deg)',
  'rotateX(-90deg)', 'rotateX(90deg)'
];

function pickRandom(length: number, prev: number | null): number {
  if (length <= 1) return 0;
  let n = Math.floor(Math.random() * length);
  if (n === prev) n = (n + 1 + Math.floor(Math.random() * (length - 1))) % length;
  return n;
}

function WordDice({ title, words, selectedIndex, isRolling, revealed, color }: {
  title: string; words: string[]; selectedIndex: number | null;
  isRolling: boolean; revealed: boolean; color: string;
}) {
  const show = revealed && selectedIndex !== null && !isRolling;
  const faceIndex = show && selectedIndex !== null ? selectedIndex % 6 : 0;
  const transform = isRolling ? undefined : `translateZ(-38px) ${FACE_ROTATIONS[faceIndex]}`;

  const faces = useMemo(() => {
    if (!show || selectedIndex === null || words.length === 0) return ['','','','','',''];
    return Array.from({length:6}, (_, i) => words[(selectedIndex + i - faceIndex + words.length) % words.length]);
  }, [selectedIndex, show, words, faceIndex]);

  const faceStyle = (extraColor: string): React.CSSProperties => ({
    position:'absolute',width:76,height:76,background:'#1C1C1E',border:`1.5px solid ${extraColor}30`,
    borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',
    fontSize:11,fontWeight:700,color:'#fff',textAlign:'center',padding:4,
    boxShadow:`0 0 20px ${extraColor}20 inset`,lineHeight:1.2,wordBreak:'break-word'
  });

  return (
    <div style={{position:'relative',height:92,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',left:0,width:80,textAlign:'right'}}>
        <div style={{fontSize:11,fontWeight:700,color,letterSpacing:1}}>{title}</div>
        <div style={{fontSize:11,color:'#666',marginTop:2}}>{words.length} 面词库</div>
      </div>
      <div style={{perspective:300,width:76,height:76}}>
        <div style={{
          width:76,height:76,position:'relative',transformStyle:'preserve-3d',
          transform: transform || 'translateZ(-38px) rotateX(-20deg) rotateY(-30deg)',
          transition: isRolling ? 'none' : 'transform 0.8s cubic-bezier(0.4,0,0.2,1)',
          animation: isRolling ? 'diceSpin 0.3s linear infinite' : 'none'
        }}>
          <div style={{...faceStyle(color), transform:'translateZ(38px)'}}>{show ? faces[0] : '🎲'}</div>
          <div style={{...faceStyle(color), transform:'rotateY(90deg) translateZ(38px)'}}>{show ? faces[1] : '🎲'}</div>
          <div style={{...faceStyle(color), transform:'rotateY(180deg) translateZ(38px)'}}>{show ? faces[2] : '🎲'}</div>
          <div style={{...faceStyle(color), transform:'rotateY(-90deg) translateZ(38px)'}}>{show ? faces[3] : '🎲'}</div>
          <div style={{...faceStyle(color), transform:'rotateX(90deg) translateZ(38px)'}}>{show ? faces[4] : '🎲'}</div>
          <div style={{...faceStyle(color), transform:'rotateX(-90deg) translateZ(38px)'}}>{show ? faces[5] : '🎲'}</div>
        </div>
      </div>
    </div>
  );
}

export function DiceModeView({ players, themes, currentTurn, onEndTurn, onBack }: Props) {
  const actionTheme = themes.find(t => t.id === players[0]?.themeId);
  const bodyTheme = themes.find(t => t.id === players[1]?.themeId);
  const actionWords = useMemo(() => actionTheme?.tasks || [], [actionTheme]);
  const bodyWords = useMemo(() => bodyTheme?.tasks || [], [bodyTheme]);
  const activePlayer = players[currentTurn] || players[0];
  const [rollingPart, setRollingPart] = useState<string | null>(null);
  const [sequenceActive, setSequenceActive] = useState(false);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [bodyIndex, setBodyIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState({ action: false, body: false });
  const timersRef = useRef<number[]>([]);

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const queueTimer = (cb: () => void, delay: number) => {
    const id = window.setTimeout(cb, delay);
    timersRef.current.push(id);
  };

  const handleRoll = () => {
    if (sequenceActive) return;
    if (actionWords.length === 0 || bodyWords.length === 0) { alert('骰子词库为空'); return; }
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    const nextAction = pickRandom(actionWords.length, actionIndex);
    const nextBody = pickRandom(bodyWords.length, bodyIndex);
    setRevealed({ action: false, body: false });
    setSequenceActive(true);
    setRollingPart('action');
    if (navigator.vibrate) navigator.vibrate(20);
    queueTimer(() => {
      setActionIndex(nextAction);
      setRevealed(p => ({...p, action: true}));
      setRollingPart(null);
      queueTimer(() => {
        setRollingPart('body');
        if (navigator.vibrate) navigator.vibrate(15);
        queueTimer(() => {
          setBodyIndex(nextBody);
          setRevealed(p => ({...p, body: true}));
          setRollingPart(null);
          queueTimer(() => { onEndTurn(); setSequenceActive(false); }, 900);
        }, 850);
      }, 450);
    }, 850);
  };

  const actionResult = actionIndex !== null ? actionWords[actionIndex] : null;
  const bodyResult = bodyIndex !== null ? bodyWords[bodyIndex] : null;
  const hasResult = revealed.action && revealed.body && actionResult && bodyResult;
  const hasActionOnly = revealed.action && !revealed.body && actionResult;
  const canRoll = actionWords.length > 0 && bodyWords.length > 0;

  const btnLabel = rollingPart === 'action' ? '上骰子旋转中' : rollingPart === 'body' ? '下骰子旋转中' :
    sequenceActive && hasActionOnly ? '等待下骰子' : sequenceActive && hasResult ? '切换回合中' : `${activePlayer.name}掷骰子`;

  return (
    <div style={{paddingTop:'50px',overflowY:'auto',overflowX:'hidden',position:'fixed',inset:0,zIndex:50,background:'#000',display:'flex',flexDirection:'column'}}>
      <div style={{position:'absolute',inset:0,zIndex:0,background:'linear-gradient(135deg, #1a1a2e, #000, #1a1a2e)',opacity:0.6}} />
      <div style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',height:'100%',maxWidth:430,margin:'0 auto',width:'100%'}}>
        <header style={{padding:'16px 16px 8px',display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
          <button onClick={onBack} style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.05)',color:'#fff',fontSize:18,cursor:'pointer'}}>←</button>
          <div style={{flex:1,display:'flex',justifyContent:'center'}}>
            <div style={{padding:6,background:'#1C1C1E',borderRadius:999,display:'flex',alignItems:'center',gap:8,border:'1px solid rgba(255,255,255,0.1)'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:999,background:currentTurn===0?'#0A84FF':'transparent',color:currentTurn===0?'#fff':'#0A84FF',opacity:currentTurn===0?1:0.6,fontSize:12,fontWeight:700}}>
                <span>👨</span><span>男方</span>
              </div>
              <div style={{fontSize:10,fontWeight:700,color:'#666',padding:'0 4px'}}>🎲 骰子</div>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:999,background:currentTurn===1?'#FF375F':'transparent',color:currentTurn===1?'#fff':'#FF375F',opacity:currentTurn===1?1:0.6,fontSize:12,fontWeight:700}}>
                <span>女方</span><span>👩</span>
              </div>
            </div>
          </div>
          <div style={{width:40}} />
        </header>

        <div style={{flex:1,minHeight:0,padding:'12px 20px',display:'flex',flexDirection:'column',gap:12,overflow:'hidden'}}>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:20,padding:12,flexShrink:0}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{borderRadius:16,background:'rgba(0,0,0,0.2)',border:'1px solid rgba(255,255,255,0.05)',padding:'8px 12px'}}>
                <div style={{fontSize:10,color:'#FF9F0A',fontWeight:700}}>上骰子</div>
                <div style={{fontSize:14,color:'#fff',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{actionTheme?.name || '未选择动作主题'}</div>
              </div>
              <div style={{borderRadius:16,background:'rgba(0,0,0,0.2)',border:'1px solid rgba(255,255,255,0.05)',padding:'8px 12px'}}>
                <div style={{fontSize:10,color:'#64D2FF',fontWeight:700}}>下骰子</div>
                <div style={{fontSize:14,color:'#fff',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bodyTheme?.name || '未选择部位主题'}</div>
              </div>
            </div>
          </div>

          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:20,padding:16,flex:1,minHeight:226,display:'flex',flexDirection:'column',justifyContent:'center',gap:20}}>
            <WordDice title="上骰子" words={actionWords} selectedIndex={actionIndex} isRolling={rollingPart==='action'} revealed={revealed.action} color="#FF9F0A" />
            <div style={{height:1,background:'rgba(255,255,255,0.1)'}} />
            <WordDice title="下骰子" words={bodyWords} selectedIndex={bodyIndex} isRolling={rollingPart==='body'} revealed={revealed.body} color="#64D2FF" />
          </div>

          <div style={{height:148,flexShrink:0,borderRadius:24,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',padding:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
            {hasResult ? (
              <>
                <div style={{fontSize:12,color:'#30D158',fontWeight:600,marginBottom:8}}>✓ {activePlayer.name}结果</div>
                <div style={{fontSize:28,fontWeight:900,color:'#fff',lineHeight:1.2}}>{actionResult}</div>
                <div style={{fontSize:10,color:'#666',margin:'4px 0'}}>TO</div>
                <div style={{fontSize:24,fontWeight:900,color:'#fff',lineHeight:1.2}}>{bodyResult}</div>
              </>
            ) : hasActionOnly ? (
              <>
                <div style={{fontSize:12,color:'#FF9F0A',fontWeight:600,marginBottom:8}}>🎲 上骰子结果</div>
                <div style={{fontSize:28,fontWeight:900,color:'#fff',lineHeight:1.2}}>{actionResult}</div>
                <div style={{fontSize:12,color:'#666',marginTop:8}}>下骰子准备中</div>
              </>
            ) : (
              <>
                <div style={{fontSize:22,marginBottom:8}}>✨</div>
                <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>{activePlayer.name}回合</div>
                <div style={{fontSize:12,color:'#666',marginTop:4}}>点击下方按钮生成动作和部位</div>
              </>
            )}
          </div>
        </div>

        <button onClick={handleRoll} disabled={!canRoll || sequenceActive}
          style={{margin:'0 16px 16px',height:48,borderRadius:999,background:'#fff',color:'#000',fontWeight:600,fontSize:16,border:'none',cursor:canRoll&&!sequenceActive?'pointer':'not-allowed',opacity:canRoll&&!sequenceActive?1:0.4,display:'flex',alignItems:'center',justifyContent:'center',gap:8,flexShrink:0,boxShadow:'0 10px 15px -3px rgba(0,0,0,0.3)'}}>
          <span style={{display:'inline-block',animation:rollingPart?'spin 0.5s linear infinite':'none'}}>🔄</span>
          <span>{btnLabel}</span>
        </button>
      </div>
    </div>
  );
}
