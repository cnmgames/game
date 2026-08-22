"use client";

import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { TaskEventData } from './types';
import { HomeView } from './components/views/HomeView';
import { GameView } from './components/views/GameView';
import { ThemeSelectorModal } from './components/modals/ThemeSelectorModal';
import { TaskCardModal } from './components/modals/TaskCardModal';
import { WinModal } from './components/modals/WinModal';
import { ThemeCreateModal } from './components/modals/ThemeCreateModal';
import { ThemesView } from './components/views/ThemesView';
import { ThemeEditorModal } from './components/modals/ThemeEditorModal';
import { AiImportModal } from './components/modals/AiImportModal';

export default function FlightChessApp() {
  const {
    state,
    switchView,
    selectTheme,
    createTheme,
    updateThemeMeta,
    addThemeTask,
    removeThemeTask,
    importThemeTasks,
    startGame,
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
  const selectableThemes = state.themes.filter(
    t => t.audience === 'common' || t.audience === selectedPlayer.role
  );

  const handleStartGame = () => {
    const success = startGame();
    if (!success) {
      alert('请先为双方选择任务包');
    }
  };

  const handleTaskTrigger = (data: TaskEventData) => {
    setTaskData(data);
  };

  const handleTaskAccept = () => {
    if (!taskData) return;
    setTaskData(null);
    resolveTask(taskData, 'accept');
  };

  const handleTaskReject = () => {
    if (!taskData) return;
    setTaskData(null);
    resolveTask(taskData, 'reject');
  };

  const handleWin = (id: number) => {
    setWinnerId(id);
  };

  const handleNavigate = (view: 'home' | 'themes') => {
    switchView(view);
  };

  const handleBackFromGame = () => {
    if (confirm('离开游戏？进度不会保存')) {
      resetGame();
      switchView('home');
    }
  };

  return (
    <div className="flight-chess-app relative min-h-screen w-full bg-black text-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-60" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col bg-black">
        <header className="pt-6 pb-4 px-5 shrink-0 flex items-center justify-between gap-3">
          <a href="/flight-pro" className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-white/80 backdrop-blur transition hover:border-white/25 hover:bg-black/70 hover:text-white shrink-0">
            ← 返回
          </a>
          <div className="text-center flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
              Couple's Game
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight truncate">情侣飞行棋Pro</h1>
          </div>
          {state.view === 'home' && (
            <button
              onClick={() => handleNavigate('themes')}
              style={{
                height: '32px',
                paddingLeft: '14px',
                paddingRight: '14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              题库
            </button>
          )}
          {state.view !== 'home' && <div style={{ width: '64px', flexShrink: 0 }} />}
        </header>

        <main className="flex-1 overflow-auto px-5 py-4">
          {state.view === 'home' && (
            <HomeView
              players={state.players}
              themes={state.themes}
              onSelectTheme={handleSelectTheme}
              onStartGame={handleStartGame}
            />
          )}
          {state.view === 'themes' && (
            <ThemesView
              themes={state.themes}
              onCreateTheme={() => setIsCreateThemeModalOpen(true)}
              onEditTheme={themeId => setEditingThemeId(themeId)}
            />
          )}
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

      <WinModal
        isOpen={!!winnerId}
        winnerName={winnerId !== null ? state.players[winnerId].name : ''}
        onRestart={() => {
          resetGame();
          setWinnerId(null);
        }}
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
        onClose={() => {
          setEditingThemeId(null);
          setAiImportThemeId(null);
        }}
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
    </div>
  );
}

