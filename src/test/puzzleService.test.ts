import { describe, it, expect, beforeEach } from 'vitest';
import { puzzleService } from '../service/puzzleService';

describe('puzzleService', () => {
  beforeEach(() => {
    // Clear cache before each test
    localStorage.clear();
  });

  describe('getPuzzles', () => {
    it('should return sample puzzles when cache is empty', () => {
      const puzzles = puzzleService.getPuzzles();
      expect(puzzles).toBeDefined();
      expect(puzzles.length).toBeGreaterThan(0);
      expect(puzzles[0]).toHaveProperty('id');
      expect(puzzles[0]).toHaveProperty('fen');
      expect(puzzles[0]).toHaveProperty('moves');
    });

    it('should return puzzles with correct structure', () => {
      const puzzles = puzzleService.getPuzzles();
      const puzzle = puzzles[0];
      
      expect(puzzle).toMatchObject({
        id: expect.any(String),
        fen: expect.any(String),
        moves: expect.any(Array),
        color: expect.stringMatching(/^[wb]$/),
        rating: expect.any(Number),
        themes: expect.any(Array),
        difficulty: expect.stringMatching(/^(easy|medium|hard)$/),
        description: expect.any(String),
      });
    });
  });

  describe('getPuzzleById', () => {
    it('should return puzzle by id', () => {
      const puzzles = puzzleService.getPuzzles();
      const firstPuzzle = puzzles[0];
      const foundPuzzle = puzzleService.getPuzzleById(firstPuzzle.id);
      
      expect(foundPuzzle).toBeDefined();
      expect(foundPuzzle?.id).toBe(firstPuzzle.id);
    });

    it('should return undefined for non-existent id', () => {
      const foundPuzzle = puzzleService.getPuzzleById('non-existent-id');
      expect(foundPuzzle).toBeUndefined();
    });
  });

  describe('getPuzzlesByDifficulty', () => {
    it('should return only puzzles of specified difficulty', () => {
      const easyPuzzles = puzzleService.getPuzzlesByDifficulty('easy');
      const mediumPuzzles = puzzleService.getPuzzlesByDifficulty('medium');
      const hardPuzzles = puzzleService.getPuzzlesByDifficulty('hard');
      
      easyPuzzles.forEach(puzzle => {
        expect(puzzle.difficulty).toBe('easy');
      });
      
      mediumPuzzles.forEach(puzzle => {
        expect(puzzle.difficulty).toBe('medium');
      });
      
      hardPuzzles.forEach(puzzle => {
        expect(puzzle.difficulty).toBe('hard');
      });
    });
  });

  describe('getRandomPuzzle', () => {
    it('should return a puzzle', () => {
      const puzzle = puzzleService.getRandomPuzzle();
      expect(puzzle).toBeDefined();
      expect(puzzle).toHaveProperty('id');
    });

    it('should return puzzle of specified difficulty when provided', () => {
      const easyPuzzle = puzzleService.getRandomPuzzle('easy');
      expect(easyPuzzle.difficulty).toBe('easy');
    });
  });

  describe('validatePuzzleSolution', () => {
    it('should validate correct solution', () => {
      const puzzles = puzzleService.getPuzzles();
      const puzzle = puzzles[0];
      const correctMoves = puzzle.moves;
      
      const isValid = puzzleService.validatePuzzleSolution(puzzle, correctMoves);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect solution', () => {
      const puzzles = puzzleService.getPuzzles();
      const puzzle = puzzles[0];
      const incorrectMoves = ['a2a3', 'a7a6'];
      
      const isValid = puzzleService.validatePuzzleSolution(puzzle, incorrectMoves);
      expect(isValid).toBe(false);
    });

    it('should reject solution with wrong number of moves', () => {
      const puzzles = puzzleService.getPuzzles();
      // Use a puzzle with multiple moves
      const puzzle = puzzles.find(p => p.moves.length > 1);
      
      if (puzzle) {
        const incompleteMoves = [puzzle.moves[0]];
        
        const isValid = puzzleService.validatePuzzleSolution(puzzle, incompleteMoves);
        expect(isValid).toBe(false);
      } else {
        // Skip test if no multi-move puzzle available
        expect(true).toBe(true);
      }
    });
  });

  describe('getNextPuzzleMove', () => {
    it('should return next move when within bounds', () => {
      const puzzles = puzzleService.getPuzzles();
      // Use a puzzle with multiple moves
      const puzzle = puzzles.find(p => p.moves.length > 1);
      
      if (puzzle) {
        const firstMove = puzzleService.getNextPuzzleMove(puzzle, 0);
        expect(firstMove).toBe(puzzle.moves[0]);
        
        const secondMove = puzzleService.getNextPuzzleMove(puzzle, 1);
        expect(secondMove).toBe(puzzle.moves[1]);
      } else {
        // Test with single move puzzle
        const singleMovePuzzle = puzzles[0];
        const firstMove = puzzleService.getNextPuzzleMove(singleMovePuzzle, 0);
        expect(firstMove).toBe(singleMovePuzzle.moves[0]);
      }
    });

    it('should return null when out of bounds', () => {
      const puzzles = puzzleService.getPuzzles();
      const puzzle = puzzles[0];
      
      const outOfBoundsMove = puzzleService.getNextPuzzleMove(puzzle, puzzle.moves.length);
      expect(outOfBoundsMove).toBeNull();
    });
  });

  describe('recordAttempt', () => {
    it('should record puzzle attempt', () => {
      const puzzles = puzzleService.getPuzzles();
      const puzzle = puzzles[0];
      
      const attempt = {
        puzzleId: puzzle.id,
        solved: true,
        attempts: 1,
        timeSpent: 5000,
        date: Date.now()
      };
      
      puzzleService.recordAttempt(attempt);
      
      const attempts = puzzleService.getAttempts();
      expect(attempts).toContainEqual(attempt);
    });
  });

  describe('getStats', () => {
    it('should return initial stats when no attempts recorded', () => {
      const stats = puzzleService.getStats();
      
      expect(stats).toMatchObject({
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
      });
    });
  });

  describe('updateStats', () => {
    it('should update stats on solved attempt', () => {
      const puzzles = puzzleService.getPuzzles();
      const puzzle = puzzles[0];
      
      const attempt = {
        puzzleId: puzzle.id,
        solved: true,
        attempts: 1,
        timeSpent: 5000,
        date: Date.now()
      };
      
      puzzleService.updateStats(attempt);
      const stats = puzzleService.getStats();
      
      expect(stats.totalSolved).toBe(1);
      expect(stats.totalAttempted).toBe(1);
      expect(stats.currentStreak).toBe(1);
      expect(stats.bestStreak).toBe(1);
    });

    it('should update stats on failed attempt', () => {
      const puzzles = puzzleService.getPuzzles();
      const puzzle = puzzles[0];
      
      const attempt = {
        puzzleId: puzzle.id,
        solved: false,
        attempts: 2,
        timeSpent: 3000,
        date: Date.now()
      };
      
      puzzleService.updateStats(attempt);
      const stats = puzzleService.getStats();
      
      expect(stats.totalSolved).toBe(0);
      expect(stats.totalAttempted).toBe(1);
      expect(stats.currentStreak).toBe(0);
    });
  });

  describe('resetStats', () => {
    it('should reset all stats to initial values', () => {
      // First record some attempts
      const puzzles = puzzleService.getPuzzles();
      const puzzle = puzzles[0];
      
      const attempt = {
        puzzleId: puzzle.id,
        solved: true,
        attempts: 1,
        timeSpent: 5000,
        date: Date.now()
      };
      
      puzzleService.recordAttempt(attempt);
      
      // Then reset
      puzzleService.resetStats();
      const stats = puzzleService.getStats();
      
      expect(stats.totalSolved).toBe(0);
      expect(stats.totalAttempted).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(0);
    });
  });
});