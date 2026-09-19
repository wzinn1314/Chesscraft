import React, { useEffect, useRef, useState } from 'react';
import { ChessBoardView } from '../../components/ChessBoardView';
import { GameOverModal } from '../../components/GameOverModal';
import { useChessGame } from '../../hooks/useChessGame';
import { useMoveHints } from '../../hooks/useMoveHints';
import {
    getUserId,
    recordGameResult,
    type RecordedGameOutcome,
} from '../../service/userService';
import { difficultySettings } from '../../utils/chessAI';

export interface BotOpponent {
  id: number;
  name: string;
  title: string;
  level: string;
  elo: string;
  desc: string;
  avatar: string;
  color: string;
  difficulty: keyof typeof difficultySettings;
}

const BOTS_LIST: BotOpponent[] = [
  {
    id: 1,
    name: "Gloop",
    title: "O Monstrinho Curioso",
    level: "Iniciante",
    elo: "150",
    desc: "Caótico e imprevisível. Esquece peças desprotegidas e joga sem plano.",
    avatar: 'GL',
    color: "#2ecc71",
    difficulty: "beginner"
  },
  {
    id: 2,
    name: "Gargoyle",
    title: "O Guardião de Pedra",
    level: "Fácil",
    elo: "300",
    desc: "Passivo e defensivo. Evita trocas e recua peças em vez de atacar.",
    avatar: 'GA',
    color: "#3498db",
    difficulty: "easy"
  },
  {
    id: 3,
    name: "Sir Gareth",
    title: "O Cavaleiro Audaz",
    level: "Médio",
    elo: "550",
    desc: "Tático e agressivo. Ataca rápido com peças que saltam, mas peca no final.",
    avatar: 'SG',
    color: "#f1c40f",
    difficulty: "medium"
  },
  {
    id: 4,
    name: "Archmage Ignis",
    title: "O Feiticeiro",
    level: "Difícil",
    elo: "800",
    desc: "Calculista. Domina o centro e explora falhas na estrutura de peões.",
    avatar: 'AI',
    color: "#e67e22",
    difficulty: "hard"
  },
  {
    id: 5,
    name: "Vespera",
    title: "A Rainha das Sombras",
    level: "Mestre",
    elo: "1050",
    desc: "Pressionadora. Pune erros mínimos e cria combinações fatais.",
    avatar: 'VE',
    color: "#9b59b6",
    difficulty: "expert"
  },
  {
    id: 6,
    name: "CHESS-MIND 9000",
    title: "O Núcleo IA",
    level: "Hardcore",
    elo: "1300",
    desc: "Perfeição matemática. Calcula milhões de lances sem cometer erros.",
    avatar: 'CM',
    color: "#e74c3c",
    difficulty: "expert"
  }
];

