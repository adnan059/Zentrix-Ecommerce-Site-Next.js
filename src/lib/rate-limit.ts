// src/lib/rate-limit.ts
/**
 * Lightweight in-memory sliding-window rate limiter.
 *
 * Works correctly on a single-process Node.js deployment (standard Vercel
 * serverless). Each Lambda instance has its own store — limits are per-instance,
 * not global. For a hard global cap across instances, swap the store for
 * Upstash Redis using @upstash/ratelimit — the interface here is compatible.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Module-level store persists across requests within the same worker process.
const store = new Map<string, RateLimitEntry>();

// Sweep stale entries every 5 minutes so the map doesn't grow unbounded.
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (entry.resetAt <= now) store.delete(key);
      }
    },
    5 * 60 * 1000,
  );
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // unix ms
}

export interface RateLimitOptions {
  /** Unique bucket key — typically combine route + IP, e.g. "search:127.0.0.1" */
  key: string;
  /** Max requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export function rateLimit(opts: RateLimitOptions): RateLimitResult {
  const { key, limit, windowMs } = opts;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Extract the real client IP from Next.js request headers.
 * Vercel sets x-real-ip; Cloudflare sets cf-connecting-ip.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
