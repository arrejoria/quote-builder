import { ServiceItem } from "../components/service-items";

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface ClientInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  cuit: string;
  taxCondition: string;
}

export type QuoteStatus = "borrador" | "enviado" | "aceptado" | "rechazado" | "vencido";

export interface SavedQuote {
  id: string;
  companyInfo: CompanyInfo;
  clientInfo: ClientInfo;
  logoDataUrl?: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  items: ServiceItem[];
  /** Default tax rate (%) pre-filled onto newly-added items. Not used for the quote total anymore — see per-item taxRate. */
  taxRate: number;
  currency: string;
  terms: string;
  notes: string;
  status: QuoteStatus;
  updatedAt: number;
}

const STORAGE_KEY = "presupuestador:quotes";
const PROFILE_STORAGE_KEY = "presupuestador:profile";

export const DEFAULT_TERMS = `- El presupuesto es válido por 30 días desde la fecha de emisión.
- Se requiere un pago del 50% para iniciar el proyecto.
- El 50% restante se abonará al finalizar el proyecto.
- El plazo de entrega estimado es de 4-6 semanas desde el inicio del proyecto.
- Incluye 3 rondas de revisiones.
- No incluye registro de dominio ni hosting (se puede contratar por separado).
- Los cambios significativos fuera del alcance inicial podrían generar costes adicionales.`;

export const DEFAULT_NOTES = `Este presupuesto incluye todos los servicios especificados para el desarrollo de un sitio web WordPress profesional y funcional. Estoy disponible para resolver cualquier duda o ajustar el presupuesto según tus necesidades específicas.`;

export function loadProfile(): CompanyProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CompanyProfile;
  } catch (error) {
    console.error("Error al cargar el perfil de la empresa", error);
    return null;
  }
}

export function saveProfile(profile: CompanyProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error al guardar el perfil de la empresa", error);
  }
}

export function hasProfile(): boolean {
  return loadProfile() !== null;
}

export function loadQuotes(): SavedQuote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, SavedQuote>;
    return Object.values(parsed);
  } catch (error) {
    console.error("Error al cargar los presupuestos guardados", error);
    return [];
  }
}

export function getQuote(id: string): SavedQuote | undefined {
  return loadQuotes().find((quote) => quote.id === id);
}

export function saveQuote(quote: SavedQuote): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, SavedQuote> = raw ? JSON.parse(raw) : {};
    all[quote.id] = quote;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error("Error al guardar el presupuesto", error);
  }
}

export function deleteQuote(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const all: Record<string, SavedQuote> = JSON.parse(raw);
    delete all[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error("Error al eliminar el presupuesto", error);
  }
}

export function getNextQuoteNumber(quotes: SavedQuote[]): string {
  const currentYear = new Date().getFullYear();
  const pattern = new RegExp(`^PRE-${currentYear}-(\\d{3,})$`);

  const max = quotes.reduce((highest, quote) => {
    const match = quote.quoteNumber.match(pattern);
    if (!match) return highest;
    const value = parseInt(match[1], 10);
    return value > highest ? value : highest;
  }, 0);

  return `PRE-${currentYear}-${String(max + 1).padStart(3, "0")}`;
}

export function duplicateQuote(quote: SavedQuote, newQuoteNumber: string): SavedQuote {
  const duplicated: SavedQuote = {
    ...quote,
    id: Date.now().toString(),
    quoteNumber: newQuoteNumber,
    status: "borrador",
    updatedAt: Date.now()
  };

  saveQuote(duplicated);
  return duplicated;
}

export function createEmptyQuote(quoteNumber: string): SavedQuote {
  const today = new Date().toISOString().split("T")[0];
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return {
    id: Date.now().toString(),
    companyInfo: loadProfile() ?? {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: ""
    },
    clientInfo: {
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      cuit: "",
      taxCondition: ""
    },
    logoDataUrl: undefined,
    quoteNumber,
    quoteDate: today,
    validUntil,
    items: [],
    taxRate: 21,
    currency: "ARS",
    terms: DEFAULT_TERMS,
    notes: DEFAULT_NOTES,
    status: "borrador",
    updatedAt: Date.now()
  };
}
