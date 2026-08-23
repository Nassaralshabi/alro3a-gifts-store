/**
 * Simple in-memory rate limiter for login attempts.
 * Strategy: sliding window per key (IP + username).
 * Suitable for single-instance deployments; swap for Redis at scale.
 */
type Attempt = { count: number; firstAt: number; blockedUntil?: number };

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000; // block 15 min after exceeding
const store = new Map<string, Attempt>();

// periodic cleanup to avoid unbounded growth
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [k, a] of store) {
    if (a.blockedUntil && a.blockedUntil < now) store.delete(k);
    else if (!a.blockedUntil && now - a.firstAt > WINDOW_MS) store.delete(k);
  }
}

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  cleanup(now);
  const a = store.get(key);

  if (a?.blockedUntil) {
    if (now < a.blockedUntil) {
      return { allowed: false, retryAfterSec: Math.ceil((a.blockedUntil - now) / 1000) };
    }
    // block expired → reset
    store.delete(key);
  }
  return { allowed: true };
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const a = store.get(key);
  if (!a || now - a.firstAt > WINDOW_MS) {
    store.set(key, { count: 1, firstAt: now });
    return;
  }
  a.count += 1;
  if (a.count >= MAX_ATTEMPTS) {
    a.blockedUntil = now + BLOCK_MS;
  }
}

export function resetFailures(key: string): void {
  store.delete(key);
}
