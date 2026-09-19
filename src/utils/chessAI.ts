import { Chess } from 'chess.js';
const pieceValues: { [key: string]: number } = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};
const pawnTable = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const knightTable = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopTable = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const rookTable = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const queenTable = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const kingTable = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

const kingEndgameTable = [
  [-50,-40,-30,-20,-20,-30,-40,-50],
  [-30,-20,-10,  0,  0,-10,-20,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-30,  0,  0,  0,  0,-30,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50]
];
export const difficultySettings = {
  beginner: { depth: 1, randomness: 0.85 },
  easy: { depth: 1, randomness: 0.45 },
  medium: { depth: 2, randomness: 0.2 },
  hard: { depth: 2, randomness: 0.05 },
  expert: { depth: 2, randomness: 0.0 },
};
const getPositionTable = (pieceType: string, isEndgame: boolean): number[][] => {
  switch (pieceType) {
    case 'p': return pawnTable;
    case 'n': return knightTable;
    case 'b': return bishopTable;
    case 'r': return rookTable;
    case 'q': return queenTable;
    case 'k': return isEndgame ? kingEndgameTable : kingTable;
    default: return Array(8).fill(Array(8).fill(0));
  }
};
const evaluateBoard = (game: Chess): number => {
  let score = 0;
  const board = game.board();
  let totalMaterial = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        totalMaterial += pieceValues[piece.type];
      }
    }
  }
  const isEndgame = totalMaterial < 2300;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = pieceValues[piece.type];
        const posTable = getPositionTable(piece.type, isEndgame);
        const tableRow = piece.color === 'w' ? row : 7 - row;
        const tableCol = piece.color === 'w' ? col : 7 - col;
        const positionValue = posTable[tableRow][tableCol];

        const totalValue = pieceValue + positionValue;

        if (piece.color === 'w') {
          score += totalValue;
        } else {
          score -= totalValue;
        }
      }
    }
  }
  const moves = game.moves({ verbose: true });
  score += moves.length * 2;
  if (game.inCheck()) {
    score += game.turn() === 'w' ? -50 : 50;
  }

  return score;
};
const orderMoves = (_game: Chess, moves: any[]): any[] => {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += pieceValues[a.captured] * 10;
    if (b.captured) scoreB += pieceValues[b.captured] * 10;
    if (a.promotion) scoreA += pieceValues[a.promotion] * 5;
    if (b.promotion) scoreB += pieceValues[b.promotion] * 5;
    if (a.san.includes('+')) scoreA += 50;
    if (b.san.includes('+')) scoreB += 50;

    return scoreB - scoreA;
  });
};
const minimax = (
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number => {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });
  const orderedMoves = orderMoves(game, moves);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of orderedMoves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedMoves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};
export const findBestMove = (game: Chess, difficulty: keyof typeof difficultySettings): string | null => {
  const settings = difficultySettings[difficulty];
  const moves = game.moves({ verbose: true });

  if (moves.length === 0) return null;
  if (Math.random() < settings.randomness) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return randomMove.from + randomMove.to;
  }

  let bestMove = null;
  let bestValue = isMaximizingPlayer(game) ? -Infinity : Infinity;

  const orderedMoves = orderMoves(game, moves);

  for (const move of orderedMoves) {
    game.move(move);
    const boardValue = minimax(
      game,
      settings.depth - 1,
      -Infinity,
      Infinity,
      !isMaximizingPlayer(game)
    );
    game.undo();

    if (isMaximizingPlayer(game)) {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  }

  return bestMove ? bestMove.from + bestMove.to : null;
};

const isMaximizingPlayer = (game: Chess): boolean => {
  return game.turn() === 'w';
};
export const getAIMove = (game: Chess, difficulty: keyof typeof difficultySettings = 'medium'): string | null => {
  return findBestMove(game, difficulty);
};
