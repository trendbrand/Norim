import { Redis } from "ioredis";
import { checkRateLimit as checkRateLimitInMemory } from "./auth";

/**
 * Durable rate limiting.
 *
 * Uses Redis (fixed-window INCR + PEXPIRE) when REDIS_URL is configured — this survives
 * app restarts and is correct across instances if the app is ever scaled beyond one node.
 * When Redis is absent or unreachable, it falls back to the per-process in-memory limiter
 * (`checkRateLimit` in auth.ts), which is acceptable for the single-node SQLite MVP.
 */

let client: Redis | null | undefined;

function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.REDIS_URL;
  if (!url) {
    client = null;
    return null;
  }
  try {
    const redis = new Redis(url, {
      // Fail fast to the in-memory fallback instead of blocking requests when Redis is down.
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2000,
    });
    // Swallow connection errors here so they never surface as unhandled rejections;
    // command-level failures are caught per-call and trigger the fallback.
    redis.on("error", () => {});
    client = redis;
    return client;
  } catch {
    client = null;
    return null;
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function enforceRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (redis) {
    try {
      const rkey = `rl:${key}`;
      const count = await redis.incr(rkey);
      if (count === 1) {
        await redis.pexpire(rkey, windowMs);
      }
      return { allowed: count <= maxRequests, remaining: Math.max(0, maxRequests - count) };
    } catch {
      // Redis unreachable mid-request — degrade gracefully to in-memory.
    }
  }
  return checkRateLimitInMemory(key, maxRequests, windowMs);
}
