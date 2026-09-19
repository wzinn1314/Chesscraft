import React, { useEffect, useState } from 'react';
import { clearCache, getCache, setCache } from '../service/cache';
import { clearActiveSession } from '../service/userService';
import { puzzleService } from '../service/puzzleService';
import { MUSIC_TRACKS, playSound, startAmbientMusic, stopAmbientMusic, type MusicChoice } from '../utils/audio';

interface SettingsProps { playerName?: string; onSignOut: () => void; currentTheme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void; }
type BoardTheme = 'classic' | 'ocean' | 'walnut';

const Settings: React.FC<SettingsProps> = ({ playerName, onSignOut, currentTheme, setTheme }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(currentTheme);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('classic');
  const [soundOn, setSoundOn] = useState(true);
  const [musicChoice, setMusicChoice] = useState<MusicChoice>('random');
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [dataMessage, setDataMessage] = useState('');

  useEffect(() => {
    const board = getCache('prefs:boardTheme'); const music = getCache('prefs:musicChoice');
    if (board === 'classic' || board === 'ocean' || board === 'walnut') setBoardTheme(board);
    if (music === 'off' || music === 'random' || MUSIC_TRACKS.some((track) => track.id === music)) setMusicChoice(music as MusicChoice);
    else if (getCache('prefs:musicOn') === true) setMusicChoice('random');
    if (typeof getCache('prefs:soundOn') === 'boolean') setSoundOn(getCache('prefs:soundOn'));
    if (typeof getCache('prefs:showCoordinates') === 'boolean') setShowCoordinates(getCache('prefs:showCoordinates'));
    if (typeof getCache('prefs:reducedMotion') === 'boolean') setReducedMotion(getCache('prefs:reducedMotion'));
    if (typeof getCache('prefs:highContrast') === 'boolean') setHighContrast(getCache('prefs:highContrast'));
    setThemeState(currentTheme);
  }, [currentTheme]);

  useEffect(() => { document.documentElement.dataset.boardTheme = boardTheme; setCache('prefs:boardTheme', boardTheme); }, [boardTheme]);
  useEffect(() => { document.documentElement.dataset.reducedMotion = String(reducedMotion); document.documentElement.dataset.highContrast = String(highContrast); setCache('prefs:reducedMotion', reducedMotion); setCache('prefs:highContrast', highContrast); }, [reducedMotion, highContrast]);
  useEffect(() => { if (!soundOn) stopAmbientMusic(); }, [soundOn]);

  const updateMusic = (choice: MusicChoice) => {
    setMusicChoice(choice); setCache('prefs:musicChoice', choice); setCache('prefs:musicOn', choice !== 'off'); stopAmbientMusic();
    if (choice !== 'off') { const started = startAmbientMusic(choice); const track = MUSIC_TRACKS.find((item) => item.id === started); if (track) setDataMessage(`Tocando: ${track.title}.`); }
  };
  const updateCoordinates = (value: boolean) => { setShowCoordinates(value); setCache('prefs:showCoordinates', value); window.dispatchEvent(new Event('chesscraft-preferences-updated')); };
  const resetVisual = () => { setBoardTheme('classic'); setReducedMotion(false); setHighContrast(false); setShowCoordinates(true); setThemeState('dark'); setTheme('dark'); setDataMessage('Preferências visuais restauradas.'); };

  return <section className="settings-page">
    <header className="settings-hero"><p className="eyebrow">Preferências</p><h1>Ajustes</h1><p className="lede">Personalize sua experiência e deixe o jogo com a sua cara.</p></header>
    {dataMessage && <div className="settings-feedback" role="status">{dataMessage}</div>}
    <div className="settings-grid">
      <section className="settings-card settings-card--wide"><h2>Aparência</h2><p>Escolha o tema e o estilo do tabuleiro.</p><div className="settings-field"><span>Tema</span><div className="segmented-control"><button type="button" className={theme === 'dark' ? 'is-selected' : ''} onClick={() => { setThemeState('dark'); setTheme('dark'); }}>Escuro</button><button type="button" className={theme === 'light' ? 'is-selected' : ''} onClick={() => { setThemeState('light'); setTheme('light'); }}>Claro</button></div></div><div className="settings-field"><span>Tabuleiro</span><div className="board-picker">{(['classic', 'ocean', 'walnut'] as const).map((item) => <button key={item} type="button" className={boardTheme === item ? `board-option ${item} is-selected` : `board-option ${item}`} onClick={() => setBoardTheme(item)}>{item === 'classic' ? 'Clássico' : item === 'ocean' ? 'Oceano' : 'Nogueira'}</button>)}</div></div></section>
      <section className="settings-card settings-card--wide"><div className="music-heading"><div><h2>Música</h2><p>{musicChoice === 'off' ? 'Música desativada.' : musicChoice === 'random' ? 'Modo aleatório ativo.' : `Selecionada: ${MUSIC_TRACKS.find((track) => track.id === musicChoice)?.title}.`}</p></div><button type="button" className="settings-action music-library-toggle" onClick={() => setShowMusicLibrary((open) => !open)} aria-expanded={showMusicLibrary}>{showMusicLibrary ? 'Fechar seleção' : 'Escolher música'}</button></div>{showMusicLibrary && <div className="music-picker"><button type="button" className={musicChoice === 'off' ? 'music-option is-selected' : 'music-option'} onClick={() => updateMusic('off')}><b>Sem música</b><small>Desativada</small></button><button type="button" className={musicChoice === 'random' ? 'music-option is-selected' : 'music-option'} onClick={() => updateMusic('random')}><b>Aleatória</b><small>Uma faixa diferente a cada entrada</small></button>{MUSIC_TRACKS.map((track) => <button key={track.id} type="button" className={musicChoice === track.id ? 'music-option is-selected' : 'music-option'} onClick={() => updateMusic(track.id)}><b>{track.title}</b><small>{track.style}</small></button>)}</div>}</section>
      <section className="settings-card"><h2>Partida</h2><p>Controles usados durante as partidas.</p><label className="settings-toggle"><input type="checkbox" checked={soundOn} onChange={(event) => { setSoundOn(event.target.checked); setCache('prefs:soundOn', event.target.checked); if (event.target.checked) playSound('preview'); }} /><span><b>Sons do tabuleiro</b><small>Toque para cada movimento.</small></span></label><button type="button" className="settings-text-button" onClick={() => playSound('preview')} disabled={!soundOn}>Testar som</button><label className="settings-toggle"><input type="checkbox" checked={showCoordinates} onChange={(event) => updateCoordinates(event.target.checked)} /><span><b>Coordenadas do tabuleiro</b><small>Mostra letras e números nas bordas.</small></span></label></section>
      <section className="settings-card"><h2>Acessibilidade</h2><p>Melhore a leitura e reduza distrações.</p><label className="settings-toggle"><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /><span><b>Reduzir animações</b><small>Remove transições não essenciais.</small></span></label><label className="settings-toggle"><input type="checkbox" checked={highContrast} onChange={(event) => setHighContrast(event.target.checked)} /><span><b>Alto contraste</b><small>Deixa textos e limites mais nítidos.</small></span></label></section>
      <section className="settings-card"><h2>Dados</h2><p>Gerencie estatísticas e preferências.</p><button type="button" className="settings-action" onClick={() => { puzzleService.resetStats(); setDataMessage('Estatísticas dos puzzles foram apagadas.'); }}>Limpar estatísticas dos puzzles</button><button type="button" className="settings-text-button" onClick={resetVisual}>Restaurar aparência padrão</button></section>
      <section className="settings-card"><h2>Conta</h2><p>{playerName ? `Sessão ativa como ${playerName}.` : 'Nenhuma sessão ativa.'}</p><button type="button" className="settings-action settings-action--danger" onClick={() => { clearCache('playerName'); clearActiveSession(); onSignOut(); }}>Sair da conta</button></section>
    </div>
  </section>;
};

export default Settings;
