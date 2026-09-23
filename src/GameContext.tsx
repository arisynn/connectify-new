import React, { createContext, useContext, useState, useCallback } from 'react';
import type { GameId } from './core/games';

export type Screen = 'boot' | 'startup' | 'login' | 'home' | 'game-hub' | 'play' | 'multiplayer' | 'toko' | 'tema' | 'prestasi' | 'statistik' | 'pesan' | 'profile' | 'block-puzzle' | 'settings' | 'koleksi' | 'edit-avatar' | 'memory' | 'triple' | 'ledger' | 'star-patrol' | 'star-hangar';

export type GameMode = 'normal' | 'daily' | 'infinity';

interface GameContextType {
  screen: Screen;
  navigate: (screen: Screen) => void;
  activeGame: GameId;
  openGame: (game: GameId, tab?: string) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  user: { name: string; level: number; diamond: string; coin: string };
  updateUsername: (name: string) => void;
  resetProgress: () => void;
}

const defaultUser = { name: 'Player', level: 1, diamond: '0', coin: '0' };

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [screen, setScreen] = useState<Screen>('boot');
  const [activeGame, setActiveGame] = useState<GameId>(() => (sessionStorage.getItem('active-game') as GameId) || 'onet');
  const navigate = useCallback((next: Screen) => setScreen(next), []);
  const openGame = useCallback((game: GameId, tab = 'main') => { sessionStorage.setItem('active-game', game); sessionStorage.setItem('game-hub-tab', tab); setActiveGame(game); setScreen('game-hub'); }, []);
  const [user, setUser] = useState(defaultUser);
  const [gameMode, setGameMode] = useState<GameMode>('normal');

  const updateUsername = (name: string) => {
    setUser(prev => ({ ...prev, name }));
  };

  const resetProgress = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <GameContext.Provider value={{ screen, navigate, activeGame, openGame, gameMode, setGameMode, user, updateUsername, resetProgress }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
