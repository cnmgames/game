"use client";
import { useState, useCallback } from 'react';
import { Player, PathCoord, TileType, TaskEventData } from '../../types';
import { GameBoard } from '../GameBoard';
import { Dice } from '../Dice';
import { calculateNewPosition, rollDice } from '../../utils/gameLogic';
import { User, UserRound, ArrowLeft } from 'lucide-react';

interface GameViewProps {
  players: Player[];
  boardMap: TileType[];
  pathCoords: PathCoord[];
  currentTurn: number;
  isRolling: boolean;
  onMove: (steps: number) => void;
  onCheckTile: (landingStep: number) => TaskEventData | 'win' | null;
  onEndTurn: () => void;
  onSetRolling: (rolling: boolean) => void;
  onWin: (winnerId: number) => void;
  onTaskTrigger: (data: TaskEventData) => void;
  onBack: () => void;
}

export function GameView({
  players,
  boardMap,
  pathCoords,
  currentTurn,
  isRolling,
  onMove,
  onCheckTile,
  onEndTurn,
  onSetRolling,
  onWin,
  onTaskTrigger,
  onBack
}: GameViewProps) {
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const handleRoll = useCallback(() => {
    if (isRolling || isMoving || diceResult) return;

    onSetRolling(true);
    const result = rollDice();

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }

    setTimeout(() => {
      setDiceResult(result);
      onSetRolling(false);
    }, 1000);
  }, [isRolling, isMoving, diceResult, onSetRolling]);

  const handleRollComplete = useCallback(() => {
    if (diceResult) {
      const landingStep = calculateNewPosition(players[currentTurn].step, diceResult);
      setIsMoving(true);

      const moveDelayMs = 220;
      let movedSteps = 0;

      const stepOnce = () => {
        onMove(1);
        movedSteps += 1;

        if (movedSteps < diceResult) {
          setTimeout(stepOnce, moveDelayMs);
          return;
        }

        setTimeout(() => {
          const tileCheck = onCheckTile(landingStep);

          if (tileCheck === 'win') {
            onWin(currentTurn);
          } else if (tileCheck) {
            onTaskTrigger(tileCheck);
          } else {
            onEndTurn();
          }

          setDiceResult(null);
          setIsMoving(false);
        }, moveDelayMs);
      };

      setTimeout(stepOnce, moveDelayMs);
    }
  }, [diceResult, players, currentTurn, onMove, onCheckTile, onWin, onTaskTrigger, onEndTurn]);

  const activePlayer = players[currentTurn];
  const turnNumber = Math.floor(Math.max(...players.map(p => p.step)) / 4) + 1;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)',
        opacity: 0.6
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        maxWidth: '430px',
        margin: '0 auto'
      }}>
        <div style={{
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingBottom: '8px',
          paddingLeft: '16px',
          paddingRight: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 20
        }}>
          <button
            onClick={onBack}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <ArrowLeft style={{ color: 'white' }} size={20} />
          </button>
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              padding: '6px',
              backgroundColor: '#1C1C1E',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                borderRadius: '999px',
                backgroundColor: currentTurn === 0 ? '#0A84FF' : 'transparent',
                color: currentTurn === 0 ? 'white' : '#0A84FF',
                opacity: currentTurn === 0 ? 1 : 0.6,
                transition: 'all 0.3s ease'
              }}>
                <User size={14} />
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>男方</span>
              </div>
              <div style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                paddingLeft: '8px',
                paddingRight: '8px'
              }}>
                Turn {turnNumber}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                borderRadius: '999px',
                backgroundColor: currentTurn === 1 ? '#FF375F' : 'transparent',
                color: currentTurn === 1 ? 'white' : '#FF375F',
                opacity: currentTurn === 1 ? 1 : 0.6,
                transition: 'all 0.3s ease'
              }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>女方</span>
                <UserRound size={14} />
              </div>
            </div>
          </div>
          <div style={{ width: '40px', flexShrink: 0 }} />
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '16px',
          paddingRight: '16px',
          minHeight: 0
        }}>
          <GameBoard
            boardMap={boardMap}
            pathCoords={pathCoords}
            players={players}
            currentTurn={currentTurn}
          />
        </div>

        <div style={{
          height: '200px',
          width: '100%',
          backgroundColor: 'rgba(28,28,30,0.75)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '20px',
          paddingBottom: '20px',
          paddingLeft: '24px',
          paddingRight: '24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
          flexShrink: 0
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '16px',
            textAlign: 'center',
            color: currentTurn === 0 ? '#0A84FF' : '#FF375F',
            animation: 'pulse 2s infinite'
          }}>
            {activePlayer.name}回合：点击骰子
          </div>
          <div onClick={handleRoll} style={{ cursor: 'pointer' }}>
            <Dice
              isRolling={isRolling}
              result={diceResult}
              onRollComplete={handleRollComplete}
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
