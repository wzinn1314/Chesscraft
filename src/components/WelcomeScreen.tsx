import React, { useEffect, useState } from 'react';
import { getCache, setCache } from '../service/cache';

interface WelcomeScreenProps {
  onWelcome: (name: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onWelcome }) => {
  const [playerName, setPlayerName] = useState('');

  // main logo placed in public folder; using the requested logo
  const mainLogo = '/Gemini_Generated_Image_o5ngkwo5ngkwo5ng-removebg-preview.png';

  useEffect(() => {
    const cached = getCache('playerName');
    if (cached) setPlayerName(String(cached));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim();
    if (name) {
      setCache('playerName', name); // save to device cache
      onWelcome(name);
    }
  };

  return (
    <div className="welcome-overlay">
      <div className="welcome-card">
        <div className="welcome-header">
          {/* Main logo */}
          <img src={mainLogo} alt="ChessCraft Logo" className="logo logo--welcome-main" />
        </div>

        <form onSubmit={handleSubmit} className="welcome-form">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Digite seu nome..."
            autoFocus
            className="welcome-input"
          />

          <button
            type="submit"
            disabled={!playerName.trim()}
            className={`welcome-button ${playerName.trim() ? 'ready' : 'disabled'}`}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;