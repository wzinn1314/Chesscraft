import React, { useState } from 'react';
import { ChessBoardView } from '../../components/ChessBoardView';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { usePuzzle } from '../../hooks/usePuzzle';

const theme = {
  colors: {
    background: '#121110',
    surface: '#1c1b18',
    border: '#2d2b27',
    borderLight: '#3d3a34',
    primary: '#e58e26',
    success: '#629924',
    loss: '#c93434',
    textPrimary: '#ffffff',
    textSecondary: '#bab4ab',
    textMuted: '#78736c',
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '18px',
  },
};

export const PuzzlesArena: React.FC = () => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showHint, setShowHint] = useState(false);

  const {
    puzzle,
    chess,
    isSolved,
    isFailed,
    loading,
    makeMove,
    loadNewPuzzle,
    resetPuzzle,
    skipPuzzle,
    getHint,
    stats
  } = usePuzzle({
    difficulty,
    onSolve: () => {
      setShowHint(false);
    },
    onFail: () => {
      setShowHint(false);
    }
  });

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    setShowHint(false);
    loadNewPuzzle(newDifficulty);
  };

  const handlePieceDrop = (source: string, target: string): boolean => {
    return makeMove(source, target);
  };

  const handleSquareClick = (square: string) => {
    if (isSolved || isFailed) return;

    const moves = chess.moves({ square: square as any, verbose: true });
    if (moves.length === 1) {
      makeMove(square, moves[0].to, moves[0].promotion);
    }
  };

  const handlePieceDragBegin = (_piece: string, _square: string) => {
  };

  const customSquareStyles: Record<string, React.CSSProperties> = {};

  const hint = getHint();

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }} role="main" aria-label="Arena de puzzles táticos">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: theme.colors.textPrimary, margin: '0 0 4px 0', fontWeight: 800 }}>
            Puzzles Táticos
          </h1>
          <p style={{ color: theme.colors.textSecondary, margin: 0, fontSize: '15px' }}>
            Resolva problemas táticos para melhorar sua visão de jogo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} role="status" aria-live="polite">
          <div style={{
            backgroundColor: theme.colors.surface,
            padding: '10px 18px',
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`
          }}>
            <span style={{ color: theme.colors.textSecondary, fontSize: '13px' }}>Sequência: </span>
            <strong style={{ color: theme.colors.primary, fontSize: '16px' }}>{stats.currentStreak}</strong>
          </div>

          <div style={{
            backgroundColor: theme.colors.surface,
            padding: '10px 18px',
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`
          }}>
            <span style={{ color: theme.colors.textSecondary, fontSize: '13px' }}>Resolvidos: </span>
            <strong style={{ color: theme.colors.success, fontSize: '16px' }}>{stats.totalSolved}</strong>
          </div>
        </div>
      </div>


      <div style={{ display: 'flex', gap: '8px' }} role="group" aria-label="Seletor de dificuldade">
        {(['easy', 'medium', 'hard'] as const).map((diff) => (
          <Button
            key={diff}
            variant={difficulty === diff ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleDifficultyChange(diff)}
            aria-pressed={difficulty === diff}
          >
            {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Médio' : 'Difícil'}
          </Button>
        ))}
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 560px) minmax(240px, 1fr)', gap: '28px', alignItems: 'start' }}>


        <div className="board-wrap">
          {loading ? (
            <div style={{
              width: '100%',
              height: '560px',
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textSecondary
            }}>
              Carregando puzzle...
            </div>
          ) : (
            <ChessBoardView
              fen={chess.fen()}
              orientation={puzzle?.color === 'b' ? 'black' : 'white'}
              arePiecesDraggable={!isSolved && !isFailed}
              onPieceDrop={handlePieceDrop}
              onSquareClick={handleSquareClick}
              onPieceDragBegin={handlePieceDragBegin}
              customSquareStyles={customSquareStyles}
            />
          )}
        </div>


        <Card variant="default" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {puzzle && (
            <>
              <div>
                <Badge variant="primary" size="sm" style={{ marginBottom: '8px' }}>
                  {puzzle.difficulty === 'easy' ? 'Fácil' : puzzle.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                </Badge>
                <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>
                  {puzzle.description}
                </h3>
                <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: 0 }}>
                  Rating: {puzzle.rating}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: theme.colors.textMuted, marginBottom: '8px', fontWeight: 700 }}>
                  TEMAS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {puzzle.themes.map((themeName) => (
                    <Badge key={themeName} variant="default" size="sm">
                      {themeName}
                    </Badge>
                  ))}
                </div>
              </div>

              {isSolved && (
                <Card variant="bordered" padding="md" style={{ textAlign: 'center', backgroundColor: 'rgba(98, 153, 36, 0.12)', borderColor: theme.colors.success }}>
                  <div style={{ color: theme.colors.success, fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
                    Puzzle resolvido
                  </div>
                  <div style={{ color: theme.colors.textSecondary, fontSize: '13px' }}>
                    Solução registrada nas suas estatísticas.
                  </div>
                </Card>
              )}

              {isFailed && (
                <Card variant="bordered" padding="md" style={{ textAlign: 'center', backgroundColor: 'rgba(201, 52, 52, 0.12)', borderColor: theme.colors.loss }}>
                  <div style={{ color: theme.colors.loss, fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
                    Movimento incorreto
                  </div>
                  <div style={{ color: theme.colors.textSecondary, fontSize: '13px' }}>
                    Tente novamente ou pule para o próximo.
                  </div>
                </Card>
              )}

              {showHint && hint && (
                <Card variant="bordered" padding="md" style={{ backgroundColor: 'rgba(229, 142, 38, 0.12)', borderColor: theme.colors.primary }}>
                  <div style={{ fontSize: '12px', color: theme.colors.textMuted, marginBottom: '4px', fontWeight: 700 }}>
                    DICAS
                  </div>
                  <div style={{ color: theme.colors.primary, fontSize: '14px', fontWeight: 600 }}>
                    Tente o movimento: {hint}
                  </div>
                </Card>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                {!isSolved && !isFailed && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowHint(!showHint)}
                  >
                    {showHint ? 'Esconder Dica' : 'Mostrar Dica'}
                  </Button>
                )}

                {(isSolved || isFailed) && (
                  <Button
                    variant="primary"
                    onClick={() => loadNewPuzzle()}
                  >
                    Próximo Puzzle
                  </Button>
                )}

                {isFailed && (
                  <Button
                    variant="secondary"
                    onClick={resetPuzzle}
                  >
                    Tentar Novamente
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipPuzzle}
                  style={{ color: theme.colors.textMuted, border: 'none' }}
                >
                  Pular Puzzle
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>


      <Card variant="default" padding="lg">
        <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>
          Estatísticas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
              TOTAL RESOLVIDOS
            </div>
            <div style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 800 }}>
              {stats.totalSolved}
            </div>
          </div>
          <div>
            <div style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
              MELHOR SEQUÊNCIA
            </div>
            <div style={{ color: theme.colors.primary, fontSize: '24px', fontWeight: 800 }}>
              {stats.bestStreak}
            </div>
          </div>
          <div>
            <div style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
              TEMPO MÉDIO
            </div>
            <div style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 800 }}>
              {Math.round(stats.averageTime / 1000)}s
            </div>
          </div>
          <div>
            <div style={{ color: theme.colors.textMuted, fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
              TAXA DE SUCESSO
            </div>
            <div style={{ color: theme.colors.success, fontSize: '24px', fontWeight: 800 }}>
              {stats.totalAttempted > 0
                ? Math.round((stats.totalSolved / stats.totalAttempted) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PuzzlesArena;
