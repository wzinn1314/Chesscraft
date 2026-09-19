import { ref, set, get, update, push, onValue, off } from 'firebase/database';
import { database } from './firebase';

export interface UserStats {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  rating: number;
  createdAt: number;
  lastActive: number;
}

export interface GameResult {
  userId: string;
  opponentName: string;
  result: 'win' | 'loss' | 'draw';
  opponentType: 'ai' | 'human';
  date: number;
  moves: number;
  ratingChange?: number;
}

export interface RecordedGameOutcome {
  result: 'win' | 'loss' | 'draw';
  ratingChange: number;
  previousRating: number;
  newRating: number;
  stats: UserStats;
}

const SESSION_KEY = 'chesscraft_active_session';
const PROFILE_EVENT = 'chesscraft-profile-updated';

const isFirebaseAvailable = () => {
  try {
    return !!database && typeof window !== 'undefined';
  } catch {
    return false;
  }
};

export const getUserId = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '_');

const userKey = (userId: string) => `chess_user_${userId}`;
const gamesKey = (userId: string) => `chess_games_${userId}`;

const notifyProfileUpdated = () => {
  window.dispatchEvent(new Event(PROFILE_EVENT));
};

export const subscribeToProfileCache = (callback: () => void): (() => void) => {
  window.addEventListener(PROFILE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(PROFILE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

const defaultUser = (name: string): UserStats => ({
  name,
  wins: 0,
  losses: 0,
  draws: 0,
  totalGames: 0,
  rating: 1200,
  createdAt: Date.now(),
  lastActive: Date.now(),
});

const readCachedUser = (userId: string): UserStats | null => {
  const stored = localStorage.getItem(userKey(userId));
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserStats;
  } catch {
    return null;
  }
};

const writeCachedUser = (userId: string, stats: UserStats) => {
  localStorage.setItem(userKey(userId), JSON.stringify(stats));
  notifyProfileUpdated();
};

const readCachedGames = (userId: string): GameResult[] => {
  const stored = localStorage.getItem(gamesKey(userId));
  if (!stored) return [];
  try {
    return JSON.parse(stored) as GameResult[];
  } catch {
    return [];
  }
};

const writeCachedGame = (userId: string, game: GameResult) => {
  const games = [game, ...readCachedGames(userId)].slice(0, 30);
  localStorage.setItem(gamesKey(userId), JSON.stringify(games));
};

export const saveActiveSession = (name: string) => {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ name, userId: getUserId(name), savedAt: Date.now() }),
  );
};

export const loadActiveSession = (): { name: string; userId: string } | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { name?: string; userId?: string };
    if (!parsed.name) return null;
    return { name: parsed.name, userId: parsed.userId ?? getUserId(parsed.name) };
  } catch {
    return null;
  }
};

export const calculateRatingChange = (
  result: 'win' | 'loss' | 'draw',
  opponentType: 'ai' | 'human' = 'ai',
): number => {
  const baseChange = opponentType === 'ai' ? 15 : 25;
  switch (result) {
    case 'win':
      return baseChange;
    case 'loss':
      return -baseChange;
    case 'draw':
      return Math.floor(baseChange / 4);
    default:
      return 0;
  }
};

export const createOrUpdateUser = async (name: string): Promise<string> => {
  const userId = getUserId(name);
  const existing = readCachedUser(userId);
  const stats = existing
    ? { ...existing, name, lastActive: Date.now() }
    : defaultUser(name);

  writeCachedUser(userId, stats);
  saveActiveSession(name);

  const db = database;
  if (db) {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        await update(userRef, { lastActive: Date.now(), name });
      } else {
        await set(userRef, stats);
      }
    } catch (error) {
      console.error('Erro ao sincronizar usuário:', error);
    }
  }

  return userId;
};

