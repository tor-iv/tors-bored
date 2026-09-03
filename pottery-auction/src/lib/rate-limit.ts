import "server-only";

// Minimal in-memory fixed-window rate limiter. Single-box / single-container
// deployment makes per-process state acceptable (no Redis needed). Used to slow
// credential-stuffing on login/signup — a money-app gap fieldhouse didn't cover.

type Window = { count: number; resetAt: number };
const buckets = new Map<string, Window>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * @param key       Unique bucket key, e.g. `login:${ip}`.
 * @param limit     Max attempts allowed within the window.
 * @param windowMs  Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

// Opportunistic cleanup so the Map doesn't grow unbounded on a long-lived server.
export function sweepExpired(): void {
  const now = Date.now();
  for (const [key, win] of buckets) {
    if (win.resetAt <= now) buckets.delete(key);
  }
}
