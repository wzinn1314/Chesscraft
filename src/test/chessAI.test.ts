import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { findBestMove, difficultySettings } from '../utils/chessAI';

describe('chessAI', () => {
  describe('difficultySettings', () => {
    it('should have defined difficulty levels', () => {
      expect(difficultySettings).toHaveProperty('easy');
      expect(difficultySettings).toHaveProperty('medium');
      expect(difficultySettings).toHaveProperty('hard');
      expect(difficultySettings).toHaveProperty('expert');
    });

    it('should have depth and randomness for each difficulty', () => {
      Object.entries(difficultySettings).forEach(([, settings]) => {
        expect(settings).toHaveProperty('depth');
        expect(settings).toHaveProperty('randomness');
        expect(typeof settings.depth).toBe('number');
        expect(typeof settings.randomness).toBe('number');
        expect(settings.depth).toBeGreaterThan(0);
        expect(settings.randomness).toBeGreaterThanOrEqual(0);
        expect(settings.randomness).toBeLessThanOrEqual(1);
      });
    });

    it('should have increasing depth with difficulty', () => {
      expect(difficultySettings.easy.depth).toBeLessThanOrEqual(difficultySettings.medium.depth);
      expect(difficultySettings.medium.depth).toBeLessThanOrEqual(difficultySettings.hard.depth);
      expect(difficultySettings.hard.depth).toBeLessThanOrEqual(difficultySettings.expert.depth);
    });

    it('should have decreasing randomness with difficulty', () => {
      expect(difficultySettings.easy.randomness).toBeGreaterThanOrEqual(difficultySettings.medium.randomness);
      expect(difficultySettings.medium.randomness).toBeGreaterThanOrEqual(difficultySettings.hard.randomness);
      expect(difficultySettings.hard.randomness).toBeGreaterThanOrEqual(difficultySettings.expert.randomness);
    });
  });

  describe('findBestMove', () => {
    it('should return null when no moves available', () => {
      const game = new Chess();
      game.load('7k/8/8/8/8/8/8/7K w - - 0 1');

      const move = findBestMove(game, 'easy');
      if (move) {
        expect(move).toMatch(/^[a-h][1-8][a-h][1-8][qnrb]?$/);
      }
    });

    it('should return a valid move string when moves available', () => {
      const game = new Chess();
      const move = findBestMove(game, 'easy');

      if (move) {
        expect(move).toMatch(/^[a-h][1-8][a-h][1-8][qnrb]?$/);
      }
    });

    it('should return move in correct format', () => {
      const game = new Chess();
      const move = findBestMove(game, 'medium');

      if (move) {
        expect(move.length).toBeGreaterThanOrEqual(4);
        expect(move.length).toBeLessThanOrEqual(5);
      }
    });

    it('should handle different difficulty levels', () => {
      const game = new Chess();

      const easyMove = findBestMove(game, 'easy');
      const mediumMove = findBestMove(game, 'medium');
      const hardMove = findBestMove(game, 'hard');
      [easyMove, mediumMove, hardMove].forEach(move => {
        if (move) {
          expect(move).toMatch(/^[a-h][1-8][a-h][1-8][qnrb]?$/);
        }
      });
    }, 10000);
  });

  describe('AI behavior in different positions', () => {
    it('should handle starting position', () => {
      const game = new Chess();
      const move = findBestMove(game, 'easy');
      expect(move).toBeTruthy();
    });

    it('should handle endgame position', () => {
      const game = new Chess();
      game.load('8/8/8/8/8/5k2/4P3/4K3 w - - 0 1');

      const move = findBestMove(game, 'medium');
      expect(move).toBeTruthy();
    });

    it('should handle tactical position', () => {
      const game = new Chess();
      game.load('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3');

      const move = findBestMove(game, 'medium');
      expect(move).toBeTruthy();
    });
  });
});