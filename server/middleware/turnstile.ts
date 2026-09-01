import type { Context, Next } from "hono";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v1/siteverify";

export async function verifyTurnstile(c: Context, next: Next) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // If no secret configured, skip verification (dev fallback).
  if (!secret) {
    await next();
    return;
  }

  const token = c.req.header("x-turnstile-token");
  if (!token) {
    return c.json({ error: "Missing Turnstile token" }, 400);
  }

  const ip =
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0].trim();

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.append("remoteip", ip);

  const res = await fetch(VERIFY_URL, { method: "POST", body });
  const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };

  if (!data.success) {
    return c.json({ error: "Turnstile verification failed", codes: data["error-codes"] }, 403);
  }

  await next();
}
