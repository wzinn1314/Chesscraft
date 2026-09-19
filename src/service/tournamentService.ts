import { database } from './firebase';
import { ref, set, get, push, onValue, off } from 'firebase/database';
import { logger } from '../utils/logger';

export interface Player {
  uid: string;
  name: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  isOnline: boolean;
  lastActive: number;
}

export interface Tournament {
  id: string;
  name: string;
  type: 'elimination' | 'round-robin' | 'swiss';
  status: 'waiting' | 'active' | 'completed';
  playerCount: number;
  maxPlayers: number;
  timeControl: string;
  createdBy: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  players: Player[];
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  whitePlayer: string;
  blackPlayer: string;
  result?: 'white' | 'black' | 'draw' | 'ongoing';
  whiteRating: number;
  blackRating: number;
  startedAt?: number;
  completedAt?: number;
}

export interface MatchmakingRequest {
  uid: string;
  name: string;
  rating: number;
  preferredTimeControl?: string;
  requestedAt: number;
}

class TournamentService {
  private matchmakingListeners: Map<string, (match: TournamentMatch | null) => void> = new Map();

  /**
   * Calculate ELO rating change based on game result
   */
  calculateEloChange(
    playerRating: number,
    opponentRating: number,
    result: 'win' | 'loss' | 'draw'
  ): number {
    const K = 32; // K-factor for ELO calculation
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    
    let actualScore: number;
    switch (result) {
      case 'win':
        actualScore = 1;
        break;
      case 'loss':
        actualScore = 0;
        break;
      case 'draw':
        actualScore = 0.5;
        break;
    }
    
    return Math.round(K * (actualScore - expectedScore));
  }

  /**
   * Update player rating after a game
   */
  async updatePlayerRating(
    uid: string,
    opponentRating: number,
    result: 'win' | 'loss' | 'draw'
  ): Promise<number> {
    try {
      const playerRef = ref(database, `players/${uid}`);
      const snapshot = await get(playerRef);
      
      if (!snapshot.exists()) {
        throw new Error('Player not found');
      }
      
      const player = snapshot.val() as Player;
      const eloChange = this.calculateEloChange(player.rating, opponentRating, result);
      const newRating = player.rating + eloChange;
      
      // Update player stats
      const updatedPlayer: Partial<Player> = {
        rating: newRating,
        gamesPlayed: player.gamesPlayed + 1,
        wins: result === 'win' ? player.wins + 1 : player.wins,
        losses: result === 'loss' ? player.losses + 1 : player.losses,
        draws: result === 'draw' ? player.draws + 1 : player.draws,
        lastActive: Date.now(),
      };
      
      await set(playerRef, { ...player, ...updatedPlayer });
      
      logger.info('Rating atualizado', 'TournamentService', { 
        uid, 
        oldRating: player.rating, 
        newRating, 
        change: eloChange 
      });
      
      return newRating;
    } catch (error) {
      logger.error('Erro ao atualizar rating', 'TournamentService', { uid, error });
      throw error;
    }
  }

  /**
   * Register player for matchmaking
   */
  async registerForMatchmaking(
    uid: string,
    name: string,
    rating: number,
    preferredTimeControl?: string
  ): Promise<void> {
    try {
      const request: MatchmakingRequest = {
        uid,
        name,
        rating,
        preferredTimeControl,
        requestedAt: Date.now(),
      };
      
      await set(ref(database, `matchmaking/${uid}`), request);
      
      // Update player online status
      await set(ref(database, `players/${uid}/isOnline`), true);
      await set(ref(database, `players/${uid}/lastActive`), Date.now());
      
      logger.info('Jogador registrado para matchmaking', 'TournamentService', { uid, rating });
    } catch (error) {
      logger.error('Erro ao registrar para matchmaking', 'TournamentService', { uid, error });
      throw error;
    }
  }

  /**
   * Unregister from matchmaking
   */
  async unregisterFromMatchmaking(uid: string): Promise<void> {
    try {
      await set(ref(database, `matchmaking/${uid}`), null);
      await set(ref(database, `players/${uid}/isOnline`), false);
      
      logger.info('Jogador removido do matchmaking', 'TournamentService', { uid });
    } catch (error) {
      logger.error('Erro ao remover do matchmaking', 'TournamentService', { uid, error });
      throw error;
    }
  }

