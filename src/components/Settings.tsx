import React, { useEffect, useState } from 'react';
import { clearCache, getCache, setCache } from '../service/cache';
import { clearActiveSession } from '../service/userService';
import { puzzleService } from '../service/puzzleService';
import { playSound } from '../utils/audio';

interface SettingsProps {
  playerName?: string;
  onSignOut: () => void;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ACCENTS = [
  { id: 'gold', label: 'Dourado', color: '#d4a054', rgb: '212, 160, 84' },
  { id: 'blue', label: 'Azul', color: '#5b9bd5', rgb: '91, 155, 213' },
  { id: 'green', label: 'Verde', color: '#69a86d', rgb: '105, 168, 109' },
  { id: 'violet', label: 'Violeta', color: '#a77bd6', rgb: '167, 123, 214' },
] as const;

type AccentId = typeof ACCENTS[number]['id'];
type BoardTheme = 'classic' | 'ocean' | 'walnut';

const Settings: React.FC<SettingsProps> = ({ playerName, onSignOut, currentTheme, setTheme }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(currentTheme);
  const [accent, setAccent] = useState<AccentId>('gold');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('classic');
  const [soundOn, setSoundOn] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [dataMessage, setDataMessage] = useState('');

  useEffect(() => {
    const savedAccent = getCache('prefs:accent');
    const savedBoard = getCache('prefs:boardTheme');
    const savedSound = getCache('prefs:soundOn');
    const savedCoordinates = getCache('prefs:showCoordinates');
    const savedMotion = getCache('prefs:reducedMotion');
    const savedContrast = getCache('prefs:highContrast');
    if (ACCENTS.some((item) => item.id === savedAccent)) setAccent(savedAccent as AccentId);
    if (savedBoard === 'classic' || savedBoard === 'ocean' || savedBoard === 'walnut') setBoardTheme(savedBoard);
    if (typeof savedSound === 'boolean') setSoundOn(savedSound);
    if (typeof savedCoordinates === 'boolean') setShowCoordinates(savedCoordinates);
    if (typeof savedMotion === 'boolean') setReducedMotion(savedMotion);
    if (typeof savedContrast === 'boolean') setHighContrast(savedContrast);
    setThemeState(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const selected = ACCENTS.find((item) => item.id === accent) ?? ACCENTS[0];
    document.documentElement.style.setProperty('--brand', selected.color);
    document.documentElement.style.setProperty('--brand-rgb', selected.rgb);
    setCache('prefs:accent', accent);
  }, [accent]);

  useEffect(() => {
    document.documentElement.dataset.boardTheme = boardTheme;
    setCache('prefs:boardTheme', boardTheme);
  }, [boardTheme]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
    document.documentElement.dataset.highContrast = String(highContrast);
    setCache('prefs:reducedMotion', reducedMotion);
    setCache('prefs:highContrast', highContrast);
  }, [reducedMotion, highContrast]);

  const updateTheme = (next: 'light' | 'dark') => { setThemeState(next); setTheme(next); };
  const updateSound = (value: boolean) => { setSoundOn(value); setCache('prefs:soundOn', value); if (value) playSound('preview'); };
  const updateCoordinates = (value: boolean) => { setShowCoordinates(value); setCache('prefs:showCoordinates', value); window.dispatchEvent(new Event('chesscraft-preferences-updated')); };
  const resetVisualSettings = () => {
    setAccent('gold'); setBoardTheme('classic'); setReducedMotion(false); setHighContrast(false); setShowCoordinates(true); updateTheme('dark');
    setDataMessage('Preferências visuais restauradas.');
  };
  const clearPuzzleHistory = () => { puzzleService.resetStats(); setDataMessage('Estatísticas dos puzzles foram apagadas deste dispositivo.'); };
  const signOut = () => { clearCache('playerName'); clearActiveSession(); onSignOut(); };

  return (
    <section className="settings-page">
      <header className="settings-hero"><p className="eyebrow">Preferências</p><h1>Ajustes</h1><p className="lede">Personalize sua experiência. Todas as alterações são aplicadas e salvas neste dispositivo.</p></header>
      {dataMessage && <div className="settings-feedback" role="status">{dataMessage}</div>}

      <div className="settings-grid">
        <section className="settings-card settings-card--wide"><div className="settings-card-head"><div><h2>Aparência</h2><p>Escolha o tema, a cor principal e o estilo do tabuleiro.</p></div></div>
          <div className="settings-field"><span>Tema</span><div className="segmented-control"><button type="button" className={theme === 'dark' ? 'is-selected' : ''} onClick={() => updateTheme('dark')}>Escuro</button><button type="button" className={theme === 'light' ? 'is-selected' : ''} onClick={() => updateTheme('light')}>Claro</button></div></div>
          <div className="settings-field"><span>Cor de destaque</span><div className="accent-picker">{ACCENTS.map((item) => <button key={item.id} type="button" className={accent === item.id ? 'accent-option is-selected' : 'accent-option'} onClick={() => setAccent(item.id)} aria-label={`Usar destaque ${item.label}`}><i style={{ backgroundColor: item.color }} /><b>{item.label}</b></button>)}</div></div>
          <div className="settings-field"><span>Tabuleiro</span><div className="board-picker">{(['classic', 'ocean', 'walnut'] as const).map((item) => <button key={item} type="button" className={boardTheme === item ? `board-option ${item} is-selected` : `board-option ${item}`} onClick={() => setBoardTheme(item)}>{item === 'classic' ? 'Clássico' : item === 'ocean' ? 'Oceano' : 'Nogueira'}</button>)}</div></div>
        </section>

        <section className="settings-card"><h2>Partida</h2><p>Controles usados durante as partidas.</p><label className="settings-toggle"><input type="checkbox" checked={soundOn} onChange={(event) => updateSound(event.target.checked)} /><span><b>Sons do tabuleiro</b><small>Toque para cada movimento.</small></span></label><button type="button" className="settings-text-button" onClick={() => playSound('preview')} disabled={!soundOn}>Testar som</button><label className="settings-toggle"><input type="checkbox" checked={showCoordinates} onChange={(event) => updateCoordinates(event.target.checked)} /><span><b>Coordenadas do tabuleiro</b><small>Mostra letras e números nas bordas.</small></span></label></section>

        <section className="settings-card"><h2>Acessibilidade</h2><p>Melhore a leitura e reduza distrações.</p><label className="settings-toggle"><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /><span><b>Reduzir animações</b><small>Remove transições não essenciais.</small></span></label><label className="settings-toggle"><input type="checkbox" checked={highContrast} onChange={(event) => setHighContrast(event.target.checked)} /><span><b>Alto contraste</b><small>Deixa textos e limites mais nítidos.</small></span></label></section>

        <section className="settings-card"><h2>Dados</h2><p>Gerencie os dados guardados no navegador.</p><button type="button" className="settings-action" onClick={clearPuzzleHistory}>Limpar estatísticas dos puzzles</button><button type="button" className="settings-text-button" onClick={resetVisualSettings}>Restaurar aparência padrão</button></section>
        <section className="settings-card"><h2>Conta</h2><p>{playerName ? `Sessão ativa como ${playerName}.` : 'Nenhuma sessão ativa.'}</p><button type="button" className="settings-action settings-action--danger" onClick={signOut}>Sair da conta</button></section>
      </div>
    </section>
  );
};

export default Settings;
