"use client";
import { MineTaskChoice, Player } from '../../types';

interface Props {
  isOpen: boolean;
  activePlayer: Player | null;
  selectorPlayer: Player | null;
  onChoose: (choice: MineTaskChoice) => void;
}

const choices = [
  { id: 'truth' as const, title: '真心话', desc: '回答一张真心话', emoji: '💬', bg: '#102B3A', color: '#64D2FF', border: 'rgba(100,210,255,0.25)' },
  { id: 'dare' as const, title: '大冒险', desc: '完成一张大冒险', emoji: '🔥', bg: '#35230A', color: '#FF9F0A', border: 'rgba(255,159,10,0.25)' },
  { id: 'theme' as const, title: '主题任务', desc: '抽取当前主题任务', emoji: '✨', bg: '#221634', color: '#BF5AF2', border: 'rgba(191,90,242,0.25)' }
];

export function MineBombChoiceModal({ isOpen, activePlayer, selectorPlayer, onChoose }: Props) {
  if (!isOpen || !activePlayer || !selectorPlayer) return null;

  return (
    <div style={{position:'fixed',inset:0,zIndex:105,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(12px)'}} />
      <div style={{position:'relative',width:'100%',maxWidth:384,borderRadius:28,background:'#1C1C1E',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)',padding:20}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'#3A1F1F',color:'#FF453A',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,69,58,0.25)',fontSize:28}}>💣</div>
          <div>
            <div style={{fontSize:14,color:'#999'}}>{selectorPlayer.name}指定</div>
            <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>{activePlayer.name}踩到炸弹</div>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {choices.map(item => (
            <button key={item.id} onClick={() => onChoose(item.id)}
              style={{width:'100%',height:76,borderRadius:20,border:`1px solid ${item.border}`,padding:16,display:'flex',alignItems:'center',gap:16,textAlign:'left',background:item.bg,cursor:'pointer'}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{item.emoji}</div>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>{item.title}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',marginTop:4}}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
