import { useCallback, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { difficultySettings, getAIMove } from '../utils/chessAI';
import { playSound } from '../utils/audio';

export const useChessGame = () => {
  const [game, setGame] = useState(new Chess());

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move(move);
      if (result) {
        setGame(newGame);
        playSound(result.captured ? 'capture' : 'move');
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [game]);

  const makeRandomMove = useCallback(() => {
    const possibleMoves = game.moves({ verbose: true });
    if (game.isGameOver() || possibleMoves.length === 0) return;

    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    const newGame = new Chess(game.fen());
      newGame.move(randomMove);
      setGame(newGame);
      playSound(randomMove.captured ? 'capture' : 'move');
  }, [game]);

  const makeAIMove = useCallback((difficulty: keyof typeof difficultySettings = 'medium') => {
    if (game.isGameOver()) return;

    const aiMove = getAIMove(game, difficulty);
    if (aiMove) {
      const newGame = new Chess(game.fen());
      newGame.move(aiMove);
      setGame(newGame);
      playSound('move');
    }
  }, [game]);

  const resetGame = useCallback(() => {
    setGame(new Chess());
  }, []);

  const history = game.history({ verbose: true });
  const last = history.at(-1);
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw = game.isDraw();
  const winner = isCheckmate ? (game.turn() === 'w' ? 'b' : 'w') : null;

  return {
    fen: game.fen(),
    turn: game.turn(),
    isGameOver: game.isGameOver(),
    isCheckmate,
    isStalemate,
    isDraw,
    inCheck: game.inCheck(),
    winner,
    moveCount: history.length,
    lastMove: last ? { from: last.from as Square, to: last.to as Square } : null,
    moveHistory: game.history(),
    gameResult: isCheckmate
      ? `Xeque-mate. ${winner === 'w' ? 'Brancas' : 'Pretas'} venceram.`
      : isStalemate
        ? 'Empate por afogamento.'
        : isDraw
          ? 'Empate.'
          : null,
    makeMove,
    makeRandomMove,
    makeAIMove,
    resetGame,
  };
};
