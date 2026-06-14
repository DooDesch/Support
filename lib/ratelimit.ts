import { LRUCache } from "lru-cache";

// Simple per-IP fixed-window limiter. In-memory is sufficient for a single
// self-hosted instance; swap for Redis if scaled horizontally.
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;

type Entry = { count: number; resetAt: number };

const buckets = new LRUCache<string, Entry>({
  max: 10_000,
  ttl: WINDOW_MS,
});

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const entry: Entry = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(key, entry);
    return { ok: true, remaining: MAX_PER_WINDOW - 1, resetAt: entry.resetAt };
  }

  if (existing.count >= MAX_PER_WINDOW) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return {
    ok: true,
    remaining: MAX_PER_WINDOW - existing.count,
    resetAt: existing.resetAt,
  };
}
