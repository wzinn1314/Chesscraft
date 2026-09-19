import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { puzzleService } from '../service/puzzleService';
import { logger } from '../utils/logger';
import type { Puzzle, PuzzleAttempt } from '../types/puzzle';

interface UsePuzzleOptions {
  difficulty?: 'easy' | 'medium' | 'hard';
  onSolve?: (puzzle: Puzzle) => void;
  onFail?: (puzzle: Puzzle) => void;
}

export const usePuzzle = (options: UsePuzzleOptions = {}) => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [chess] = useState(() => new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  const attemptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadNewPuzzle = useCallback(() => {
    setLoading(true);
    try {
      const newPuzzle = puzzleService.getRandomPuzzle(options.difficulty);
      chess.load(newPuzzle.fen);
      setPuzzle(newPuzzle);
      setCurrentMoveIndex(0);
      setIsSolved(false);
      setIsFailed(false);
      setUserMoves([]);
      setStartTime(Date.now());
      logger.info('Puzzle carregado com sucesso', 'usePuzzle', { puzzleId: newPuzzle.id, difficulty: options.difficulty });
    } catch (error) {
      logger.error('Erro ao carregar puzzle', 'usePuzzle', { error, difficulty: options.difficulty });
      console.error('Erro ao carregar puzzle:', error);
    } finally {
      setLoading(false);
    }
  }, [chess, options.difficulty]);

  const makeMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!puzzle || isSolved || isFailed) return false;

    try {
      const expectedMove = puzzleService.getNextPuzzleMove(puzzle, currentMoveIndex);
      if (!expectedMove) return false;

      const moveResult = chess.move({ from, to, promotion });
      if (!moveResult) return false;

      const userMove = `${from}${to}${promotion || ''}`;
      const newMoves = [...userMoves, userMove];
      setUserMoves(newMoves);

      // Verificar se o movimento está correto
      const isCorrect = userMove === expectedMove;
      
      if (!isCorrect) {
        // Movimento incorreto
        setIsFailed(true);
        const attempt: PuzzleAttempt = {
          puzzleId: puzzle.id,
          solved: false,
          attempts: newMoves.length,
          timeSpent: Date.now() - startTime,
          date: Date.now()
        };
        puzzleService.recordAttempt(attempt);
        logger.warn('Movimento incorreto', 'usePuzzle', { puzzleId: puzzle.id, move: userMove, expected: expectedMove });
        options.onFail?.(puzzle);
        
        // Desfazer movimento incorreto
        chess.undo();
        return false;
      }

      const nextIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(nextIndex);

      // Verificar se puzzle foi resolvido
      if (nextIndex >= puzzle.moves.length) {
        setIsSolved(true);
        const attempt: PuzzleAttempt = {
          puzzleId: puzzle.id,
          solved: true,
          attempts: newMoves.length,
          timeSpent: Date.now() - startTime,
          date: Date.now()
        };
        puzzleService.recordAttempt(attempt);
        logger.info('Puzzle resolvido com sucesso', 'usePuzzle', { puzzleId: puzzle.id, attempts: newMoves.length, timeSpent: Date.now() - startTime });
        options.onSolve?.(puzzle);
        return true;
      }

      // Fazer o movimento do oponente (se houver)
      const opponentMove = puzzleService.getNextPuzzleMove(puzzle, nextIndex);
      if (opponentMove) {
        const fromSquare = opponentMove.substring(0, 2);
        const toSquare = opponentMove.substring(2, 4);
        const promotionPiece = opponentMove.length > 4 ? opponentMove[4] : undefined;
        
        chess.move({ from: fromSquare, to: toSquare, promotion: promotionPiece });
        setCurrentMoveIndex(nextIndex + 1);
      }

      return true;
    } catch (error) {
      console.error('Erro ao fazer movimento:', error);
      return false;
    }
  }, [puzzle, currentMoveIndex, isSolved, isFailed, userMoves, startTime, chess, options]);

  const resetPuzzle = useCallback(() => {
    if (!puzzle) return;
    
    chess.load(puzzle.fen);
    setCurrentMoveIndex(0);
    setIsSolved(false);
    setIsFailed(false);
    setUserMoves([]);
    setStartTime(Date.now());
  }, [puzzle, chess]);

  const skipPuzzle = useCallback(() => {
    if (!puzzle) return;
    
    const attempt: PuzzleAttempt = {
      puzzleId: puzzle.id,
      solved: false,
      attempts: userMoves.length,
      timeSpent: Date.now() - startTime,
      date: Date.now()
    };
    puzzleService.recordAttempt(attempt);
    loadNewPuzzle();
  }, [puzzle, userMoves, startTime, loadNewPuzzle]);

  const getHint = useCallback((): string | null => {
    if (!puzzle || isSolved || isFailed) return null;
    
    const expectedMove = puzzleService.getNextPuzzleMove(puzzle, currentMoveIndex);
    if (!expectedMove) return null;
    
    const from = expectedMove.substring(0, 2);
    const to = expectedMove.substring(2, 4);
    return `${from}-${to}`;
  }, [puzzle, currentMoveIndex, isSolved, isFailed]);

  // Carregar puzzle inicial
  useEffect(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (attemptTimeoutRef.current) {
        clearTimeout(attemptTimeoutRef.current);
      }
    };
  }, []);

  return {
    puzzle,
    chess,
    currentMoveIndex,
    isSolved,
    isFailed,
    userMoves,
    loading,
    makeMove,
    loadNewPuzzle,
    resetPuzzle,
    skipPuzzle,
    getHint,
    stats: puzzleService.getStats()
  };
};