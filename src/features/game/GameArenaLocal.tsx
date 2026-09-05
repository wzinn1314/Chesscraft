import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from '../../hooks/useChessGame';

export const GameArenaLocal: React.FC = () => {
  const { fen, turn, isGameOver, gameResult, makeMove, resetGame } = useChessGame();

  const handlePieceDrop = (source: string, target: string): boolean => {
    return makeMove({ from: source, to: target, promotion: 'q' });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#ffffff', marginBottom: '8px' }}>⚔️ Passa & Joga (Local)</h1>
      <p style={{ color: '#a8a8b3', marginBottom: '24px' }}>Modo local para dois jogadores no mesmo dispositivo.</p>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          {/* @ts-ignore */}
          <Chessboard 
            position={fen} 
            onPieceDrop={handlePieceDrop}
            customBoardStyle={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
          />
        </div>

        <div style={{ flex: 1, backgroundColor: '#202024', padding: '24px', borderRadius: '12px', border: '1px solid #29292e', minWidth: '260px' }}>
          <h3 style={{ color: '#ffffff', marginTop: 0 }}>Informações</h3>
          <p style={{ color: '#a8a8b3' }}>
            Vez de jogar: <strong style={{ color: turn === 'w' ? '#ffffff' : '#00e676' }}>
              {turn === 'w' ? 'Brancas ♔' : 'Pretas ♚'}
            </strong>
          </p>

          {isGameOver && (
            <div style={{ backgroundColor: '#ff525222', border: '1px solid #ff5252', color: '#ff5252', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
              {gameResult}
            </div>
          )}

          <button 
            onClick={resetGame}
            style={{ width: '100%', backgroundColor: '#00e676', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' }}
          >
            Reiniciar Partida
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameArenaLocal;