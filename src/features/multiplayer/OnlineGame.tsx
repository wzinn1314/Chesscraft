import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useOnlineGame } from '../../hooks/useOnlineGame';

interface OnlineGameProps {
  roomId: string;
  isCreator: boolean;
  creatorColor?: 'w' | 'b';
  initialTime?: number;
}

export const OnlineGame: React.FC<OnlineGameProps> = ({
  roomId,
  isCreator,
  creatorColor = 'w',
  initialTime = 300,
}) => {
  const {
    fen,
    turn,
    myColor,
    inCheck,
    gameStatus,
    isGameOver,
    gameOverReason,
    whiteTime,
    blackTime,
    makeMove,
  } = useOnlineGame(roomId, isCreator, creatorColor, initialTime);

  const [copied, setCopied] = useState(false);

  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    return makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMyTurn = turn === myColor;

  if (gameStatus === 'waiting' && isCreator) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        backgroundColor: '#1c1b18',
        borderRadius: '16px',
        border: '1px solid #2d2b27',
        color: '#fff',
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
        <h2 style={{ margin: 0 }}>Aguardando oponente...</h2>
        <p style={{ color: '#a8a39d', margin: 0, fontSize: '14px' }}>
          Envie o código abaixo para o seu amigo entrar na sala.
        </p>

        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          backgroundColor: '#262421',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid #363431'
        }}>
          <strong style={{ fontSize: '22px', letterSpacing: '2px', color: '#e58e26' }}>
            {roomId}
          </strong>
          <button
            onClick={handleCopyCode}
            style={{
              backgroundColor: '#629924',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
      {/* Alerta de Fim de Jogo */}
      {isGameOver && (
        <div style={{
          backgroundColor: '#d63031',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '18px',
          textAlign: 'center',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 4px 12px rgba(214, 48, 49, 0.4)'
        }}>
          🏆 {gameOverReason || 'Fim de Jogo!'}
        </div>
      )}

      {/* Alerta de Xeque em Tempo Real */}
      {inCheck && !isGameOver && (
        <div style={{
          backgroundColor: '#e17055',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '560px',
          width: '100%',
          animation: 'pulse 1s infinite'
        }}>
          ⚠️ XEQUE! O rei está sob ataque.
        </div>
      )}

      {/* Informações da Sala */}
      <div style={{
        backgroundColor: '#1c1b18',
        border: '1px solid #2d2b27',
        padding: '12px 20px',
        borderRadius: '10px',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '560px',
        width: '100%'
      }}>
        <div>
          <span style={{ fontSize: '11px', color: '#78736c', display: 'block' }}>SALA</span>
          <strong style={{ color: '#e58e26', fontSize: '16px' }}>{roomId}</strong>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: '#78736c', display: 'block' }}>
            {isGameOver ? 'PARTIDA ENCERRADA' : isMyTurn ? 'SUA VEZ DE JOGAR' : 'AGUARDANDO OPONENTE'}
          </span>
          <strong style={{ fontSize: '14px' }}>
            {myColor === 'w' ? '⚪ Jogando de Brancas' : '⚫ Jogando de Pretas'}
          </strong>
        </div>
      </div>

      {/* Relógio do Oponente */}
      <div style={{
        backgroundColor: turn !== myColor ? '#262421' : '#161512',
        border: `2px solid ${turn !== myColor ? '#82ca28' : '#363431'}`,
        padding: '8px 16px',
        borderRadius: '8px',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '560px',
        width: '100%'
      }}>
        <span>{myColor === 'w' ? '⚫ Pretas' : '⚪ Brancas'}</span>
        <strong style={{ fontSize: '20px', fontFamily: 'monospace' }}>
          {formatTime(myColor === 'w' ? blackTime : whiteTime)}
        </strong>
      </div>

      {/* Tabuleiro de Xadrez */}
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <Chessboard
          position={fen}
          onPieceDrop={handlePieceDrop}
          boardOrientation="white"
          arePiecesDraggable={isMyTurn && !isGameOver}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        />
      </div>

      {/* Relógio do Jogador */}
      <div style={{
        backgroundColor: turn === myColor ? '#262421' : '#161512',
        border: `2px solid ${turn === myColor ? '#82ca28' : '#363431'}`,
        padding: '8px 16px',
        borderRadius: '8px',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '560px',
        width: '100%'
      }}>
        <span>{myColor === 'w' ? '⚪ Brancas (Você)' : '⚫ Pretas (Você)'}</span>
        <strong style={{ fontSize: '20px', fontFamily: 'monospace' }}>
          {formatTime(myColor === 'w' ? whiteTime : blackTime)}
        </strong>
      </div>
    </div>
  );
};

export default OnlineGame;