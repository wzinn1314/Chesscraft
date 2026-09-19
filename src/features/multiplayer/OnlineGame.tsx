import React, { useEffect, useRef, useState } from 'react';
import { ChessBoardView } from '../../components/ChessBoardView';
import { useMoveHints } from '../../hooks/useMoveHints';
import { useOnlineGame } from '../../hooks/useOnlineGame';
import { Chat } from '../../components/Chat';
import { getUserId, loadActiveSession, recordGameResult, type RecordedGameOutcome } from '../../service/userService';
import { GameOverModal } from '../../components/GameOverModal';

interface OnlineGameProps {
  roomId: string;
  isCreator: boolean;
  creatorColor?: 'w' | 'b';
  initialTime?: number;
  onGoHome?: () => void;
}

export const OnlineGame: React.FC<OnlineGameProps> = ({
  roomId,
  isCreator,
  creatorColor = 'w',
  initialTime = 300,
  onGoHome,
}) => {
  const activeSession = loadActiveSession();
  const chatName = activeSession?.name ?? 'Jogador';
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
    whitePlayerName,
    blackPlayerName,
  } = useOnlineGame(roomId, isCreator, creatorColor, initialTime, chatName);

  const [copied, setCopied] = useState(false);
  const [outcome, setOutcome] = useState<RecordedGameOutcome | null>(null);
  const recordedRef = useRef(false);

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMyTurn = turn === myColor;
  const isDraw = gameOverReason.toLowerCase().includes('empate');
  const opponentName = myColor === 'w' ? blackPlayerName : whitePlayerName;
  const winnerColor = turn === 'w' ? 'b' : 'w';
  const winnerName = winnerColor === 'w' ? whitePlayerName : blackPlayerName;
  const loserName = winnerColor === 'w' ? blackPlayerName : whitePlayerName;
  const resultSummary = isDraw
    ? `${whitePlayerName} empatou com ${blackPlayerName}`
    : `${winnerName} ganhou de ${loserName}`;

  useEffect(() => {
    if (!isGameOver || !colorReady || recordedRef.current) return;
    recordedRef.current = true;
    const winner = turn === 'w' ? 'b' : 'w';
    const result: RecordedGameOutcome['result'] = isDraw ? 'draw' : winner === myColor ? 'win' : 'loss';
    const recordKey = `chesscraft_online_recorded_${roomId}_${getUserId(chatName)}`;
    if (sessionStorage.getItem(recordKey)) return;
    sessionStorage.setItem(recordKey, '1');
    void recordGameResult(getUserId(chatName), result, opponentName, 'human').then(setOutcome);
  }, [isGameOver, colorReady, turn, myColor, isDraw, roomId, chatName, opponentName]);

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
        />
      </div>

      <div className="clock-row">
        <span>{myColor === 'w' ? 'Brancas (você)' : 'Pretas (você)'}</span>
        <strong className={turn === myColor ? 'is-active' : ''}>
          {formatTime(myColor === 'w' ? whiteTime : blackTime)}
        </strong>
      </div>
      <Chat roomId={roomId} currentUserId={getUserId(chatName)} currentUserName={chatName} />
      {outcome && <GameOverModal outcome={outcome} opponentName={opponentName} resultSummary={resultSummary} gameOverReason={gameOverReason} onHome={onGoHome ?? (() => undefined)} />}
    </section>
  );
};

export default OnlineGame;
