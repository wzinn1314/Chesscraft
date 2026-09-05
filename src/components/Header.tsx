import React from 'react';

interface HeaderProps {
  playerName?: string;
}

export const Header: React.FC<HeaderProps> = ({ playerName }) => {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={'/Gemini_Generated_Image_umnzftumnzftumnz-removebg-preview.png'} alt="logo" className="logo logo--header" />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#E58E26' }}>ChessCraft</div>
          <div style={{ fontSize: 12, color: '#a8a39d' }}>A excelência em estratégia</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {playerName ? <div style={{ color: '#fff' }}>Olá, {playerName}</div> : null}
      </div>
    </header>
  );
};

export default Header;
