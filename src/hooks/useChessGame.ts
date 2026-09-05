import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { getAIMove, difficultySettings } from '../utils/chessAI';

export const useChessGame = () => {
  const [game, setGame] = useState(new Chess());

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move(move);
      if (result) {
        setGame(newGame);
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
  }, [game]);

  const makeAIMove = useCallback((difficulty: keyof typeof difficultySettings = 'medium') => {
    if (game.isGameOver()) return;

    const aiMove = getAIMove(game, difficulty);
    if (aiMove) {
      const newGame = new Chess(game.fen());
      newGame.move(aiMove);
      setGame(newGame);
    }
  }, [game]);

  const resetGame = useCallback(() => {
    setGame(new Chess());
  }, []);

  const isCheckmate = game.isCheckmate();
  const isDraw = game.isDraw();
  const winner = isCheckmate ? (game.turn() === 'w' ? 'b' : 'w') : null;

  return {
    fen: game.fen(),
    turn: game.turn(),
    isGameOver: game.isGameOver(),
    isCheckmate,
    isDraw,
    winner,
    moveCount: game.history().length,
    gameResult: isCheckmate
      ? `Xeque-mate! ${winner === 'w' ? 'Brancas' : 'Pretas'} venceram.`
      : isDraw
      ? 'Empate!'
      : null,
    makeMove,
    makeRandomMove,
    makeAIMove,
    resetGame,
  };
};