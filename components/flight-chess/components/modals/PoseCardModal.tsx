"use client";
import { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  imageSrc: string | null;
  onAccept: () => void;
  onReject: () => void;
}

export function PoseCardModal({ isOpen, imageSrc, onAccept, onReject }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [visibleSrc, setVisibleSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && imageSrc) {
      setVisibleSrc(imageSrc);
      setIsFlipped(false);
      document.body.style.overflow = 'hidden';
    } else {
      setVisibleSrc(null);
      setIsFlipped(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, imageSrc]);

  if (!isOpen || !visibleSrc) return null;

  return (
    <div style={{position:'fixed',inset:0,zIndex:110,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(12px)'}} />
      <div style={{position:'relative',width:'100%',maxWidth:384,height:560,maxHeight:'82vh',perspective:1000}}>
        <div style={{position:'relative',width:'100%',height:'100%',transition:'transform 0.6s',transformStyle:'preserve-3d',transform:isFlipped?'rotateY(180deg)':'rotateY(0)'}}>
          {/* 正面 */}
          <div onClick={() => setIsFlipped(true)}
            style={{position:'absolute',inset:0,backfaceVisibility:'hidden',background:'#1C1C1E',border:'1px solid rgba(255,255,255,0.1)',borderRadius:28,padding:24,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)',cursor:'pointer'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24,animation:'pulse 2s infinite',fontSize:40}}>🖼️</div>
            <h3 style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:8}}>姿势卡牌</h3>
            <p style={{fontSize:14,color:'#666',letterSpacing:2}}>点击翻转查看姿势</p>
          </div>
          {/* 背面 */}
          <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',transform:'rotateY(180deg)',background:'#1C1C1E',border:'1px solid rgba(255,255,255,0.1)',borderRadius:28,padding:20,display:'flex',flexDirection:'column',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)'}}>
            <h3 style={{fontSize:20,fontWeight:700,color:'#fff',textAlign:'center',marginBottom:20}}>姿势图示</h3>
            <div style={{flex:1,minHeight:0,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
              <img src={visibleSrc} alt="随机姿势" style={{maxWidth:'100%',maxHeight:'100%',borderRadius:16,objectFit:'contain'}}
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <div style={{display:'flex',gap:12}}>
              <button onClick={onReject} style={{flex:1,height:48,borderRadius:999,background:'#3A3A3C',color:'#FF453A',fontWeight:700,fontSize:14,border:'none',cursor:'pointer'}}>跳过姿势</button>
              <button onClick={onAccept} style={{flex:1,height:48,borderRadius:999,background:'#fff',color:'#000',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',boxShadow:'0 10px 15px -3px rgba(0,0,0,0.3)'}}>确认姿势</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
