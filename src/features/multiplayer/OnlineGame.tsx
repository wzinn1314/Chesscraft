import React, { useState } from 'react';
import { ChessBoardView } from '../../components/ChessBoardView';
import { useMoveHints } from '../../hooks/useMoveHints';
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
    colorReady,
    inCheck,
    gameStatus,
    isGameOver,
    gameOverReason,
    whiteTime,
    blackTime,
    lastMove,
    makeMove,
  } = useOnlineGame(roomId, isCreator, creatorColor, initialTime);

  const [copied, setCopied] = useState(false);

  const hints = useMoveHints({
    fen,
    canMove: colorReady && turn === myColor && !isGameOver,
    lastMove,
    inCheck,
    onMove: (from, to, promotion) => makeMove({ from, to, promotion: promotion ?? 'q' }),
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(roomId);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      alert('Copiar código não foi suportado neste navegador/WebView.');
    }
  };

  const isMyTurn = turn === myColor;

  if (!isCreator && !colorReady) {
    return (
      <div className="status-card">
        <p className="eyebrow">Online</p>
        <h2>Entrando na sala</h2>
        <p className="lede">Conectando à partida {roomId}.</p>
      </div>
    );
  }

  if (gameStatus === 'waiting' && isCreator) {
    return (
      <div className="status-card">
        <p className="eyebrow">Sala criada</p>
        <h2>Aguardando oponente</h2>
        <p className="lede">Envie o código para o adversário entrar.</p>
        <div className="room-code">
          <strong>{roomId}</strong>
          <button type="button" className="btn btn-primary" onClick={handleCopyCode}>
            {copied ? 'Copiado' : 'Copiar código'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Sala {roomId}</p>
          <h1>Partida online</h1>
          <p className="lede">
            {isGameOver
              ? 'Partida encerrada'
              : isMyTurn
                ? 'Sua vez'
                : 'Aguardando o oponente'}
            {' · '}
            Você joga de {myColor === 'w' ? 'brancas' : 'pretas'}
          </p>
        </div>
      </header>

      {isGameOver && <div className="result-banner">{gameOverReason || 'Fim de jogo'}</div>}
      {inCheck && !isGameOver && <div className="check-banner">Xeque</div>}
      {hints.castleAvailable && (
        <p className="hint-note">Roque: selecione o rei e clique no ponto dourado ou na torre destacada.</p>
      )}

      <div className="clock-row">
        <span>{myColor === 'w' ? 'Pretas' : 'Brancas'}</span>
        <strong className={turn !== myColor ? 'is-active' : ''}>
          {formatTime(myColor === 'w' ? blackTime : whiteTime)}
        </strong>
      </div>


      <div className="board-wrap">
        <ChessBoardView
          fen={fen}
          orientation={myColor === 'w' ? 'white' : 'black'}
          arePiecesDraggable={colorReady && isMyTurn && !isGameOver}
          onPieceDrop={hints.onPieceDrop}
          onSquareClick={hints.onSquareClick}
          onPieceDragBegin={hints.onPieceDragBegin}
          customSquareStyles={hints.customSquareStyles}
          customArrows={hints.customArrows}
          pendingPromotion={hints.pendingPromotion}
          onPromote={hints.confirmPromotion}
          onCancelPromotion={hints.cancelPromotion}

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

      <div className="clock-row">
        <span>{myColor === 'w' ? 'Brancas (você)' : 'Pretas (você)'}</span>
        <strong className={turn === myColor ? 'is-active' : ''}>
          {formatTime(myColor === 'w' ? whiteTime : blackTime)}
        </strong>
      </div>
    </section>
  );
};

export default OnlineGame;
