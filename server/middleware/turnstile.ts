import type { Context } from "hono";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v1/siteverify";

export async function checkTurnstile(c: Context): Promise<Response | null> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // No secret configured → skip (dev fallback).
  if (!secret) return null;

  const token = c.req.header("x-turnstile-token");
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing Turnstile token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ip =
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0].trim();

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.append("remoteip", ip);

  const res = await fetch(VERIFY_URL, { method: "POST", body });
  const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };

  if (!data.success) {
    return new Response(
      JSON.stringify({ error: "Turnstile verification failed", codes: data["error-codes"] }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return null;
}
