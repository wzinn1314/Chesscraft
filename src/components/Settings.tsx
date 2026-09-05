import React, { useEffect, useState } from 'react';
import { getCache, setCache, clearCache } from '../service/cache';

interface SettingsProps {
  playerName?: string;
  onSignOut: () => void;
  currentTheme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

const Settings: React.FC<SettingsProps> = ({ playerName, onSignOut, currentTheme, setTheme }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(currentTheme);
  const [autoSave, setAutoSave] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  useEffect(() => {
    const s = getCache('prefs:autoSave');
    const so = getCache('prefs:soundOn');
    if (typeof s === 'boolean') setAutoSave(s);
    if (typeof so === 'boolean') setSoundOn(so);
    setThemeState(currentTheme);
  }, [currentTheme]);

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    setCache('prefs:theme', next);
    setTheme(next);
  };

  const handleAutoSave = (v: boolean) => {
    setAutoSave(v);
    setCache('prefs:autoSave', v);
  };

  const handleSound = (v: boolean) => {
    setSoundOn(v);
    setCache('prefs:soundOn', v);
  };

  const handleSignOut = () => {
    // clear user session and bring back welcome
    clearCache('playerName');
    onSignOut();
  };

  return (
    <section style={{ maxWidth: 880 }}>
      <h2 style={{ color: '#E58E26' }}>Configurações</h2>

      <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
        <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
          <strong>Tema do Site</strong>
          <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={handleThemeToggle} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              Alternar para {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <div>Tema atual: <strong>{theme}</strong></div>
          </div>
        </div>

        <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
          <strong>Preferências do Usuário</strong>
          <div style={{ marginTop: 8, display: 'flex', gap: 16, alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={autoSave} onChange={(e) => handleAutoSave(e.target.checked)} />
              Auto salvar partidas
            </label>

            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={soundOn} onChange={(e) => handleSound(e.target.checked)} />
              Som do jogo
            </label>
          </div>
        </div>

        <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Conta</strong>
            <div style={{ marginTop: 6 }}>{playerName ? `Logado como ${playerName}` : 'Nenhum usuário autenticado'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSignOut} style={{ padding: '8px 12px', background: '#2d2b27', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Sair</button>
            <button onClick={() => { clearCache('playerName'); clearCache('prefs:theme'); clearCache('prefs:autoSave'); clearCache('prefs:soundOn'); window.location.reload(); }} style={{ padding: '8px 12px', background: '#a8a39d', color: '#121110', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Resetar tudo</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;
