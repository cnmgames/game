import { useState, useEffect, useCallback } from 'react';
import {
  GameMode,
  GameState,
  MineRevealResult,
  MineTaskChoice,
  Player,
  TaskEventData,
  Theme,
} from '../types';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import { generateSpiralPath, generateBoardMap, calculateNewPosition, generateMineBoard } from '../utils/gameLogic';
import { DEFAULT_THEMES } from '../data/defaultThemes';

const STORAGE_KEY = 'couples-ludo-game-state';

const initialPlayers: Player[] = [
  { id: 0, name: '男方', color: '#0A84FF', role: 'male', step: 0, themeId: null },
  { id: 1, name: '女方', color: '#FF375F', role: 'female', step: 0, themeId: null }
];

function normalizePlayers(input: any): Player[] {
  const incoming = Array.isArray(input) ? input : [];
  return initialPlayers.map(base => {
    const found = incoming.find((p: any) => p && p.id === base.id);
    const r = found || {};
    return {
      id: base.id,
      name: typeof r.name === 'string' ? r.name : base.name,
      color: typeof r.color === 'string' ? r.color : base.color,
      role: r.role === 'male' || r.role === 'female' ? r.role : base.role,
      step: typeof r.step === 'number' ? r.step : 0,
      themeId: typeof r.themeId === 'string' || r.themeId === null ? r.themeId : null
    };
  });
}

