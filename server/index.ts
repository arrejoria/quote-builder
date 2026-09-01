import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { quotesRouter } from "./routes/quotes";
import { profileRouter } from "./routes/profile";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (process.env.TRUSTED_ORIGINS ?? "http://localhost:5173").split(","),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Better Auth handles all /api/auth/* routes
app.on(["GET", "POST"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// App routes
app.route("/api/quotes", quotesRouter);
app.route("/api/profile", profileRouter);

app.get("/health", (c) => c.json({ ok: true }));

const port = Number(process.env.PORT ?? 3001);
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`);
});
