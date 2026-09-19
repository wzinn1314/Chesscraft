import React from 'react';

interface HeaderProps {
  playerName?: string;
}

export const Header: React.FC<HeaderProps> = ({ playerName }) => {
  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">ChessCraft</div>
        <div className="topbar-sub">Estudo, partida e precisão.</div>
      </div>
      {playerName ? <div className="topbar-user">{playerName}</div> : null}
    </header>
  );
};

export default Header;
