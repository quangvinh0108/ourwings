// Simple in-memory cache for session data
const sessionCache = new Map<string, { session: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

export function getCachedSession(key: string) {
  const cached = sessionCache.get(key);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    sessionCache.delete(key);
    return null;
  }
  
  return cached.session;
}

export function setCachedSession(key: string, session: any) {
  sessionCache.set(key, {
    session,
    timestamp: Date.now(),
  });
  
  // Clean up old entries every 100 sets
  if (sessionCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of sessionCache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        sessionCache.delete(k);
      }
    }
  }
}

export function clearSessionCache() {
  sessionCache.clear();
}
