/**
 * Cache keys and TTL (for Redis later)
 */

export const CACHE_KEYS = {
  USER_PROFILE: (id: string) => `user:${id}`,
  SCHOOL_PROFILE: (id: string) => `school:${id}`,
  SCHOOL_STATS: (id: string) => `school:stats:${id}`,
} as const;

export const CACHE_TTL = {
  SHORT: 60, // 1 min
  MEDIUM: 300, // 5 mins
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;