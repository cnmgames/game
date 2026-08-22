import { TileType, PathCoord, Player } from '../types';
import { Sparkles, Bomb, Trophy, User, UserRound } from 'lucide-react';

interface GameBoardProps {
  boardMap: TileType[];
  pathCoords: PathCoord[];
  players: Player[];
  currentTurn: number;
}

export function GameBoard({ boardMap, pathCoords, players, currentTurn }: GameBoardProps) {
  const coordToIndex: Record<string, number> = {};
  pathCoords.forEach((coord, idx) => {
    coordToIndex[`${coord.r},${coord.c}`] = idx;
  });

  const getTileColor = (idx: number, type: TileType) => {
    if (idx === 0) return 'rgba(255,255,255,0.1)';
    if (idx === 48) return '#FFFFFF';
    if (type === 'lucky') return 'rgba(255,55,95,0.2)';
    if (type === 'trap') return 'rgba(191,90,242,0.2)';
    return '#2C2C2E';
  };

  const getTileBorder = (idx: number) => {
    if (idx === 0) return '1px solid rgba(255,255,255,0.2)';
    if (idx === 48) return 'none';
    return 'none';
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '340px',
      aspectRatio: '1 / 1',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'repeat(7, 1fr)',
        gap: '6px'
      }}>
        {Array.from({ length: 49 }).map((_, idx) => {
          const coord = pathCoords[idx];
          if (!coord) return <div key={idx} />;
          const type = boardMap[idx];
          const isStart = idx === 0;
          const isEnd = idx === 48;
          
          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getTileColor(idx, type),
                border: getTileBorder(idx),
                boxShadow: isEnd ? '0 4px 12px rgba(255,255,255,0.2)' : 'none'
              }}
            >
              {isStart && <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)' }}>START</span>}
              {isEnd && <Trophy style={{ color: '#FFD700' }} size={16} />}
              {!isStart && !isEnd && type === 'lucky' && <Sparkles style={{ color: '#FF375F' }} size={12} fill="currentColor" />}
              {!isStart && !isEnd && type === 'trap' && <Bomb style={{ color: '#BF5AF2' }} size={12} />}
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {players.map((player, pIdx) => {
          const coord = pathCoords[player.step];
          if (!coord) return null;
          const cellSize = 100 / 7;
          const gapPercent = (6 * 6) / 340 * 100;
          const left = (coord.c / 7) * 100 + (cellSize / 2);
          const top = (coord.r / 7) * 100 + (cellSize / 2);
          
          return (
            <div
              key={player.id}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                transform: `translate(-50%, -50%) translate(${pIdx * 8 - 4}px, ${pIdx * 8 - 4}px)`,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: player.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 8px ${player.color}80`,
                border: '2px solid white',
                zIndex: pIdx === currentTurn ? 10 : 5,
                transition: 'all 0.3s ease'
              }}
            >
              {pIdx === 0 ? <User size={12} color="white" /> : <UserRound size={12} color="white" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
