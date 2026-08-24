import { useEffect, useRef, useState } from 'react';

interface DiceProps {
  isRolling: boolean;
  result: number | null;
  onRollComplete?: () => void;
}

// 真实骰子的点数排列
const DiceFace = ({ value }: { value: number }) => {
  const dotPositions: Record<number, string[]> = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const positions = dotPositions[value] || [];

  const getStyle = (pos: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      backgroundColor: '#1a1a1a',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
    };
    switch (pos) {
      case 'top-left': return { ...base, top: '18%', left: '18%' };
      case 'top-right': return { ...base, top: '18%', right: '18%' };
      case 'middle-left': return { ...base, top: '50%', left: '18%', transform: 'translateY(-50%)' };
      case 'middle-right': return { ...base, top: '50%', right: '18%', transform: 'translateY(-50%)' };
      case 'bottom-left': return { ...base, bottom: '18%', left: '18%' };
      case 'bottom-right': return { ...base, bottom: '18%', right: '18%' };
      case 'center': return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default: return base;
    }
  };

  return (
    <>
      {positions.map((pos, i) => (
        <div key={i} style={getStyle(pos)} />
      ))}
    </>
  );
};

// 摇骰子音效
const playRollSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    
    // 模拟骰子摇晃的声音（多次短促的噪声）
    const playShake = (time: number, freq: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, time);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.05);
      
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 1;
      
      gainNode.gain.setValueAtTime(0.15, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(time);
      oscillator.stop(time + 0.08);
    };

    const now = ctx.currentTime;
    // 多次摇晃声
    for (let i = 0; i < 8; i++) {
      playShake(now + i * 0.1, 100 + Math.random() * 200);
    }
    
    // 最后落地声
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 150;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }, 800);
    
  } catch (e) {
    console.log('音效播放失败', e);
  }
};

export function Dice({ isRolling, result, onRollComplete }: DiceProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [bounce, setBounce] = useState(false);
  const onRollCompleteRef = useRef(onRollComplete);
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    onRollCompleteRef.current = onRollComplete;
  }, [onRollComplete]);

  useEffect(() => {
    if (isRolling) {
      soundPlayedRef.current = false;
      // 摇骰子时快速旋转
      const interval = setInterval(() => {
        setRotation({
          x: Math.random() * 720,
          y: Math.random() * 720
        });
      }, 100);
      
      // 播放音效
      if (!soundPlayedRef.current) {
        playRollSound();
        soundPlayedRef.current = true;
      }
      
      return () => clearInterval(interval);
    } else if (result) {
      // 停止时显示对应点数的面
      const finalRotations: Record<number, { x: number; y: number }> = {
        1: { x: 0, y: 0 },
        2: { x: -90, y: 0 },
        3: { x: 0, y: -90 },
        4: { x: 0, y: 90 },
        5: { x: 90, y: 0 },
        6: { x: 0, y: 180 },
      };
      setRotation(finalRotations[result] || { x: 0, y: 0 });
      setBounce(true);
      setTimeout(() => setBounce(false), 300);
      
      const timer = setTimeout(() => {
        onRollCompleteRef.current?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isRolling, result]);

  const cubeSize = 70;
  const halfSize = cubeSize / 2;

  const faceStyle = (transform: string): React.CSSProperties => ({
    position: 'absolute',
    width: `${cubeSize}px`,
    height: `${cubeSize}px`,
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1), inset 0 -2px 4px rgba(0,0,0,0.05)',
    transform,
    backfaceVisibility: 'hidden'
  });

  return (
    <div style={{
      width: `${cubeSize + 20}px`,
      height: `${cubeSize + 20}px`,
      perspective: '600px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: `${cubeSize}px`,
        height: `${cubeSize}px`,
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${bounce ? 'translateY(-10px)' : 'translateY(0)'}`,
        transition: isRolling ? 'transform 0.1s linear' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: isRolling ? 'blur(1px)' : 'none'
      }}>
        {/* 前面 - 1点 */}
        <div style={faceStyle(`translateZ(${halfSize}px)`)}>
          <DiceFace value={1} />
        </div>
        {/* 后面 - 6点 */}
        <div style={faceStyle(`rotateY(180deg) translateZ(${halfSize}px)`)}>
          <DiceFace value={6} />
        </div>
        {/* 右面 - 3点 */}
        <div style={faceStyle(`rotateY(90deg) translateZ(${halfSize}px)`)}>
          <DiceFace value={3} />
        </div>
        {/* 左面 - 4点 */}
        <div style={faceStyle(`rotateY(-90deg) translateZ(${halfSize}px)`)}>
          <DiceFace value={4} />
        </div>
        {/* 上面 - 2点 */}
        <div style={faceStyle(`rotateX(90deg) translateZ(${halfSize}px)`)}>
          <DiceFace value={2} />
        </div>
        {/* 下面 - 5点 */}
        <div style={faceStyle(`rotateX(-90deg) translateZ(${halfSize}px)`)}>
          <DiceFace value={5} />
        </div>
      </div>
      {/* 骰子阴影 */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        width: '50px',
        height: '8px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '50%',
        filter: 'blur(4px)',
        transform: bounce ? 'scale(0.7)' : 'scale(1)',
        transition: 'transform 0.3s ease'
      }} />
    </div>
  );
}
