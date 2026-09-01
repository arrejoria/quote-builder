import "dotenv/config";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { quotesRouter } from "./routes/quotes";
import { profileRouter } from "./routes/profile";
import { checkRateLimit } from "./middleware/rate-limit";
import { checkTurnstile } from "./middleware/turnstile";

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

// Better Auth handles all /api/auth/* routes.
// Rate limiting and Turnstile are checked inline to avoid Hono wildcard conflicts.
app.on(["GET", "POST"], "/api/auth/**", async (c) => {
  const path = c.req.path;
  const method = c.req.method;

  if (method === "POST" && path === "/api/auth/sign-up/email") {
    const err = checkRateLimit(c, { max: 5, windowMs: 15 * 60 * 1000, key: "signup" })
      ?? (await checkTurnstile(c));
    if (err) return err;
  } else if (method === "POST" && path === "/api/auth/sign-in/email") {
    const err = checkRateLimit(c, { max: 20, windowMs: 15 * 60 * 1000, key: "signin" });
    if (err) return err;
  }

  return auth.handler(c.req.raw);
});

// App routes
app.route("/api/quotes", quotesRouter);
app.route("/api/profile", profileRouter);

app.get("/health", (c) => c.json({ ok: true }));

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "./dist" }));
  app.use("/*", serveStatic({ path: "./dist/index.html" }));
}

const port = Number(process.env.PORT ?? 3001);
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});
