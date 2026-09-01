import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { quotesRouter } from "./routes/quotes";
import { profileRouter } from "./routes/profile";
import { rateLimit } from "./middleware/rate-limit";
import { verifyTurnstile } from "./middleware/turnstile";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (process.env.TRUSTED_ORIGINS ?? "http://localhost:5173").split(","),
    allowHeaders: ["Content-Type", "Authorization", "x-turnstile-token"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Sign-up: Turnstile verification + tight rate limit (5 per 15 min per IP)
app.post(
  "/api/auth/sign-up/email",
  rateLimit({ max: 5, windowMs: 15 * 60 * 1000, key: "signup" }),
  verifyTurnstile,
  (c) => auth.handler(c.req.raw)
);

// Sign-in: rate limit only (20 per 15 min per IP)
app.post(
  "/api/auth/sign-in/email",
  rateLimit({ max: 20, windowMs: 15 * 60 * 1000, key: "signin" }),
  (c) => auth.handler(c.req.raw)
);

// Better Auth handles all other /api/auth/* routes
app.on(["GET", "POST"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// App routes
app.route("/api/quotes", quotesRouter);
app.route("/api/profile", profileRouter);

app.get("/health", (c) => c.json({ ok: true }));

const port = Number(process.env.PORT ?? 3001);
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});
