import React from 'react';
import { ChessBoardView } from '../../components/ChessBoardView';
import { useChessGame } from '../../hooks/useChessGame';
import { useMoveHints } from '../../hooks/useMoveHints';

export const GameArenaLocal: React.FC = () => {
  const { fen, turn, isGameOver, gameResult, makeMove, resetGame, lastMove, inCheck, moveHistory } = useChessGame();

  const hints = useMoveHints({
    fen,
    canMove: !isGameOver,
    lastMove,
    inCheck,
    onMove: (from, to, promotion) => makeMove({ from, to, promotion: promotion ?? 'q' }),
  });

  return (

    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Mesa local</p>
          <h1>Passa e joga</h1>
          <p className="lede">Dois jogadores no mesmo dispositivo. Roque, en passant e promoção seguem as regras oficiais.</p>

    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#ffffff', marginBottom: '8px' }}>⚔️ Passa & Joga (Local)</h1>
      <p style={{ color: '#a8a8b3', marginBottom: '24px' }}>Modo local para dois jogadores no mesmo dispositivo.</p>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          {/* @ts-ignore */}
          <Chessboard 
            position={fen} 
            onPieceDrop={handlePieceDrop}
            boardOrientation="white"
            customBoardStyle={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
          />

        </div>
      </header>

      <div className="arena">
        <ChessBoardView
          fen={fen}
          arePiecesDraggable={!isGameOver}
          onPieceDrop={hints.onPieceDrop}
          onSquareClick={hints.onSquareClick}
          onPieceDragBegin={hints.onPieceDragBegin}
          customSquareStyles={hints.customSquareStyles}
          customArrows={hints.customArrows}
          pendingPromotion={hints.pendingPromotion}
          onPromote={hints.confirmPromotion}
          onCancelPromotion={hints.cancelPromotion}
        />

        <aside className="panel">
          <h3>Partida</h3>
          <div className={`turn-chip ${turn === 'w' ? 'is-white' : 'is-black'}`}>
            Vez das {turn === 'w' ? 'brancas' : 'pretas'}
          </div>

          {hints.castleAvailable && (
            <p className="hint-note">
              Roque disponível: selecione o rei e clique no ponto dourado (casa do rei) ou no anel na torre.
            </p>
          )}

          {isGameOver && <div className="result-banner">{gameResult}</div>}

          {moveHistory.length > 0 && (
            <ol className="move-list">
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                <li key={i}>
                  <span>{i + 1}.</span>
                  <strong>{moveHistory[i * 2]}</strong>
                  {moveHistory[i * 2 + 1] ? <strong>{moveHistory[i * 2 + 1]}</strong> : null}
                </li>
              ))}
            </ol>
          )}

          <button type="button" className="btn btn-primary" onClick={resetGame}>
            Nova partida
          </button>
        </aside>
      </div>
    </section>
  );
};

export default GameArenaLocal;
