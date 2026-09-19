import React, { useEffect, useState, lazy, Suspense } from 'react';
import Header from './components/Header';
import Settings from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { getCache, setCache } from './service/cache';
import { createOrUpdateUser, loadActiveSession, clearActiveSession } from './service/userService';

// Lazy loading de componentes pesados
const DashboardHome = lazy(() => import('./features/dashboard/DashboardHome'));
const GameArenaAI = lazy(() => import('./features/game/GameArenaIA'));
const GameArenaLocal = lazy(() => import('./features/game/GameArenaLocal'));
const LobbyModal = lazy(() => import('./features/multiplayer/LobbyModal'));
const OnlineGame = lazy(() => import('./features/multiplayer/OnlineGame'));
const PuzzlesArena = lazy(() => import('./features/puzzles/PuzzleArena'));
const Tournaments = lazy(() => import('./features/tournaments/Tournaments'));

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
    document.documentElement.dataset.reducedMotion = String(getCache('prefs:reducedMotion') === true);
    document.documentElement.dataset.highContrast = String(getCache('prefs:highContrast') === true);
    document.documentElement.dataset.boardTheme = String(getCache('prefs:boardTheme') ?? 'classic');
    const accent = getCache('prefs:accent');
    const accentValues: Record<string, [string, string]> = {
      gold: ['#d4a054', '212, 160, 84'], blue: ['#5b9bd5', '91, 155, 213'],
      green: ['#69a86d', '105, 168, 109'], violet: ['#a77bd6', '167, 123, 214'],
    };
    if (typeof accent === 'string' && accentValues[accent]) {
      document.documentElement.style.setProperty('--brand', accentValues[accent][0]);
      document.documentElement.style.setProperty('--brand-rgb', accentValues[accent][1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = () => {
    clearActiveSession();
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
        <div className="app-shell">
          <Sidebar currentTab={currentTab} onSelectTab={handleSelectTab} />
          <main className="app-main">
            <Header playerName={playerName} />
            <Suspense fallback={<div style={{ color: '#f3efe6', padding: '20px' }}>Carregando...</div>}>
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
              {currentTab === 'tournaments' && <Tournaments />}
              {currentTab === 'vs-online' && onlineGameConfig && (
                <div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { setOnlineGameConfig(null); setCurrentTab('dashboard'); }}
                  >
                    Sair da sala
                  </button>
                  <OnlineGame roomId={onlineGameConfig.roomId} isCreator={onlineGameConfig.isCreator} creatorColor={onlineGameConfig.creatorColor} initialTime={onlineGameConfig.initialTime} />
                </div>
              )}
            </Suspense>
          </main>
          {isLobbyOpen && (
            <Suspense fallback={<div style={{ color: '#f3efe6', padding: '20px' }}>Carregando...</div>}>
              <LobbyModal onStartGame={handleStartOnlineGame} onCancel={() => { setIsLobbyOpen(false); if (currentTab === 'vs-online' && !onlineGameConfig) setCurrentTab('dashboard'); }} />
            </Suspense>
          )}
        </div>
      )}
    </>
  );
};

export default App;
