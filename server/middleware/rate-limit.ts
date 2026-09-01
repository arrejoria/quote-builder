import type { Context } from "hono";

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

let pruneCounter = 0;
function maybePrune() {
  if (++pruneCounter < 500) return;
  pruneCounter = 0;
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt < now) buckets.delete(key);
  }
}

export function checkRateLimit(
  c: Context,
  options: { max: number; windowMs: number; key: string }
): Response | null {
  const ip = getIp(c);
  const bucketKey = `${options.key}:${ip}`;
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
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
    });
  }

  return null;
}
