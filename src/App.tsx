import React, { useEffect, useState, lazy, Suspense } from 'react';
import Header from './components/Header';
import Settings from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { getCache, setCache } from './service/cache';
import { createOrUpdateUser, loadActiveSession, clearActiveSession } from './service/userService';
import { startAmbientMusic } from './utils/audio';
const DashboardHome = lazy(() => import('./features/dashboard/DashboardHome'));
const GameArenaAI = lazy(() => import('./features/game/GameArenaIA'));
const GameArenaLocal = lazy(() => import('./features/game/GameArenaLocal'));
const LobbyModal = lazy(() => import('./features/multiplayer/LobbyModal'));
const OnlineGame = lazy(() => import('./features/multiplayer/OnlineGame'));
const PuzzlesArena = lazy(() => import('./features/puzzles/PuzzleArena'));

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
      if (getCache('prefs:soundOn') !== false && getCache('prefs:musicChoice') !== 'off') startAmbientMusic((getCache('prefs:musicChoice') as 'random') ?? 'random');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setPlayerName(name);
      setShowWelcome(false);
      if (getCache('prefs:soundOn') !== false && getCache('prefs:musicChoice') !== 'off') startAmbientMusic((getCache('prefs:musicChoice') as 'random') ?? 'random');
    }
  };
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
    const cached = (getCache('prefs:theme') as 'light' | 'dark') ?? 'dark';
    document.documentElement.setAttribute('data-theme', cached);
    setCache('prefs:theme', cached);
    document.documentElement.dataset.reducedMotion = String(getCache('prefs:reducedMotion') === true);
    document.documentElement.dataset.highContrast = String(getCache('prefs:highContrast') === true);
    document.documentElement.dataset.boardTheme = String(getCache('prefs:boardTheme') ?? 'classic');
    const resumeMusic = () => {
      const musicChoice = getCache('prefs:musicChoice');
      if (getCache('prefs:soundOn') !== false && musicChoice !== 'off') startAmbientMusic((musicChoice as 'random') ?? 'random');
    };
    window.addEventListener('pointerdown', resumeMusic, { once: true });
    window.addEventListener('keydown', resumeMusic, { once: true });
    return () => {
      window.removeEventListener('pointerdown', resumeMusic);
      window.removeEventListener('keydown', resumeMusic);
    };
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
              {currentTab === 'upcoming' && (
                <section className="upcoming-page" aria-labelledby="upcoming-title">
                  <span className="card-kicker">NOVO</span>
                  <h1 id="upcoming-title">Em breve</h1>
                  <p>
                    Estamos preparando novas formas de jogar e acompanhar sua evolução.
                  </p>
                  <div className="upcoming-grid">
                    <article>
                      <h2>Desafios semanais</h2>
                      <p>Metas táticas e partidas especiais para treinar toda semana.</p>
                    </article>
                    <article>
                      <h2>Temporadas</h2>
                      <p>Uma forma organizada de acompanhar progresso e resultados.</p>
                    </article>
                    <article>
                      <h2>Partidas com amigos</h2>
                      <p>Melhorias para convidar e jogar com quem você conhece.</p>
                    </article>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => setCurrentTab('dashboard')}>
                    Voltar ao início
                  </button>
                </section>
              )}
              {currentTab === 'vs-online' && onlineGameConfig && (
                <div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { setOnlineGameConfig(null); setCurrentTab('dashboard'); }}
                  >
                    Sair da sala
                  </button>
                  <OnlineGame roomId={onlineGameConfig.roomId} isCreator={onlineGameConfig.isCreator} creatorColor={onlineGameConfig.creatorColor} initialTime={onlineGameConfig.initialTime} onGoHome={() => { setOnlineGameConfig(null); setCurrentTab('dashboard'); }} />
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