export const GameArenaAI: React.FC<{ playerName: string; onGoHome: () => void }> = ({
  playerName,
  onGoHome,
}) => {
  const [selectedBot, setSelectedBot] = useState<BotOpponent | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<RecordedGameOutcome | null>(null);
  const recordedRef = useRef(false);
  const {
    fen,
    turn,
    isGameOver,
    gameResult,
    winner,
    isDraw,
    inCheck,
    lastMove,
    moveCount,
    makeMove,
    makeAIMove,
    resetGame,
  } = useChessGame();

  useEffect(() => {
    if (gameStarted && selectedBot && turn === 'b' && !isGameOver) {
      const timer = window.setTimeout(() => makeAIMove(selectedBot.difficulty), 180);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [turn, isGameOver, makeAIMove, selectedBot, gameStarted]);

  useEffect(() => {
    if (!gameStarted || !selectedBot || !isGameOver || recordedRef.current) return;

    recordedRef.current = true;
    const result: RecordedGameOutcome['result'] = isDraw ? 'draw' : winner === 'w' ? 'win' : 'loss';
    const signature = `${playerName}|${fen}|${result}|${moveCount}`;
    if (sessionStorage.getItem(`chesscraft_recorded_${signature}`)) return;
    sessionStorage.setItem(`chesscraft_recorded_${signature}`, '1');

    void recordGameResult(
      getUserId(playerName),
      result,
      selectedBot.name,
      'ai',
      moveCount,
    ).then(setOutcome);
  }, [gameStarted, selectedBot, isGameOver, isDraw, winner, moveCount, playerName, fen]);
  const hints = useMoveHints({
    fen,
    canMove: turn === 'w' && gameStarted && !isGameOver,
    lastMove,
    inCheck,
    onMove: (from, to, promotion) => makeMove({ from, to, promotion: promotion ?? 'q' }),
  });

  const handleSelectBot = (bot: BotOpponent) => {
    recordedRef.current = false;
    setOutcome(null);
    setSelectedBot(bot);
    setGameStarted(true);
    resetGame();
  };

  const handleBackToSelection = () => {
    recordedRef.current = false;
    setOutcome(null);
    setGameStarted(false);
    setSelectedBot(null);
    resetGame();
  };

  const handlePlayAgain = () => {
    recordedRef.current = false;
    setOutcome(null);
    resetGame();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {!gameStarted ? (
        <>
          <div>
            <h1 style={{ fontSize: '28px', color: '#ffffff', margin: '0 0 4px 0', fontWeight: 'bold' }}>
              Contra o computador
            </h1>
            <p style={{ color: '#bab4ab', margin: 0, fontSize: '15px' }}>
              Escolha seu oponente, <strong style={{ color: '#e58e26' }}>{playerName}</strong>.
            </p>
          </div>


          <div className="bot-selection-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {BOTS_LIST.map((bot) => (
              <div
                key={bot.id}
                onClick={() => handleSelectBot(bot)}
                style={{
                  backgroundColor: '#161512',
                  border: '2px solid #2d2b27',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = bot.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${bot.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2d2b27';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: bot.color,
                  backgroundColor: `${bot.color}15`,
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  border: `2px solid ${bot.color}40`
                }}>
                  {bot.avatar}
                </div>

                <div>
                  <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
                    {bot.name}
                  </div>
                  <div style={{ color: bot.color, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {bot.title}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: `${bot.color}20`,
                    color: bot.color,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: `1px solid ${bot.color}40`
                  }}>
                    {bot.level}
                  </div>
                </div>

                <div style={{ color: '#bab4ab', fontSize: '13px', lineHeight: '1.4' }}>
                  {bot.desc}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid #2d2b27'
                }}>
                  <span style={{ color: '#78736C', fontSize: '12px' }}>Elo</span>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>{bot.elo}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#ffffff', margin: '0 0 4px 0', fontWeight: 'bold' }}>
                {selectedBot?.name}
              </h1>
              <p style={{ color: '#bab4ab', margin: 0, fontSize: '14px' }}>
                {selectedBot?.title} • Elo {selectedBot?.elo}
              </p>
            </div>
            <button
              onClick={handleBackToSelection}
              style={{
                backgroundColor: '#2d2b27',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ← Trocar Oponente
            </button>
          </div>


          <div className="game-arena-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>

            <div className="chessboard-container" style={{ width: '100%', maxWidth: '560px', justifySelf: 'center' }}>
              <ChessBoardView
                fen={fen}
                orientation="white"
                arePiecesDraggable={turn === 'w' && !isGameOver}
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


            <div style={{
              backgroundColor: '#21201d',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #2d2b27',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ padding: '16px', backgroundColor: '#161512', borderRadius: '12px', border: '1px solid #2d2b27', textAlign: 'center' }}>
                <div style={{ color: '#bab4ab', fontSize: '14px', marginBottom: '8px' }}>VEZ DE JOGAR</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: turn === 'w' ? '#e58e26' : selectedBot?.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  {turn === 'w' ? (
                    <span>Sua vez · brancas</span>
                  ) : (
                    <span>{selectedBot?.name} pensando...</span>
                  )}
                </div>
              </div>

              {hints.castleAvailable && (
                <p className="hint-note">
                  Roque disponível: selecione o rei e clique no ponto dourado ou na torre.
                </p>
              )}

              {isGameOver && (
                <div style={{
                  backgroundColor: winner === 'w' ? 'rgba(98, 153, 36, 0.15)' : 'rgba(201, 52, 52, 0.15)',
                  border: `1px solid ${winner === 'w' ? '#629924' : '#c93434'}`,
                  color: winner === 'w' ? '#81b64c' : '#ff6b6b',
                  padding: '16px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  {gameResult}
                </div>
              )}

              <button
                onClick={handlePlayAgain}
                style={{
                  backgroundColor: '#e58e26',
                  color: '#161512',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: 'auto'
                }}
              >
                Reiniciar partida
              </button>
            </div>

          </div>

          {outcome && selectedBot && (
            <GameOverModal
              outcome={outcome}
              opponentName={selectedBot.name}
              onHome={onGoHome}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GameArenaAI;
