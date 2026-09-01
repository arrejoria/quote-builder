import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { quotes, quoteItems } from "../db/schema";

type Variables = { userId: string };

const router = new Hono<{ Variables: Variables }>();

// Auth middleware — every quote route requires a session
router.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", session.user.id);
  await next();
});

// GET /api/quotes — list all quotes for current user
router.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await db
    .select()
    .from(quotes)
    .where(eq(quotes.userId, userId))
    .orderBy(desc(quotes.updatedAt));
  return c.json(rows);
});

// GET /api/quotes/:id
router.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, id));
  if (!quote || quote.userId !== userId) return c.json({ error: "Not found" }, 404);
  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, id))
    .orderBy(quoteItems.sortOrder);
  return c.json({ ...quote, items });
});

// POST /api/quotes — create a new quote
router.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const { items: rawItems, ...quoteData } = body;

  const newQuote = {
    ...quoteData,
    id: quoteData.id ?? crypto.randomUUID(),
    userId,
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  await db.insert(quotes).values(newQuote);

  if (rawItems?.length) {
    await db.insert(quoteItems).values(
      rawItems.map((item: Record<string, unknown>, i: number) => ({
        ...item,
        id: item.id ?? crypto.randomUUID(),
        quoteId: newQuote.id,
        sortOrder: i,
      }))
    );
  }

  return c.json({ id: newQuote.id }, 201);
});

// PUT /api/quotes/:id — full update
router.put("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json();
  const { items: rawItems, ...quoteData } = body;

  const [existing] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!existing || existing.userId !== userId) return c.json({ error: "Not found" }, 404);

  await db.update(quotes).set({
    quoteNumber: body.quoteNumber,
    quoteDate: body.quoteDate,
    validUntil: body.validUntil,
    status: body.status,
    currency: body.currency,
    taxRate: String(body.taxRate ?? "21"),
    terms: body.terms ?? null,
    notes: body.notes ?? null,
    companyInfo: body.companyInfo,
    clientInfo: body.clientInfo,
    logoDataUrl: body.logoDataUrl ?? null,
    updatedAt: new Date(),
  }).where(eq(quotes.id, id));

  if (rawItems !== undefined) {
    await db.delete(quoteItems).where(eq(quoteItems.quoteId, id));
    if (rawItems.length) {
      await db.insert(quoteItems).values(
        rawItems.map((item: Record<string, unknown>, i: number) => ({
          ...item,
          id: item.id ?? crypto.randomUUID(),
          quoteId: id,
          sortOrder: i,
        }))
      );
    }
  }

  return c.json({ ok: true });
});

// DELETE /api/quotes/:id
router.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const [existing] = await db.select().from(quotes).where(eq(quotes.id, id));
  if (!existing || existing.userId !== userId) return c.json({ error: "Not found" }, 404);
  await db.delete(quotes).where(eq(quotes.id, id));
  return c.json({ ok: true });
});

// POST /api/quotes/import — bulk import from localStorage (guest → account migration)
router.post("/import", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const localQuotes: Array<Record<string, unknown>> = body.quotes ?? [];
  const inserted: string[] = [];

  for (const q of localQuotes) {
    const { items: rawItems, ...quoteData } = q as { items?: Array<Record<string, unknown>> } & Record<string, unknown>;
    const id = (quoteData.id as string) ?? crypto.randomUUID();
    await db.insert(quotes).values({
      ...(quoteData as Parameters<typeof db.insert>[0] extends { values: (v: infer V) => unknown } ? V : never),
      id,
      userId,
      updatedAt: new Date(),
      createdAt: new Date(),
    }).onConflictDoNothing();

    if (rawItems?.length) {
      await db.insert(quoteItems).values(
        rawItems.map((item, i) => ({
          ...item,
          id: (item.id as string) ?? crypto.randomUUID(),
          quoteId: id,
          sortOrder: i,
        }))
      ).onConflictDoNothing();
    }
    inserted.push(id);
  }

  return c.json({ imported: inserted.length });
});

export { router as quotesRouter };