function normalizeThemes(input: any): Theme[] {
  const incoming = Array.isArray(input) ? input : [];
  const source = incoming.length > 0 ? [...incoming, ...DEFAULT_THEMES] : DEFAULT_THEMES;
  const seen = new Set<string>();
  const result: Theme[] = [];
  for (const t of source) {
    if (!t || typeof t !== 'object') continue;
    const id = typeof t.id === 'string' ? t.id : `theme_${Date.now()}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const tasks = Array.isArray(t.tasks) ? t.tasks.filter((x: any) => typeof x === 'string') : [];
    const isDefault = DEFAULT_THEMES.some(dt => dt.id === id);
    if (isDefault) {
      const def = DEFAULT_THEMES.find(dt => dt.id === id)!;
      result.push({ ...def, tasks: tasks.length > 0 ? tasks : def.tasks });
    } else {
      result.push({
        id,
        name: typeof t.name === 'string' ? t.name : '未命名主题',
        desc: typeof t.desc === 'string' ? t.desc : '',
        audience: t.audience === 'male' || t.audience === 'female' ? t.audience : 'common',
        tasks
      });
    }
  }
  return result;
}

function normalizeGameState(saved: any): GameState | null {
  if (!saved || typeof saved !== 'object') return null;
  const themes = normalizeThemes(saved.themes);
  const players = normalizePlayers(saved.players).map(p => {
    if (p.themeId === null) return p;
    const theme = themes.find(t => t.id === p.themeId);
    if (!theme) return { ...p, themeId: null };
    if (theme.audience !== 'common' && theme.audience !== p.role) return { ...p, themeId: null };
    return p;
  });

  const validViews = ['home', 'game', 'card', 'pose', 'mine', 'dice', 'themes'];
  const validModes: GameMode[] = ['board', 'card', 'pose', 'mine', 'dice'];

  return {
    view: validViews.includes(saved.view) ? saved.view : 'home',
    gameMode: validModes.includes(saved.gameMode) ? saved.gameMode : 'board',
    turn: saved.turn === 0 || saved.turn === 1 ? saved.turn : 0,
    players,
    themes,
    boardMap: Array.isArray(saved.boardMap) ? saved.boardMap : generateBoardMap(),
    pathCoords: Array.isArray(saved.pathCoords) ? saved.pathCoords : generateSpiralPath(),
    mineBoard: Array.isArray(saved.mineBoard) && saved.mineBoard.length === 36 ? saved.mineBoard : generateMineBoard(),
    isRolling: !!saved.isRolling
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadFromStorage<GameState | null>(STORAGE_KEY, null);
    const normalized = normalizeGameState(saved);
    if (normalized) return normalized;
    return {
      view: 'home',
      gameMode: 'board',
      turn: 0,
      players: initialPlayers,
      themes: DEFAULT_THEMES,
      boardMap: generateBoardMap(),
      pathCoords: generateSpiralPath(),
      mineBoard: generateMineBoard(),
      isRolling: false
    };
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEY, state);
  }, [state]);

  const switchView = useCallback((view: GameState['view']) => {
    setState(prev => ({ ...prev, view }));
  }, []);

  const selectGameMode = useCallback((mode: GameMode) => {
    setState(prev => ({
      ...prev,
      gameMode: mode,
      players: mode === prev.gameMode ? prev.players : prev.players.map(p => ({ ...p, themeId: null }))
    }));
  }, []);

  const selectTheme = useCallback((playerId: number, themeId: string) => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === playerId ? { ...p, themeId } : p)
    }));
  }, []);

  const createTheme = useCallback((input: { name: string; desc?: string; audience: Theme['audience'] }) => {
    const name = input.name.trim();
    if (!name) return null;
    let createdId: string | null = null;
    setState(prev => {
      const id = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      createdId = id;
      return {
        ...prev,
        themes: [...prev.themes, { id, name, desc: (input.desc || '').trim(), audience: input.audience, tasks: [] }]
      };
    });
    return createdId;
  }, []);

  const updateThemeMeta = useCallback((themeId: string, patch: Partial<Pick<Theme, 'name' | 'desc' | 'audience'>>) => {
    setState(prev => ({
      ...prev,
      themes: prev.themes.map(t => {
        if (t.id !== themeId) return t;
        return {
          ...t,
          name: typeof patch.name === 'string' ? patch.name.trim() : t.name,
          desc: typeof patch.desc === 'string' ? patch.desc.trim() : t.desc,
          audience: patch.audience || t.audience
        };
      })
    }));
  }, []);

  const addThemeTask = useCallback((themeId: string, taskText: string) => {
    const text = taskText.trim();
    if (!text) return;
    setState(prev => ({
      ...prev,
      themes: prev.themes.map(t => {
        if (t.id !== themeId) return t;
        if (t.tasks.includes(text)) return t;
        return { ...t, tasks: [...t.tasks, text] };
      })
    }));
  }, []);

  const removeThemeTask = useCallback((themeId: string, index: number) => {
    setState(prev => ({
      ...prev,
      themes: prev.themes.map(t => {
        if (t.id !== themeId) return t;
        return { ...t, tasks: t.tasks.filter((_, i) => i !== index) };
      })
    }));
  }, []);

  const importThemeTasks = useCallback((themeId: string, tasks: string[], mode: 'append' | 'replace' = 'append') => {
    const cleaned = tasks.map(t => t.trim()).filter(Boolean);
    if (cleaned.length === 0) return;
    setState(prev => ({
      ...prev,
      themes: prev.themes.map(t => {
        if (t.id !== themeId) return t;
        const base = mode === 'replace' ? [] : t.tasks;
        const merged = Array.from(new Set([...base, ...cleaned]));
        return { ...t, tasks: merged };
      })
    }));
  }, []);

  const startGame = useCallback(() => {
    const mode = state.gameMode;
    if (mode !== 'pose') {
      for (const player of state.players) {
        if (!player.themeId) return false;
        const theme = state.themes.find(t => t.id === player.themeId);
        if (!theme || theme.tasks.length === 0) return false;
      }
    }
    setState(prev => ({
      ...prev,
      view: mode === 'dice' ? 'dice' : mode === 'pose' ? 'pose' : mode === 'card' ? 'card' : mode === 'mine' ? 'mine' : 'game',
      turn: Math.random() < 0.5 ? 0 : 1,
      players: prev.players.map(p => ({ ...p, step: 0 })),
      boardMap: generateBoardMap(),
      pathCoords: generateSpiralPath(),
      mineBoard: generateMineBoard(),
      isRolling: false
    }));
    return true;
  }, [state.gameMode, state.players, state.themes]);

  const drawCardTask = useCallback((): TaskEventData | null => {
    const player = state.players[state.turn];
    if (!player?.themeId) return null;
    const theme = state.themes.find(t => t.id === player.themeId);
    if (!theme || theme.tasks.length === 0) return null;
    const task = theme.tasks[Math.floor(Math.random() * theme.tasks.length)];
    return {
      type: 'card',
      initiatorPlayerId: player.id,
      executorPlayerId: player.id,
      title: '任务卡牌',
      subtitle: `任务来自「${theme.name}」`,
      icon: '✨',
      color: player.role === 'male' ? '#0A84FF' : '#FF375F',
      task,
      taskSourceId: theme.id
    };
  }, [state.players, state.themes, state.turn]);

  const revealMineTile = useCallback((index: number): MineRevealResult | null => {
    const tile = state.mineBoard[index];
    const activePlayer = state.players[state.turn];
    if (!tile || tile.revealed || !activePlayer) return null;

    setState(prev => ({
      ...prev,
      mineBoard: prev.mineBoard.map((item, i) => i === index ? { ...item, revealed: true } : item)
    }));

    if (tile.type === 'bomb') return { type: 'bomb' };
    if (tile.type === 'blank') return { type: 'blank' };

    const theme = state.themes.find(t => t.id === activePlayer.themeId);
    if (!theme || theme.tasks.length === 0) return { type: 'blank' };
    const task = theme.tasks[Math.floor(Math.random() * theme.tasks.length)];

    const typeMap: Record<string, TaskEventData['type']> = {
      truth: 'mineTruth', dare: 'mineDare', theme: 'mineTheme'
    };
    const titleMap: Record<string, string> = {
      truth: '真心话', dare: '大冒险', theme: '主题任务'
    };
    const iconMap: Record<string, string> = {
      truth: '💬', dare: '🔥', theme: '✨'
    };
    const colorMap: Record<string, string> = {
      truth: '#64D2FF', dare: '#FF9F0A', theme: '#BF5AF2'
    };

    return {
      type: 'task',
      task: {
        type: typeMap[tile.type],
        initiatorPlayerId: activePlayer.id,
        executorPlayerId: activePlayer.id,
        title: titleMap[tile.type],
        subtitle: `任务来自「${theme.name}」`,
        icon: iconMap[tile.type],
        color: colorMap[tile.type],
        task,
        taskSourceId: theme.id
      }
    };
  }, [state.mineBoard, state.players, state.themes, state.turn]);

  const chooseMineBombTask = useCallback((choice: MineTaskChoice): TaskEventData | null => {
    const activePlayer = state.players[state.turn];
    const opponent = state.players[state.turn === 0 ? 1 : 0];
    if (!activePlayer || !opponent) return null;

    const theme = state.themes.find(t => t.id === activePlayer.themeId);
    if (!theme || theme.tasks.length === 0) return null;
    const task = theme.tasks[Math.floor(Math.random() * theme.tasks.length)];

    const titleMap: Record<string, string> = { truth: '真心话', dare: '大冒险', theme: '主题任务' };
    const iconMap: Record<string, string> = { truth: '💬', dare: '🔥', theme: '✨' };
    const colorMap: Record<string, string> = { truth: '#64D2FF', dare: '#FF9F0A', theme: '#BF5AF2' };
    const typeMap: Record<string, TaskEventData['type']> = { truth: 'mineTruth', dare: 'mineDare', theme: 'mineTheme' };

    return {
      type: typeMap[choice],
      initiatorPlayerId: activePlayer.id,
      executorPlayerId: activePlayer.id,
      title: titleMap[choice],
      subtitle: `${opponent.name}指定，任务来自「${theme.name}」`,
      icon: iconMap[choice],
      color: colorMap[choice],
      task,
      taskSourceId: theme.id
    };
  }, [state.players, state.themes, state.turn]);

  const movePlayer = useCallback((steps: number) => {
    setState(prev => {
      const activePlayer = prev.players[prev.turn];
      const newStep = calculateNewPosition(activePlayer.step, steps);
      return {
        ...prev,
        players: prev.players.map(p => p.id === activePlayer.id ? { ...p, step: newStep } : p)
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setState(prev => ({ ...prev, turn: prev.turn === 0 ? 1 : 0, isRolling: false }));
  }, []);

  const setIsRolling = useCallback((rolling: boolean) => {
    setState(prev => ({ ...prev, isRolling: rolling }));
  }, []);

  const checkTile = useCallback((landingStep: number): TaskEventData | 'win' | null => {
    const activePlayer = state.players[state.turn];
    const opponent = state.players[state.turn === 0 ? 1 : 0];

    if (landingStep === 48) return 'win';

    if (landingStep !== 0 && landingStep === opponent.step) {
      const theme = state.themes.find(t => t.id === activePlayer.themeId);
      if (!theme || theme.tasks.length === 0) return null;
      const task = theme.tasks[Math.floor(Math.random() * theme.tasks.length)];
      return {
        type: 'collision',
        initiatorPlayerId: activePlayer.id,
        executorPlayerId: opponent.id,
        title: '亲密追尾',
        subtitle: `任务来自「${theme.name}」`,
        icon: '🤝',
        color: '#FFD60A',
        task,
        taskSourceId: activePlayer.themeId || ''
      };
    }

    const tileType = state.boardMap[landingStep];
    if (tileType === 'lucky') {
      const theme = state.themes.find(t => t.id === activePlayer.themeId);
      if (!theme || theme.tasks.length === 0) return null;
      const task = theme.tasks[Math.floor(Math.random() * theme.tasks.length)];
      return {
        type: 'lucky',
        initiatorPlayerId: activePlayer.id,
        executorPlayerId: opponent.id,
        title: '幸运时刻',
        subtitle: `任务来自「${theme.name}」`,
        icon: '❤️',
        color: '#FF375F',
        task,
        taskSourceId: activePlayer.themeId || ''
      };
    }

    if (tileType === 'trap') {
      const theme = state.themes.find(t => t.id === opponent.themeId);
      if (!theme || theme.tasks.length === 0) return null;
      const task = theme.tasks[Math.floor(Math.random() * theme.tasks.length)];
      return {
        type: 'trap',
        initiatorPlayerId: activePlayer.id,
        executorPlayerId: activePlayer.id,
        title: '意外陷阱',
        subtitle: `任务来自「${theme.name}」`,
        icon: '🔒',
        color: '#BF5AF2',
        task,
        taskSourceId: opponent.themeId || ''
      };
    }

    return null;
  }, [state.players, state.turn, state.themes, state.boardMap]);

  const resolveTask = useCallback((task: TaskEventData, outcome: 'accept' | 'reject') => {
    setState(prev => {
      let nextPlayers = prev.players;
      if (outcome === 'reject' && task.type !== 'card' && task.type !== 'mineTruth' && task.type !== 'mineDare' && task.type !== 'mineTheme') {
        const backSteps = Math.floor(Math.random() * 3) + 1;
        nextPlayers = prev.players.map(p => {
          if (p.id !== task.executorPlayerId) return p;
          if (task.type === 'collision') return { ...p, step: 0 };
          return { ...p, step: Math.max(0, p.step - backSteps) };
        });
      }
      return { ...prev, players: nextPlayers, turn: prev.turn === 0 ? 1 : 0, isRolling: false };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      view: 'home',
      gameMode: 'board',
      turn: 0,
      players: initialPlayers.map(p => ({ ...p, themeId: null, step: 0 })),
      boardMap: generateBoardMap(),
      pathCoords: generateSpiralPath(),
      mineBoard: generateMineBoard(),
      isRolling: false
    }));
  }, []);

  return {
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
  };
}
