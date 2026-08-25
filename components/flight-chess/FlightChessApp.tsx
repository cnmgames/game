"use client";

import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { MineTaskChoice, TaskEventData, ThemeMode } from './types';
import { HomeView } from './components/views/HomeView';
import { GameView } from './components/views/GameView';
import { CardModeView } from './components/views/CardModeView';
import { MineModeView } from './components/views/MineModeView';
import { PoseModeView } from './components/views/PoseModeView';
import { DiceModeView } from './components/views/DiceModeView';
import { ThemeSelectorModal } from './components/modals/ThemeSelectorModal';
import { TaskCardModal } from './components/modals/TaskCardModal';
import { MineBombChoiceModal } from './components/modals/MineBombChoiceModal';
import { PoseCardModal } from './components/modals/PoseCardModal';
import { WinModal } from './components/modals/WinModal';
import { ThemeCreateModal } from './components/modals/ThemeCreateModal';
import { ThemesView } from './components/views/ThemesView';
import { ThemeEditorModal } from './components/modals/ThemeEditorModal';
import { AiImportModal } from './components/modals/AiImportModal';

export default function FlightChessApp() {
  const {
    state,
    switchView,
    selectGameMode,
    selectTheme,
    createTheme,
    updateThemeMeta,
    addThemeTask,
    removeThemeTask,
    importThemeTasks,
    startGame,
    drawCardTask,
    revealMineTile,
    chooseMineBombTask,
    movePlayer,
    endTurn,
    setIsRolling,
    checkTile,
    resolveTask,
    resetGame
  } = useGameState();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(0);
  const [taskData, setTaskData] = useState<TaskEventData | null>(null);
  const [isMineBombChoiceOpen, setIsMineBombChoiceOpen] = useState(false);
  const [poseImageSrc, setPoseImageSrc] = useState<string | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [isCreateThemeModalOpen, setIsCreateThemeModalOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [aiImportThemeId, setAiImportThemeId] = useState<string | null>(null);

  const handleSelectTheme = (playerId: number) => {
    setSelectedPlayerId(playerId);
    setIsThemeModalOpen(true);
  };

  const handleThemeSelect = (themeId: string) => {
    selectTheme(selectedPlayerId, themeId);
  };

  const selectedPlayer = state.players.find(p => p.id === selectedPlayerId) || state.players[0];
  const selectedModeForTheme: ThemeMode =
    state.gameMode === 'dice'
      ? selectedPlayerId === 0 ? 'diceAction' : 'diceBody'
      : state.gameMode === 'card' ? 'card'
      : state.gameMode === 'mine' ? 'mineTheme'
      : 'board';
  const selectableThemes = state.themes.filter(
    t => (state.gameMode === 'dice' || t.audience === 'common' || t.audience === selectedPlayer.role)
  );

  const handleStartGame = () => {
    const success = startGame();
    if (!success) {
      if (state.gameMode === 'mine') { alert('请为双方选择题库，并确保题库有任务'); return; }
      if (state.gameMode === 'dice') { alert('请先选择上骰子动作和下骰子部位主题'); return; }
      alert(state.gameMode === 'card' ? '请先为双方选择抽卡题库' : state.gameMode === 'pose' ? '' : '请先为双方选择任务包');
    }
  };

  const handleTaskTrigger = (data: TaskEventData) => setTaskData(data);

  const handleMineBombTrigger = () => setIsMineBombChoiceOpen(true);

  const handleMineBombChoice = (choice: MineTaskChoice) => {
    const task = chooseMineBombTask(choice);
    setIsMineBombChoiceOpen(false);
    if (!task) { alert('当前没有可抽取的题库'); endTurn(); return; }
    setTaskData(task);
  };

  const handleTaskAccept = () => { if (!taskData) return; setTaskData(null); resolveTask(taskData, 'accept'); };
  const handleTaskReject = () => { if (!taskData) return; setTaskData(null); resolveTask(taskData, 'reject'); };
  const handlePoseDone = () => { setPoseImageSrc(null); endTurn(); };
  const handleWin = (id: number) => setWinnerId(id);
  const handleNavigate = (view: 'home' | 'themes') => switchView(view);

  const handleBackFromGame = () => {
    if (confirm('离开游戏？进度不会保存')) {
      setIsMineBombChoiceOpen(false);
      setTaskData(null);
      setPoseImageSrc(null);
      resetGame();
      switchView('home');
    }
  };

  return (
    <div className="flight-chess-app" style={{height:'100vh',width:'100vw',overflow:'hidden',overflowX:'hidden',display:'flex',justifyContent:'center',background:'#000',touchAction:'pan-y',userSelect:'none',WebkitUserSelect:'none',overscrollBehavior:'none'}}>
      <div style={{position:'fixed',inset:0,zIndex:0}}>
        <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg, #1a1a2e, #000, #1a1a2e)',opacity:0.6}} />
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(2px)'}} />
      </div>

      <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:430,height:'100%',display:'flex',flexDirection:'column',background:'rgba(0,0,0,0.2)'}}>
        <header style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,zIndex:1000,paddingTop:24,paddingBottom:8,paddingLeft:16,paddingRight:16,display:'flex',alignItems:'center',gap:8,backgroundColor:'rgba(0,0,0,0.95)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',borderBottom:'1px solid rgba(255,255,255,0.05)',boxSizing:'border-box'}}>
          <div style={{position:'absolute',left:0,right:0,textAlign:'center',pointerEvents:'none'}}>
            <div style={{fontSize:10,fontWeight:600,color:'#666',letterSpacing:2,marginBottom:2}}>Couple&apos;s Game</div>
            <h1 style={{fontSize:22,fontWeight:700,color:'#fff',margin:0,letterSpacing:-0.5,lineHeight:1.2}}>情侣飞行棋</h1>
          </div>
          {state.view === 'home' && (
            <div style={{marginLeft:'auto',flexShrink:0}}>
              <button onClick={() => switchView('themes')}
                style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'999px',color:'rgba(255,255,255,0.85)',fontSize:13,fontWeight:600,cursor:'pointer',padding:'7px 14px',display:'flex',alignItems:'center',gap:4}}>
                📚 题库
              </button>
            </div>
          )}
        </header>

        <main style={{flex:1,minHeight:0,position:'relative',overflow:'hidden'}}>
          <div style={{
            position:'absolute',top:'80px',left:0,right:0,bottom:0,display:'flex',flexDirection:'column',padding:'0 24px 8px',
            transition:'all 0.5s ease-in-out',
            transform: state.view === 'home' ? 'translateX(0)' : 'translateX(-100%)',
            opacity: state.view === 'home' ? 1 : 0,
            pointerEvents: state.view === 'home' ? 'auto' : 'none'
          }}>
            <HomeView
              players={state.players}
              themes={state.themes}
              gameMode={state.gameMode}
              onSelectMode={selectGameMode}
              onSelectTheme={handleSelectTheme}
              onStartGame={handleStartGame}
            />
          </div>

          <div style={{
            position:'absolute',top:'80px',left:0,right:0,bottom:0,display:'flex',flexDirection:'column',minHeight:0,padding:'0 24px',
            transition:'all 0.5s ease-in-out',
            transform: state.view === 'themes' ? 'translateX(0)' : 'translateX(100%)',
            opacity: state.view === 'themes' ? 1 : 0,
            pointerEvents: state.view === 'themes' ? 'auto' : 'none'
          }}>
            <ThemesView
              themes={state.themes}
              onCreateTheme={() => setIsCreateThemeModalOpen(true)}
              onEditTheme={themeId => setEditingThemeId(themeId)}
            />
          </div>
        </main>
      </div>

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        themes={selectableThemes}
        selectedThemeId={selectedPlayer?.themeId || null}
        onSelect={handleThemeSelect}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <TaskCardModal
        isOpen={!!taskData}
        taskData={taskData}
        onAccept={handleTaskAccept}
        onReject={handleTaskReject}
      />

      <MineBombChoiceModal
        isOpen={isMineBombChoiceOpen}
        activePlayer={state.players[state.turn] || null}
        selectorPlayer={state.players[state.turn === 0 ? 1 : 0] || null}
        onChoose={handleMineBombChoice}
      />

      <PoseCardModal
        isOpen={!!poseImageSrc}
        imageSrc={poseImageSrc}
        onAccept={handlePoseDone}
        onReject={handlePoseDone}
      />

      <WinModal
        isOpen={!!winnerId}
        winnerName={winnerId !== null ? state.players[winnerId].name : ''}
        onRestart={() => { resetGame(); setWinnerId(null); }}
      />

      <ThemeCreateModal
        isOpen={isCreateThemeModalOpen}
        onClose={() => setIsCreateThemeModalOpen(false)}
        onCreate={input => {
          const id = createTheme(input);
          setIsCreateThemeModalOpen(false);
          if (id) setEditingThemeId(id);
        }}
      />

      <ThemeEditorModal
        isOpen={!!editingThemeId}
        theme={editingThemeId ? state.themes.find(t => t.id === editingThemeId) || null : null}
        onClose={() => { setEditingThemeId(null); setAiImportThemeId(null); }}
        onSaveMeta={(themeId, patch) => updateThemeMeta(themeId, patch)}
        onAddTask={(themeId, taskText) => addThemeTask(themeId, taskText)}
        onRemoveTask={(themeId, index) => removeThemeTask(themeId, index)}
        onOpenAiImport={themeId => setAiImportThemeId(themeId)}
      />

      <AiImportModal
        isOpen={!!aiImportThemeId}
        themeName={aiImportThemeId ? state.themes.find(t => t.id === aiImportThemeId)?.name || '' : ''}
        onClose={() => setAiImportThemeId(null)}
        onImport={(tasks, mode) => {
          if (!aiImportThemeId) return;
          importThemeTasks(aiImportThemeId, tasks, mode);
        }}
      />

      {state.view === 'game' && (
        <GameView
          players={state.players}
          boardMap={state.boardMap}
          pathCoords={state.pathCoords}
          currentTurn={state.turn}
          isRolling={state.isRolling}
          onMove={movePlayer}
          onCheckTile={checkTile}
          onEndTurn={endTurn}
          onSetRolling={setIsRolling}
          onWin={handleWin}
          onTaskTrigger={handleTaskTrigger}
          onBack={handleBackFromGame}
        />
      )}

      {state.view === 'card' && (
        <CardModeView
          players={state.players}
          themes={state.themes}
          currentTurn={state.turn}
          onDrawTask={drawCardTask}
          onTaskTrigger={handleTaskTrigger}
          onBack={handleBackFromGame}
        />
      )}

      {state.view === 'mine' && (
        <MineModeView
          players={state.players}
          themes={state.themes}
          mineBoard={state.mineBoard}
          currentTurn={state.turn}
          onRevealTile={revealMineTile}
          onTaskTrigger={handleTaskTrigger}
          onBombTrigger={handleMineBombTrigger}
          onEndTurn={endTurn}
          onBack={handleBackFromGame}
        />
      )}

      {state.view === 'pose' && (
        <PoseModeView
          players={state.players}
          currentTurn={state.turn}
          onPoseTrigger={setPoseImageSrc}
          onBack={handleBackFromGame}
        />
      )}

      {state.view === 'dice' && (
        <DiceModeView
          players={state.players}
          themes={state.themes}
          currentTurn={state.turn}
          onEndTurn={endTurn}
          onBack={handleBackFromGame}
        />
      )}
    </div>
  );
}
