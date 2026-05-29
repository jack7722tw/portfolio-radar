const cache = new Map<string, { data: unknown; expiresAt: number }>();

const ONE_HOUR = 60 * 60 * 1000;

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache(key: string, data: unknown, ttlMs: number = ONE_HOUR) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}
