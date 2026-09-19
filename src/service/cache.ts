export const setCache = (key: string, value: any, ttlSeconds?: number) => {
  try {
    const payload: any = { v: value };
    if (ttlSeconds) payload.t = Date.now() + ttlSeconds * 1000;
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn('setCache failed', err);
  }
};

export const getCache = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.t && Date.now() > parsed.t) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.v;
  } catch (err) {
    console.warn('getCache failed', err);
    return null;
  }
};

export const clearCache = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('clearCache failed', err);
  }
};

export default { setCache, getCache, clearCache };
