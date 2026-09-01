import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { companyProfiles } from "../db/schema";

type Variables = { userId: string };

const router = new Hono<{ Variables: Variables }>();

router.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", session.user.id);
  await next();
});

// GET /api/profile
router.get("/", async (c) => {
  const userId = c.get("userId");
  const [row] = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, userId));
  if (!row) return c.json(null);
  return c.json({
    name: row.name,
    address: row.address ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    logoDataUrl: row.logoDataUrl ?? undefined,
  });
});

// PUT /api/profile
router.put("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  await db
    .insert(companyProfiles)
    .values({
      userId,
      name: body.name ?? "",
      address: body.address ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      website: body.website ?? null,
      logoDataUrl: body.logoDataUrl ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: companyProfiles.userId,
      set: {
        name: body.name ?? "",
        address: body.address ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        website: body.website ?? null,
        logoDataUrl: body.logoDataUrl ?? null,
        updatedAt: new Date(),
      },
    });

  return c.json({ ok: true });
});

export { router as profileRouter };
