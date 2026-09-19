export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  color: 'w' | 'b';
  rating: number;
  themes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

export interface PuzzleAttempt {
  puzzleId: string;
  solved: boolean;
  attempts: number;
  timeSpent: number;
  date: number;
}

export interface PuzzleStats {
  totalSolved: number;
  totalAttempted: number;
  currentStreak: number;
  bestStreak: number;
  averageTime: number;
  byDifficulty: {
    easy: { solved: number; attempted: number };
    medium: { solved: number; attempted: number };
    hard: { solved: number; attempted: number };
  };
}