import type { Puzzle, PuzzleAttempt, PuzzleStats } from '../types/puzzle';
import { getCache, setCache } from './cache';

const PUZZLES_CACHE_KEY = 'chesscraft_puzzles';
const ATTEMPTS_CACHE_KEY = 'chesscraft_puzzle_attempts';
const STATS_CACHE_KEY = 'chesscraft_puzzle_stats';

// Puzzles de exemplo (FENs reais de puzzles famosos)
const SAMPLE_PUZZLES: Puzzle[] = [
  {
    id: 'mate-in-1-1',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    moves: ['e1e8'],
    color: 'w',
    rating: 1200,
    themes: ['back-rank', 'mate'],
    difficulty: 'easy',
    description: 'Mate em 1 - Xeque na última fila'
  },
  {
    id: 'mate-in-2-1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    moves: ['h5f7', 'e8f7', 'f1b5'],
    color: 'w',
    rating: 1350,
    themes: ['sacrifice', 'mate'],
    difficulty: 'medium',
    description: 'Mate em 2 - Sacrifício de Dama'
  },
  {
    id: 'tactical-1',
    fen: 'rnbqk2r/ppp2ppp/3p1n2/2b5/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 5 6',
    moves: ['d3e4', 'f6e4', 'f3e4', 'c8e6', 'c1g5'],
    color: 'w',
    rating: 1450,
    themes: ['pin', 'development'],
    difficulty: 'medium',
    description: 'Desenvolvimento e prego'
  },
  {
    id: 'fork-1',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 3 3',
    moves: ['f3e5', 'd8e7', 'e5c6'],
    color: 'w',
    rating: 1300,
    themes: ['fork', 'knight'],
    difficulty: 'easy',
    description: 'Garfo de cavalo'
  },
  {
    id: 'advanced-1',
    fen: 'r2q1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R2QKR2 b - - 0 12',
    moves: ['d7e5', 'c3e5', 'f6e4', 'd2f4', 'e4f2', 'e1g1'],
    color: 'b',
    rating: 1600,
    themes: ['sacrifice', 'attack'],
    difficulty: 'hard',
    description: 'Sacrifício posicional complexo'
  },
  {
    id: 'endgame-1',
    fen: '8/8/8/8/8/5k2/4P3/4K3 w - - 0 1',
    moves: ['e2e4', 'f3e3', 'e1f2', 'e3d3', 'f2e3', 'd3c4', 'e4e5'],
    color: 'w',
    rating: 1100,
    themes: ['endgame', 'pawn'],
    difficulty: 'easy',
    description: 'Final de peão - promoção'
  },
  {
    id: 'skewer-1',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    moves: ['e1e8'],
    color: 'w',
    rating: 1250,
    themes: ['skewer', 'endgame'],
    difficulty: 'easy',
    description: 'Espeto - Rei atrás de peça valiosa'
  },
  {
    id: 'discovery-1',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    moves: ['h5f7', 'e8f7', 'f1b5'],
    color: 'w',
    rating: 1400,
    themes: ['discovery', 'attack'],
    difficulty: 'medium',
    description: 'Descoberta de ataque'
  }
];

export const puzzleService = {
  getPuzzles: (): Puzzle[] => {
    const cached = getCache(PUZZLES_CACHE_KEY) as Puzzle[];
    if (cached && cached.length > 0) {
      return cached;
    }
    
    // Se não houver cache, usa puzzles de exemplo
    setCache(PUZZLES_CACHE_KEY, SAMPLE_PUZZLES);
    return SAMPLE_PUZZLES;
  },

  getPuzzleById: (id: string): Puzzle | undefined => {
    const puzzles = puzzleService.getPuzzles();
    return puzzles.find(p => p.id === id);
  },

  getPuzzlesByDifficulty: (difficulty: Puzzle['difficulty']): Puzzle[] => {
    const puzzles = puzzleService.getPuzzles();
    return puzzles.filter(p => p.difficulty === difficulty);
  },

  getRandomPuzzle: (difficulty?: Puzzle['difficulty']): Puzzle => {
    const puzzles = difficulty 
      ? puzzleService.getPuzzlesByDifficulty(difficulty)
      : puzzleService.getPuzzles();
    
    const randomIndex = Math.floor(Math.random() * puzzles.length);
    return puzzles[randomIndex];
  },

  validatePuzzleSolution: (puzzle: Puzzle, userMoves: string[]): boolean => {
    if (userMoves.length !== puzzle.moves.length) {
      return false;
    }
    
    for (let i = 0; i < userMoves.length; i++) {
      if (userMoves[i] !== puzzle.moves[i]) {
        return false;
      }
    }
    
    return true;
  },

  getNextPuzzleMove: (puzzle: Puzzle, currentMoveIndex: number): string | null => {
    if (currentMoveIndex >= puzzle.moves.length) {
      return null;
    }
    return puzzle.moves[currentMoveIndex];
  },

  recordAttempt: (attempt: PuzzleAttempt): void => {
    const attempts = getCache(ATTEMPTS_CACHE_KEY) as PuzzleAttempt[] || [];
    attempts.push(attempt);
    setCache(ATTEMPTS_CACHE_KEY, attempts);
    puzzleService.updateStats(attempt);
  },

  getAttempts: (): PuzzleAttempt[] => {
    return getCache(ATTEMPTS_CACHE_KEY) as PuzzleAttempt[] || [];
  },

  getStats: (): PuzzleStats => {
    const cached = getCache(STATS_CACHE_KEY) as PuzzleStats;
    if (cached) {
      return cached;
    }
    
    // Stats iniciais
    const initialStats: PuzzleStats = {
      totalSolved: 0,
      totalAttempted: 0,
      currentStreak: 0,
      bestStreak: 0,
      averageTime: 0,
      byDifficulty: {
        easy: { solved: 0, attempted: 0 },
        medium: { solved: 0, attempted: 0 },
        hard: { solved: 0, attempted: 0 }
      }
    };
    
    setCache(STATS_CACHE_KEY, initialStats);
    return initialStats;
  },

  updateStats: (attempt: PuzzleAttempt): void => {
    const stats = puzzleService.getStats();
    const puzzle = puzzleService.getPuzzleById(attempt.puzzleId);
    
    if (!puzzle) return;
    
    stats.totalAttempted++;
    stats.byDifficulty[puzzle.difficulty].attempted++;
    
    if (attempt.solved) {
      stats.totalSolved++;
      stats.currentStreak++;
      stats.byDifficulty[puzzle.difficulty].solved++;
      
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else {
      stats.currentStreak = 0;
    }
    
    // Calcular tempo médio
    const attempts = puzzleService.getAttempts();
    const solvedAttempts = attempts.filter(a => a.solved);
    if (solvedAttempts.length > 0) {
      const totalTime = solvedAttempts.reduce((sum, a) => sum + a.timeSpent, 0);
      stats.averageTime = totalTime / solvedAttempts.length;
    }
    
    setCache(STATS_CACHE_KEY, stats);
  },

  resetStats: (): void => {
    const initialStats: PuzzleStats = {
      totalSolved: 0,
      totalAttempted: 0,
      currentStreak: 0,
      bestStreak: 0,
      averageTime: 0,
      byDifficulty: {
        easy: { solved: 0, attempted: 0 },
        medium: { solved: 0, attempted: 0 },
        hard: { solved: 0, attempted: 0 }
      }
    };
    
    setCache(STATS_CACHE_KEY, initialStats);
    setCache(ATTEMPTS_CACHE_KEY, []);
  }
};