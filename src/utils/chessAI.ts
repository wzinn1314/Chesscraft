import { Chess } from 'chess.js';

// Valores base das peças (simplificado para performance)
const pieceValues: { [key: string]: number } = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Função de avaliação simplificada e rápida
const evaluateBoardSimple = (game: Chess): number => {
  let score = 0;
  const board = game.board();
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = pieceValues[piece.type];
        if (piece.color === 'w') {
          score += value;
        } else {
          score -= value;
        }
      }
    }
  }
  
  return score;
};

// Avaliação de movimento simples (material + capturas)
const evaluateMove = (game: Chess, move: any): number => {
  let score = 0;
  
  // Valor da peça capturada
  if (move.captured) {
    score += pieceValues[move.captured] * 10;
  }
  
  // Promoção de peão
  if (move.promotion) {
    score += (pieceValues[move.promotion] - pieceValues['p']) * 5;
  }
  
  // Xeque
  if (game.inCheck()) {
    score += 50;
  }
  
  return score;
};

// Algoritmo minimax extremamente simplificado para performance
const minimaxSimple = (
  game: Chess,
  depth: number,
  isMaximizing: boolean
): number => {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoardSimple(game);
  }

  const moves = game.moves({ verbose: true });
  
  // Limitar drasticamente os movimentos para performance
  const maxMoves = Math.min(moves.length, 5);
  const consideredMoves = moves.slice(0, maxMoves);
  
  // Ordenar por capturas (simplificado)
  consideredMoves.sort((a, b) => {
    const aScore = a.captured ? pieceValues[a.captured] : 0;
    const bScore = b.captured ? pieceValues[b.captured] : 0;
    return bScore - aScore;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of consideredMoves) {
      game.move(move);
      const evalScore = minimaxSimple(game, depth - 1, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of consideredMoves) {
      game.move(move);
      const evalScore = minimaxSimple(game, depth - 1, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
    }
    return minEval;
  }
};

// Função ultra-rápida para obter movimento
export const getBestMove = (game: Chess, difficulty: number = 1): string | null => {
  const moves = game.moves({ verbose: true });
  
  if (moves.length === 0) return null;
  
  // Para dificuldade 1, usar apenas avaliação de movimento (sem minimax)
  if (difficulty === 1) {
    let bestMove = moves[0];
    let bestScore = -Infinity;
    
    // Limitar a 8 movimentos para máxima velocidade
    const maxMoves = Math.min(moves.length, 8);
    const consideredMoves = moves.slice(0, maxMoves);
    
    for (const move of consideredMoves) {
      const moveScore = evaluateMove(game, move);
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }
    }
    
    return bestMove.san;
  }
  
  // Para dificuldade 2+, usar minimax simplificado
  const maxMovesToConsider = Math.min(moves.length, 8);
  const consideredMoves = moves.slice(0, maxMovesToConsider);
  
  let bestMove = null;
  let bestValue = -Infinity;
  const isBlack = game.turn() === 'b';
  
  for (const move of consideredMoves) {
    game.move(move);
    const boardValue = minimaxSimple(game, difficulty - 1, !isBlack);
    game.undo();
    
    if (isBlack) {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move.san;
      }
    } else {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move.san;
      }
    }
  }
  
  return bestMove;
};

// Configurações de dificuldade otimizadas para velocidade
export const difficultySettings = {
  easy: { depth: 1, randomness: 0.6 }, // Maior aleatoriedade para velocidade
  medium: { depth: 1, randomness: 0.3 }, // Profundidade 1 para velocidade
  hard: { depth: 2, randomness: 0.1 }, // Profundidade 2 com alguma aleatoriedade
  expert: { depth: 2, randomness: 0.05 }, // Profundidade 2 com pouca aleatoriedade
  master: { depth: 2, randomness: 0 } // Profundidade 2 sem aleatoriedade
};

// Função para obter movimento com base na dificuldade
export const getAIMove = (game: Chess, difficulty: keyof typeof difficultySettings = 'medium'): string | null => {
  const settings = difficultySettings[difficulty];
  
  // Alta chance de movimento aleatório para velocidade
  if (Math.random() < settings.randomness) {
    const moves = game.moves();
    if (moves.length > 0) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
  }
  
  return getBestMove(game, settings.depth);
};