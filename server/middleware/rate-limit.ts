import type { Context, Next } from "hono";

interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();

function getIp(c: Context): string {
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

// Prune expired entries every 500 requests to avoid memory growth.
let pruneCounter = 0;
function maybePrune() {
  if (++pruneCounter < 500) return;
  pruneCounter = 0;
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt < now) buckets.delete(key);
  }
}

export function rateLimit(options: { max: number; windowMs: number; key?: string }) {
  return async (c: Context, next: Next) => {
    const ip = getIp(c);
    const bucketKey = `${options.key ?? c.req.path}:${ip}`;
    const now = Date.now();

    maybePrune();

    let entry = buckets.get(bucketKey);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + options.windowMs };
      buckets.set(bucketKey, entry);
    }

    entry.count++;

    if (entry.count > options.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfter));
      return c.json({ error: "Too many requests" }, 429);
    }

    await next();
  };
}