  /**
   * Find a match for a player
   */
  async findMatch(uid: string, rating: number): Promise<TournamentMatch | null> {
    try {
      const matchmakingRef = ref(database, 'matchmaking');
      const snapshot = await get(matchmakingRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const requests = snapshot.val() as Record<string, MatchmakingRequest>;
      
      // Find a suitable opponent (within 200 ELO points)
      let bestMatch: MatchmakingRequest | null = null;
      let smallestDifference = Infinity;
      
      for (const [requestUid, request] of Object.entries(requests)) {
        if (requestUid === uid) continue;
        
        const ratingDifference = Math.abs(request.rating - rating);
        if (ratingDifference <= 200 && ratingDifference < smallestDifference) {
          bestMatch = request;
          smallestDifference = ratingDifference;
        }
      }
      
      if (!bestMatch) {
        return null;
      }
      
      // Create match
      const matchId = push(ref(database, 'matches')).key;
      const match: TournamentMatch = {
        id: matchId!,
        tournamentId: 'casual',
        round: 1,
        whitePlayer: Math.random() < 0.5 ? uid : bestMatch.uid,
        blackPlayer: Math.random() < 0.5 ? uid : bestMatch.uid,
        result: 'ongoing',
        whiteRating: 0,
        blackRating: 0,
        startedAt: Date.now(),
      };
      
      // Set white/black based on random assignment
      if (match.whitePlayer === uid) {
        match.whiteRating = rating;
        match.blackRating = bestMatch.rating;
      } else {
        match.whiteRating = bestMatch.rating;
        match.blackRating = rating;
      }
      
      await set(ref(database, `matches/${matchId}`), match);
      
      // Remove both players from matchmaking
      await this.unregisterFromMatchmaking(uid);
      await this.unregisterFromMatchmaking(bestMatch.uid);
      
      logger.info('Match encontrado', 'TournamentService', { 
        matchId, 
        white: match.whitePlayer, 
        black: match.blackPlayer 
      });
      
      return match;
    } catch (error) {
      logger.error('Erro ao encontrar match', 'TournamentService', { uid, error });
      throw error;
    }
  }

  /**
   * Listen for match updates
   */
  listenForMatch(uid: string, callback: (match: TournamentMatch | null) => void): () => void {
    onValue(ref(database, `matches`), (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      
      const matches = snapshot.val() as Record<string, TournamentMatch>;
      
      // Find match involving this player
      const match = Object.values(matches).find(
        m => m.whitePlayer === uid || m.blackPlayer === uid
      );
      
      callback(match || null);
    });
    
    this.matchmakingListeners.set(uid, callback);
    
    return () => {
      off(ref(database, 'matches'));
      this.matchmakingListeners.delete(uid);
    };
  }

  /**
   * Complete a match and update ratings
   */
  async completeMatch(
    matchId: string,
    result: 'white' | 'black' | 'draw'
  ): Promise<void> {
    try {
      const matchRef = ref(database, `matches/${matchId}`);
      const snapshot = await get(matchRef);
      
      if (!snapshot.exists()) {
        throw new Error('Match not found');
      }
      
      const match = snapshot.val() as TournamentMatch;
      
      // Update match result
      await set(ref(database, `matches/${matchId}/result`), result);
      await set(ref(database, `matches/${matchId}/completedAt`), Date.now());
      
      // Update ratings
      const whiteResult = result === 'white' ? 'win' : result === 'black' ? 'loss' : 'draw';
      const blackResult = result === 'black' ? 'win' : result === 'white' ? 'loss' : 'draw';
      
      await this.updatePlayerRating(match.whitePlayer, match.blackRating, whiteResult);
      await this.updatePlayerRating(match.blackPlayer, match.whiteRating, blackResult);
      
      logger.info('Match completado', 'TournamentService', { matchId, result });
    } catch (error) {
      logger.error('Erro ao completar match', 'TournamentService', { matchId, error });
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<Player[]> {
    try {
      const playersRef = ref(database, 'players');
      const snapshot = await get(playersRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const players = Object.values(snapshot.val()) as Player[];
      
      // Sort by rating descending
      return players
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    } catch (error) {
      logger.error('Erro ao buscar leaderboard', 'TournamentService', { error });
      throw error;
    }
  }

  /**
   * Create a tournament
   */
  async createTournament(
    name: string,
    type: 'elimination' | 'round-robin' | 'swiss',
    maxPlayers: number,
    timeControl: string,
    createdBy: string
  ): Promise<string> {
    try {
      const tournamentId = push(ref(database, 'tournaments')).key;
      
      const tournament: Tournament = {
        id: tournamentId!,
        name,
        type,
        status: 'waiting',
        playerCount: 0,
        maxPlayers,
        timeControl,
        createdBy,
        createdAt: Date.now(),
        players: [],
        matches: [],
      };
      
      await set(ref(database, `tournaments/${tournamentId}`), tournament);
      
      logger.info('Torneio criado', 'TournamentService', { tournamentId, name });
      
      return tournamentId!;
    } catch (error) {
      logger.error('Erro ao criar torneio', 'TournamentService', { error });
      throw error;
    }
  }

  /**
   * Join a tournament
   */
  async joinTournament(tournamentId: string, player: Player): Promise<void> {
    try {
      const tournamentRef = ref(database, `tournaments/${tournamentId}`);
      const snapshot = await get(tournamentRef);
      
      if (!snapshot.exists()) {
        throw new Error('Tournament not found');
      }
      
      const tournament = snapshot.val() as Tournament;
      
      if (tournament.status !== 'waiting') {
        throw new Error('Tournament is not accepting players');
      }
      
      if (tournament.playerCount >= tournament.maxPlayers) {
        throw new Error('Tournament is full');
      }
      
      await set(ref(database, `tournaments/${tournamentId}/players/${player.uid}`), player);
      await set(ref(database, `tournaments/${tournamentId}/playerCount`), tournament.playerCount + 1);
      
      logger.info('Jogador entrou no torneio', 'TournamentService', { tournamentId, uid: player.uid });
    } catch (error) {
      logger.error('Erro ao entrar no torneio', 'TournamentService', { tournamentId, error });
      throw error;
    }
  }
}

export const tournamentService = new TournamentService();