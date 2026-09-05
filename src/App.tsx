import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import DashboardHome from './features/dashboard/DashboardHome';
import GameArenaLocal from './features/game/GameArenaLocal';
import GameArenaAI from './features/game/GameArenaIA';
import PuzzlesArena from './features/puzzles/PuzzleArena';
import { LobbyModal } from './features/multiplayer/LobbyModal';
import OnlineGame from './features/multiplayer/OnlineGame';
import Header from './components/Header';
import Settings from './components/Settings';
import { createOrUpdateUser, loadActiveSession } from './service/userService';
import { getCache, setCache } from './service/cache';

export interface BotOpponent {
  id: number;
  name: string;
  title: string;
  level: string;
  elo: string;
  desc: string;
  color: string;
  badge: string;
}

export const App: React.FC = () => {
  const saved = loadActiveSession();
  const [playerName, setPlayerName] = useState<string>(saved?.name ?? '');
  const [showWelcome, setShowWelcome] = useState<boolean>(!saved);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(false);
  const [onlineGameConfig, setOnlineGameConfig] = useState<{
    roomId: string;
    isCreator: boolean;
    creatorColor: 'w' | 'b';
    initialTime: number;
  } | null>(null);

  const handleStartOnlineGame = (
    roomId: string, 
    isCreator: boolean = false, 
    creatorColor: 'w' | 'b' = 'w', 
    initialTime: number = 300
  ) => {
    setOnlineGameConfig({ roomId, isCreator, creatorColor, initialTime });
    setIsLobbyOpen(false);
    setCurrentTab('vs-online');
  };

  const handleSelectTab = (tab: string) => {
    if (tab === 'vs-online') {
      setIsLobbyOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  const handleWelcome = async (name: string) => {
    try {
      await createOrUpdateUser(name);
      setPlayerName(name);
      setShowWelcome(false);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setPlayerName(name);
      setShowWelcome(false);
    }
  };

  // Theme handling (persisted)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => (getCache('prefs:theme') as 'light' | 'dark') ?? 'dark');

  const applyTheme = (t: 'light' | 'dark') => {
    try {
      document.documentElement.setAttribute('data-theme', t);
      setCache('prefs:theme', t);
      setThemeState(t);
    } catch (err) {
      console.warn('applyTheme error', err);
    }
  };

  useEffect(() => {
    // apply cached theme on mount
    const cached = (getCache('prefs:theme') as 'light' | 'dark') ?? theme;
    applyTheme(cached);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = () => {
    setPlayerName('');
    setShowWelcome(true);
  };

  useEffect(() => {
    if (playerName) {
      void createOrUpdateUser(playerName);
    }
  }, [playerName]);

  return (
    <>
      {showWelcome ? (
        <WelcomeScreen onWelcome={handleWelcome} />
      ) : (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121214', color: '#ffffff' }}>
          <Sidebar currentTab={currentTab} onSelectTab={handleSelectTab} />
          <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
            <Header playerName={playerName} />
            {currentTab === 'dashboard' && (
              <DashboardHome playerName={playerName} onSelectMode={handleSelectTab} />
            )}
            {currentTab === 'settings' && (
              <Settings playerName={playerName} onSignOut={handleSignOut} currentTheme={theme} setTheme={(t) => applyTheme(t)} />
            )}
            {currentTab === 'vs-local' && <GameArenaLocal />}
            {currentTab === 'vs-computer' && (
              <GameArenaAI
                playerName={playerName}
                onGoHome={() => setCurrentTab('dashboard')}
              />
            )}
            {currentTab === 'puzzles' && <PuzzlesArena />}
            {currentTab === 'vs-online' && onlineGameConfig && (
              <div>
                <button onClick={() => { setOnlineGameConfig(null); setCurrentTab('dashboard'); }} style={{ marginBottom: '16px', backgroundColor: '#2d2b27', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>← Sair da Sala</button>
                <OnlineGame roomId={onlineGameConfig.roomId} isCreator={onlineGameConfig.isCreator} creatorColor={onlineGameConfig.creatorColor} initialTime={onlineGameConfig.initialTime} />
              </div>
            )}
          </main>
          {isLobbyOpen && (
            <LobbyModal onStartGame={handleStartOnlineGame} onCancel={() => { setIsLobbyOpen(false); if (currentTab === 'vs-online' && !onlineGameConfig) setCurrentTab('dashboard'); }} />
          )}
        </div>
      )}
    </>
  );
};

export default App;