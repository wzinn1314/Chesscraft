import { Chess } from 'chess.js';

export interface PGNGame {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  whiteElo?: string;
  blackElo?: string;
  timeControl?: string;
  moves: string[];
}

export interface PGNMove {
  san: string;
  from: string;
  to: string;
  piece?: string;
  captured?: string;
  promotion?: string;
}

/**
 * Parse PGN string to extract game information and moves
 */
export function parsePGN(pgn: string): PGNGame {
  const game: PGNGame = {
    moves: [],
  };

  // Extract headers
  const headerRegex = /\[([A-Za-z]+)\s+"([^"]+)"\]/g;
  let match;
  while ((match = headerRegex.exec(pgn)) !== null) {
    const [, key, value] = match;
    const lowerKey = key.toLowerCase();
    
    switch (lowerKey) {
      case 'event':
        game.event = value;
        break;
      case 'site':
        game.site = value;
        break;
      case 'date':
        game.date = value;
        break;
      case 'round':
        game.round = value;
        break;
      case 'white':
        game.white = value;
        break;
      case 'black':
        game.black = value;
        break;
      case 'result':
        game.result = value;
        break;
      case 'whiteelo':
        game.whiteElo = value;
        break;
      case 'blackelo':
        game.blackElo = value;
        break;
      case 'timecontrol':
        game.timeControl = value;
        break;
    }
  }

  // Extract moves (everything after the first empty line or after the headers)
  const movesSection = pgn.split(/\n\s*\n/)[1] || pgn;
  const movesText = movesSection
    .replace(/\{[^}]*\}/g, '') // Remove comments
    .replace(/\d+\.\.\./g, '') // Remove move numbers for black
    .replace(/\d+\./g, '') // Remove move numbers
    .replace(/\$\d+/g, '') // Remove NAGs
    .replace(/[!?]+/g, '') // Remove move annotations
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, '') // Remove result
    .trim();

  if (movesText) {
    game.moves = movesText.split(/\s+/).filter(m => m.length > 0);
  }

  return game;
}

/**
 * Generate PGN string from game information and moves
 */
export function generatePGN(game: PGNGame): string {
  let pgn = '';

  // Add headers
  if (game.event) pgn += `[Event "${game.event}"]\n`;
  if (game.site) pgn += `[Site "${game.site}"]\n`;
  if (game.date) pgn += `[Date "${game.date}"]\n`;
  if (game.round) pgn += `[Round "${game.round}"]\n`;
  if (game.white) pgn += `[White "${game.white}"]\n`;
  if (game.black) pgn += `[Black "${game.black}"]\n`;
  if (game.result) pgn += `[Result "${game.result}"]\n`;
  if (game.whiteElo) pgn += `[WhiteElo "${game.whiteElo}"]\n`;
  if (game.blackElo) pgn += `[BlackElo "${game.blackElo}"]\n`;
  if (game.timeControl) pgn += `[TimeControl "${game.timeControl}"]\n`;

  pgn += '\n';

  // Add moves
  const chess = new Chess();
  let moveNumber = 1;
  let isWhite = true;

  for (const move of game.moves) {
    if (isWhite) {
      pgn += `${moveNumber}. `;
    }
    pgn += `${move} `;
    
    try {
      chess.move(move);
    } catch (e) {
      // Invalid move, skip
    }
    
    isWhite = !isWhite;
    if (isWhite) {
      moveNumber++;
    }
  }

  if (game.result) {
    pgn += ` ${game.result}`;
  }

  return pgn.trim();
}

/**
 * Export game to PGN format
 */
export function exportGameToPGN(game: Chess, headers: Partial<PGNGame> = {}): string {
  const history = game.history();
  const pgnGame: PGNGame = {
    ...headers,
    moves: history,
  };

  if (!pgnGame.result) {
    if (game.isCheckmate()) {
      pgnGame.result = game.turn() === 'w' ? '0-1' : '1-0';
    } else if (game.isDraw()) {
      pgnGame.result = '1/2-1/2';
    } else {
      pgnGame.result = '*';
    }
  }

  return generatePGN(pgnGame);
}

/**
 * Import PGN and return Chess instance
 */
export function importPGN(pgn: string): Chess {
  const parsed = parsePGN(pgn);
  const chess = new Chess();

  for (const move of parsed.moves) {
    try {
      chess.move(move);
    } catch (e) {
      console.error('Invalid move in PGN:', move);
    }
  }

  return chess;
}

/**
 * Get move analysis with evaluation
 */
export function analyzeMove(game: Chess, move: string): {
  move: PGNMove | null;
  evaluation: number;
  isBlunder: boolean;
  isMistake: boolean;
  isInaccuracy: boolean;
  isBrilliant: boolean;
} {
  const moveObj = game.move(move);
  if (!moveObj) {
    game.undo();
    return {
      move: null,
      evaluation: 0,
      isBlunder: false,
      isMistake: false,
      isInaccuracy: false,
      isBrilliant: false,
    };
  }

  // Simple evaluation based on material
  const evaluation = evaluatePosition(game);
  
  // Categorize move quality (simplified)
  const moveAnalysis = {
    move: {
      san: moveObj.san,
      from: moveObj.from,
      to: moveObj.to,
      piece: moveObj.piece,
      captured: moveObj.captured,
      promotion: moveObj.promotion,
    },
    evaluation,
    isBlunder: evaluation < -200,
    isMistake: evaluation < -100 && evaluation >= -200,
    isInaccuracy: evaluation < -50 && evaluation >= -100,
    isBrilliant: evaluation > 100,
  };

  game.undo();
  return moveAnalysis;
}

/**
 * Simple position evaluation
 */
function evaluatePosition(game: Chess): number {
  const pieceValues: Record<string, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
  };

  let score = 0;
  const board = game.board();

  for (const row of board) {
    for (const square of row) {
      if (square) {
        const value = pieceValues[square.type] || 0;
        score += square.color === 'w' ? value : -value;
      }
    }
  }

  return score;
}