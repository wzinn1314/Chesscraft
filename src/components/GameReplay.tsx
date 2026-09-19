import { useState, useEffect } from 'react';
import React from 'react';
import { Chess } from 'chess.js';
import { ChessBoardView } from './ChessBoardView';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { exportGameToPGN, importPGN, type PGNGame } from '../utils/pgn';
import { logger } from '../utils/logger';

interface GameReplayProps {
  initialPGN?: string;
  onClose?: () => void;
}

export const GameReplay: React.FC<GameReplayProps> = ({ initialPGN, onClose }) => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [moves, setMoves] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [pgn, setPgn] = useState<string>(initialPGN || '');
  const [gameInfo, setGameInfo] = useState<PGNGame | null>(null);
  const [showPGNInput, setShowPGNInput] = useState(false);

  useEffect(() => {
    if (initialPGN) {
      loadPGN(initialPGN);
    }
  }, [initialPGN]);

  const loadPGN = (pgnString: string) => {
    try {
      logger.info('Carregando PGN', 'GameReplay');
      const newGame = importPGN(pgnString);
      const history = newGame.history();
      setGame(newGame);
      setMoves(history);
      setCurrentMoveIndex(history.length - 1);
      setPgn(pgnString);
      
      // Parse game info
      const info: PGNGame = { moves: history };
      const headerRegex = /\[([A-Za-z]+)\s+"([^"]+)"\]/g;
      let match;
      while ((match = headerRegex.exec(pgnString)) !== null) {
        const [, key, value] = match;
        (info as any)[key.toLowerCase()] = value;
      }
      setGameInfo(info);
      
      logger.info('PGN carregado com sucesso', 'GameReplay', { moveCount: history.length });
    } catch (error) {
      logger.error('Erro ao carregar PGN', 'GameReplay', { error });
      alert('Erro ao carregar PGN. Verifique o formato.');
    }
  };

  const goToMove = (index: number) => {
    const newGame = new Chess();
    for (let i = 0; i <= index && i < moves.length; i++) {
      newGame.move(moves[i]);
    }
    setGame(newGame);
    setCurrentMoveIndex(index);
  };

  const goToStart = () => goToMove(-1);
  const goToEnd = () => goToMove(moves.length - 1);
  const goBack = () => goToMove(Math.max(-1, currentMoveIndex - 1));
  const goForward = () => goToMove(Math.min(moves.length - 1, currentMoveIndex + 1));

  const handleExportPGN = () => {
    const currentPGN = exportGameToPGN(game, gameInfo || undefined);
    navigator.clipboard.writeText(currentPGN);
    alert('PGN copiado para a área de transferência!');
    logger.info('PGN exportado', 'GameReplay');
  };

  const handleImportPGN = () => {
    if (pgn.trim()) {
      loadPGN(pgn);
      setShowPGNInput(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#f3efe6', margin: 0, fontSize: '28px', fontWeight: 800 }}>
          Replay de Partida
        </h1>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(280px, 1fr)', gap: '24px' }}>
        {/* Board */}
        <div>
          <ChessBoardView
            fen={game.fen()}
            onPieceDrop={() => false}
            onSquareClick={() => {}}
            onPieceDragBegin={() => {}}
            customSquareStyles={{}}
            orientation="white"
            arePiecesDraggable={false}
          />

          {/* Controls */}
          <Card variant="default" padding="md" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Button variant="secondary" size="sm" onClick={goToStart} aria-label="Ir para o início">
                ⏮
              </Button>
              <Button variant="secondary" size="sm" onClick={goBack} aria-label="Movimento anterior">
                ◀
              </Button>
              <Button variant="secondary" size="sm" onClick={goForward} aria-label="Próximo movimento">
                ▶
              </Button>
              <Button variant="secondary" size="sm" onClick={goToEnd} aria-label="Ir para o final">
                ⏭
              </Button>
            </div>
          </Card>
        </div>

        {/* Move List & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Game Info */}
          {gameInfo && (
            <Card variant="default" padding="md">
              <h3 style={{ color: '#f3efe6', margin: '0 0 12px', fontSize: '16px', fontWeight: 700 }}>
                Informações da Partida
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', fontSize: '14px' }}>
                {gameInfo.white && (
                  <>
                    <span style={{ color: '#bab4ab' }}>Brancas:</span>
                    <span style={{ color: '#f3efe6', fontWeight: 600 }}>{gameInfo.white}</span>
                  </>
                )}
                {gameInfo.black && (
                  <>
                    <span style={{ color: '#bab4ab' }}>Pretas:</span>
                    <span style={{ color: '#f3efe6', fontWeight: 600 }}>{gameInfo.black}</span>
                  </>
                )}
                {gameInfo.result && (
                  <>
                    <span style={{ color: '#bab4ab' }}>Resultado:</span>
                    <Badge variant={gameInfo.result === '1-0' ? 'success' : gameInfo.result === '0-1' ? 'danger' : 'default'} size="sm">
                      {gameInfo.result}
                    </Badge>
                  </>
                )}
                {gameInfo.date && (
                  <>
                    <span style={{ color: '#bab4ab' }}>Data:</span>
                    <span style={{ color: '#f3efe6' }}>{gameInfo.date}</span>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Move Counter */}
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#bab4ab', fontSize: '14px' }}>
                Movimento: {currentMoveIndex + 1} / {moves.length}
              </span>
              <Badge variant="primary" size="sm">
                {currentMoveIndex === -1 ? 'Posição inicial' : moves[currentMoveIndex]}
              </Badge>
            </div>
          </Card>

          {/* Move List */}
          <Card variant="default" padding="md" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <h3 style={{ color: '#f3efe6', margin: '0 0 12px', fontSize: '16px', fontWeight: 700 }}>
              Lista de Movimentos
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '8px', fontSize: '14px' }}>
              {moves.map((move, index) => {
                const isWhite = index % 2 === 0;
                if (!isWhite) return null; // Only show white moves as row headers
                
                const blackMove = moves[index + 1];
                const moveNumber = Math.floor(index / 2) + 1;
                
                return (
                  <React.Fragment key={index}>
                    <span style={{ color: '#78736c' }}>{moveNumber}.</span>
                    <button
                      type="button"
                      onClick={() => goToMove(index)}
                      style={{
                        backgroundColor: currentMoveIndex === index ? '#e58e26' : 'transparent',
                        color: currentMoveIndex === index ? '#161512' : '#f3efe6',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: currentMoveIndex === index ? 700 : 400,
                      }}
                    >
                      {move}
                    </button>
                    {blackMove && (
                      <button
                        type="button"
                        onClick={() => goToMove(index + 1)}
                        style={{
                          backgroundColor: currentMoveIndex === index + 1 ? '#e58e26' : 'transparent',
                          color: currentMoveIndex === index + 1 ? '#161512' : '#f3efe6',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: currentMoveIndex === index + 1 ? 700 : 400,
                        }}
                      >
                        {blackMove}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </Card>

          {/* PGN Actions */}
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="sm" onClick={handleExportPGN} fullWidth>
                📋 Copiar PGN
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowPGNInput(!showPGNInput)} fullWidth>
                📥 Importar PGN
              </Button>
            </div>
            
            {showPGNInput && (
              <div style={{ marginTop: '12px' }}>
                <textarea
                  value={pgn}
                  onChange={(e) => setPgn(e.target.value)}
                  placeholder="Cole o PGN aqui..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    backgroundColor: '#121110',
                    border: '1px solid #2d2b27',
                    borderRadius: '8px',
                    color: '#f3efe6',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <Button variant="primary" size="sm" onClick={handleImportPGN} style={{ marginTop: '8px' }} fullWidth>
                  Carregar PGN
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameReplay;