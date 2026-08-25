"use client";
import { Player } from '../../types';
import { POSE_IMAGES } from '../../data/poseImages';

interface Props {
  players: Player[];
  currentTurn: number;
  onPoseTrigger: (imageSrc: string) => void;
  onBack: () => void;
}

export function PoseModeView({ players, currentTurn, onPoseTrigger, onBack }: Props) {
  const activePlayer = players[currentTurn];

  const handleDraw = () => {
    if (POSE_IMAGES.length === 0) { alert('暂无姿势图片'); return; }
    const imageSrc = POSE_IMAGES[Math.floor(Math.random() * POSE_IMAGES.length)];
    onPoseTrigger(imageSrc);
  };

  return (
    <div style={{paddingTop:'50px',overflowY:'auto',overflowX:'hidden',position:'fixed',inset:0,zIndex:50,background:'#000',display:'flex',flexDirection:'column'}}>
      <div style={{position:'absolute',inset:0,zIndex:0,background:'linear-gradient(135deg, #1a1a2e, #000, #1a1a2e)',opacity:0.6}} />
      <div style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',height:'100%',maxWidth:430,margin:'0 auto',width:'100%'}}>
        <header style={{padding:'48px 16px 8px',display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
          <button onClick={onBack} style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.05)',color:'#fff',fontSize:18,cursor:'pointer'}}>←</button>
          <div style={{flex:1,display:'flex',justifyContent:'center'}}>
            <div style={{padding:6,background:'#1C1C1E',borderRadius:999,display:'flex',alignItems:'center',gap:8,border:'1px solid rgba(255,255,255,0.1)'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:999,background:currentTurn===0?'#0A84FF':'transparent',color:currentTurn===0?'#fff':'#0A84FF',opacity:currentTurn===0?1:0.6,fontSize:12,fontWeight:700}}>
                <span>👨</span><span>男方</span>
              </div>
              <div style={{fontSize:10,fontWeight:700,color:'#666',padding:'0 8px'}}>姿势</div>
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:999,background:currentTurn===1?'#FF375F':'transparent',color:currentTurn===1?'#fff':'#FF375F',opacity:currentTurn===1?1:0.6,fontSize:12,fontWeight:700}}>
                <span>女方</span><span>👩</span>
              </div>
            </div>
          </div>
          <div style={{width:40}} />
        </header>

        <div style={{flex:1,minHeight:0,padding:'24px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:20,padding:20}}>
            <div style={{fontSize:11,color:'#666',fontWeight:700,letterSpacing:2,marginBottom:12}}>当前回合</div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:activePlayer.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:`0 10px 15px -3px ${activePlayer.color}30`}}>
                {activePlayer.id === 0 ? '👨' : '👩'}
              </div>
              <div>
                <div style={{fontSize:24,fontWeight:700,color:'#fff'}}>{activePlayer.name}</div>
                <div style={{fontSize:14,color:'#999',marginTop:4}}>抽取姿势</div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleDraw} style={{margin:'0 16px 16px',height:244,borderRadius:32,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,cursor:'pointer',flexShrink:0}}>
          <div style={{fontSize:14,fontWeight:500,textAlign:'center',marginBottom:24,color:currentTurn===0?'#0A84FF':'#FF375F',animation:'pulse 2s infinite'}}>{activePlayer.name}回合：点击卡牌抽取姿势</div>
          <div style={{width:80,height:80,borderRadius:24,background:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,fontSize:38}}>🖼️</div>
          <div style={{fontSize:28,fontWeight:700,color:'#fff'}}>抽取姿势</div>
          <div style={{fontSize:14,color:'#666',letterSpacing:2,marginTop:12}}>点击抽卡</div>
        </button>
      </div>
    </div>
  );
}