export const recordGameResult = async (
  userId: string,
  result: 'win' | 'loss' | 'draw',
  opponentName: string,
  opponentType: 'ai' | 'human' = 'ai',
  moves: number = 0,
): Promise<RecordedGameOutcome> => {
  let userData = readCachedUser(userId);
  if (!userData) {
    userData = defaultUser(userId);
  }

  const ratingChange = calculateRatingChange(result, opponentType);
  const previousRating = userData.rating;
  const next: UserStats = {
    ...userData,
    totalGames: userData.totalGames + 1,
    rating: Math.max(100, userData.rating + ratingChange),
    lastActive: Date.now(),
    wins: userData.wins + (result === 'win' ? 1 : 0),
    losses: userData.losses + (result === 'loss' ? 1 : 0),
    draws: userData.draws + (result === 'draw' ? 1 : 0),
  };

  writeCachedUser(userId, next);
  writeCachedGame(userId, {
    userId,
    opponentName,
    result,
    opponentType,
    date: Date.now(),
    moves,
    ratingChange,
  });

  const db = database;
  if (db) {
    try {
      const userRef = ref(db, `users/${userId}`);
      const gamesRef = ref(db, `users/${userId}/games`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        await update(userRef, {
          totalGames: next.totalGames,
          rating: next.rating,
          lastActive: next.lastActive,
          wins: next.wins,
          losses: next.losses,
          draws: next.draws,
        });
        await push(gamesRef, {
          userId,
          opponentName,
          result,
          opponentType,
          date: Date.now(),
          moves,
          ratingChange,
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar resultado:', error);
    }
  }

  return {
    result,
    ratingChange,
    previousRating,
    newRating: next.rating,
    stats: next,
  };
};

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  const cached = readCachedUser(userId);
  if (cached) return cached;

  const db = database;
  if (!db) return null;

  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    if (snapshot.exists()) {
      const stats = snapshot.val() as UserStats;
      writeCachedUser(userId, stats);
      return stats;
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
  }
  return null;
};

export const getRecentGames = (userId: string): GameResult[] => readCachedGames(userId);

export const getWinRate = (stats: UserStats): number => {
  if (stats.totalGames === 0) return 0;
  return Math.round((stats.wins / stats.totalGames) * 100);
};

export const getGlobalRanking = async (limit: number = 10): Promise<UserStats[]> => {
  const allUsers: UserStats[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chess_user_')) {
      const userData = localStorage.getItem(key);
      if (userData) {
        const user = JSON.parse(userData) as UserStats;
        if (user.totalGames > 0) allUsers.push(user);
      }
    }
  }

  const db = database;
  if (db) {
    try {
      const snapshot = await get(ref(db, 'users'));
      if (snapshot.exists()) {
        const remote = Object.values(snapshot.val()) as UserStats[];
        remote.filter((u) => u.totalGames > 0).forEach((u) => {
          if (!allUsers.some((local) => local.name === u.name)) allUsers.push(u);
        });
      }
    } catch (error) {
      console.error('Erro ao obter ranking:', error);
    }
  }

  allUsers.sort((a, b) => b.rating - a.rating);
  return allUsers.slice(0, limit);
};

export const getUserRank = async (userId: string): Promise<number> => {
  const ranking = await getGlobalRanking(100);
  const position = ranking.findIndex(
    (user) => getUserId(user.name) === userId,
  );
  return position >= 0 ? position + 1 : 0;
};

export const subscribeToUserStats = (
  userId: string,
  callback: (stats: UserStats | null) => void,
): (() => void) => {
  const emit = () => callback(readCachedUser(userId));
  emit();
  const unsubCache = subscribeToProfileCache(emit);

  const db = database;
  if (!db) {
    return unsubCache;
  }

  const userRef = ref(db, `users/${userId}`);
  onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const stats = snapshot.val() as UserStats;
      writeCachedUser(userId, stats);
      callback(stats);
    } else {
      callback(readCachedUser(userId));
    }
  });

  return () => {
    unsubCache();
    off(userRef);
  };
};

export const subscribeToRanking = (
  callback: (ranking: UserStats[]) => void,
  limit: number = 10,
): (() => void) => {
  const emit = () => {
    void getGlobalRanking(limit).then(callback);
  };
  emit();
  const unsubCache = subscribeToProfileCache(emit);

  const db = database;
  if (!db) {
    return unsubCache;
  }

  const usersRef = ref(db, 'users');
  onValue(usersRef, () => emit());
  return () => {
    unsubCache();
    off(usersRef);
  };
};
