import type { SavedQuote, QuoteStatus } from "../app/lib/storage";
import type { ServiceItem } from "../app/components/service-items";
import { loadQuotes, saveQuote, getQuote, deleteQuote, duplicateQuote } from "../app/lib/storage";

// --- API helpers ---

async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// --- DB row mappers ---

type DbQuoteRow = Record<string, unknown>;

function mapItem(row: DbQuoteRow): ServiceItem {
  return {
    id: row.id as string,
    description: (row.description as string) ?? "",
    quantity: parseFloat((row.quantity as string) ?? "1"),
    price: parseFloat((row.price as string) ?? "0"),
    taxRate: parseFloat((row.taxRate as string) ?? "0"),
    discount: parseFloat((row.discount as string) ?? "0"),
  };
}

function mapQuote(row: DbQuoteRow, items: ServiceItem[] = []): SavedQuote {
  return {
    id: row.id as string,
    quoteNumber: row.quoteNumber as string,
    quoteDate: row.quoteDate as string,
    validUntil: row.validUntil as string,
    status: (row.status as QuoteStatus) ?? "borrador",
    currency: (row.currency as string) ?? "ARS",
    taxRate: parseFloat((row.taxRate as string) ?? "21"),
    terms: (row.terms as string) ?? "",
    notes: (row.notes as string) ?? "",
    companyInfo: row.companyInfo as SavedQuote["companyInfo"],
    clientInfo: row.clientInfo as SavedQuote["clientInfo"],
    logoDataUrl: (row.logoDataUrl as string) ?? undefined,
    updatedAt: row.updatedAt ? new Date(row.updatedAt as string).getTime() : Date.now(),
    items,
  };
}

// --- Public service API ---

export async function listQuotes(isAuthenticated: boolean): Promise<SavedQuote[]> {
  if (!isAuthenticated) return loadQuotes();
  const rows = await apiFetch<DbQuoteRow[]>("/quotes");
  return rows.map((r) => mapQuote(r));
}

export async function getFullQuote(id: string, isAuthenticated: boolean): Promise<SavedQuote | undefined> {
  if (!isAuthenticated) return getQuote(id);
  try {
    const row = await apiFetch<DbQuoteRow>(`/quotes/${id}`);
    const items = ((row.items ?? []) as DbQuoteRow[]).map(mapItem);
    return mapQuote(row, items);
  } catch {
    return undefined;
  }
}

export async function createQuote(quote: SavedQuote, isAuthenticated: boolean): Promise<void> {
  if (!isAuthenticated) { saveQuote(quote); return; }
  await apiFetch("/quotes", {
    method: "POST",
    body: JSON.stringify({ ...quote, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() }),
  });
}

export async function persistQuote(quote: SavedQuote, isAuthenticated: boolean): Promise<void> {
  if (!isAuthenticated) { saveQuote(quote); return; }
  await apiFetch(`/quotes/${quote.id}`, {
    method: "PUT",
    body: JSON.stringify({ ...quote, updatedAt: new Date().toISOString() }),
  });
}

export async function removeQuote(id: string, isAuthenticated: boolean): Promise<void> {
  if (!isAuthenticated) { deleteQuote(id); return; }
  await apiFetch(`/quotes/${id}`, { method: "DELETE" });
}

export async function cloneQuote(
  quote: SavedQuote,
  newNumber: string,
  isAuthenticated: boolean,
): Promise<SavedQuote> {
  const cloned: SavedQuote = {
    ...quote,
    id: Date.now().toString(),
    quoteNumber: newNumber,
    status: "borrador",
    updatedAt: Date.now(),
  };
  if (!isAuthenticated) {
    duplicateQuote(quote, newNumber);
    return cloned;
  }
  await createQuote(cloned, true);
  return cloned;
}

export async function importLocalQuotes(): Promise<void> {
  const local = loadQuotes();
  if (!local.length) return;
  await apiFetch("/quotes/import", {
    method: "POST",
    body: JSON.stringify({ quotes: local }),
  });
  localStorage.removeItem("presupuestador:quotes");
}
