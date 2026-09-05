import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from '../../hooks/useChessGame';

export const GameArena: React.FC = () => {
  const { fen, turn, isGameOver, gameResult, makeMove, resetGame } = useChessGame();

  function onDrop(sourceSquare: string, targetSquare: string): boolean {
    const success = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    return success;
  }

  return (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Container do Tabuleiro */}
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <Chessboard 
          position={fen} 
          onPieceDrop={onDrop}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        />
      </div>

      {/* Painel Lateral da Partida */}
      <div style={{
        backgroundColor: '#262421',
        padding: '24px',
        borderRadius: '12px',
        minWidth: '280px',
        flex: 1
      }}>
        <h2 style={{ color: '#fff', marginTop: 0 }}>Partida de Xadrez</h2>
        <p style={{ color: '#bab4ab' }}>
          Vez das: <strong style={{ color: turn === 'w' ? '#fff' : '#81b64c' }}>
            {turn === 'w' ? 'Brancas' : 'Pretas'}
          </strong>
        </p>

        {isGameOver && (
          <div style={{
            backgroundColor: '#e74c3c22',
            border: '1px solid #e74c3c',
            color: '#e74c3c',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontWeight: 'bold'
          }}>
            {gameResult}
          </div>
        )}

        <button 
          onClick={resetGame}
          style={{
            width: '100%',
            backgroundColor: '#81b64c',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Reiniciar Partida
        </button>
      </div>
    </div>
  );
};