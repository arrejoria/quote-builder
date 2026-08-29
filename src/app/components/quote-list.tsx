import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Eye, Copy, Trash2, Plus, Building2, Search, ChevronsUpDown, X, FileText, Download } from "lucide-react";
import { SavedQuote, QuoteStatus } from "../lib/storage";
import { cn } from "./ui/utils";

interface QuoteListProps {
  quotes: SavedQuote[];
  onOpenQuote: (id: string) => void;
  onNewQuote: () => void;
  onDeleteQuote: (id: string) => void;
  onDuplicateQuote: (id: string) => void;
  onEditProfile: () => void;
}

// ── helpers ────────────────────────────────────────────────────────────────

function calculateTotal(quote: SavedQuote) {
  return quote.items.reduce((sum, item) => {
    const row = item.quantity * item.price * (1 - (item.discount ?? 0) / 100);
    return sum + row + row * ((item.taxRate ?? 21) / 100);
  }, 0);
}

function formatMoney(value: number) {
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
];

function getAvatarColor(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const STATUS_CONFIG: Record<QuoteStatus, { label: string; dot: string; className: string }> = {
  borrador:  { label: "Borrador",  dot: "bg-blue-500",   className: "bg-blue-50   text-blue-700  border-blue-200"  },
  enviado:   { label: "Enviado",   dot: "bg-sky-500",    className: "bg-sky-50    text-sky-700   border-sky-200"   },
  aprobado:  { label: "Aprobado",  dot: "bg-green-500",  className: "bg-green-50  text-green-700 border-green-200" },
  rechazado: { label: "Rechazado", dot: "bg-red-500",    className: "bg-red-50    text-red-700   border-red-200"   },
  vencido:   { label: "Vencido",   dot: "bg-yellow-500", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

function StatusBadge({ status }: { status: QuoteStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.borrador;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", cfg.className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ── component ──────────────────────────────────────────────────────────────

export function QuoteList({ quotes, onOpenQuote, onNewQuote, onDeleteQuote, onDuplicateQuote, onEditProfile }: QuoteListProps) {
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const sorted = [...quotes].sort((a, b) =>
    sortDir === "desc" ? b.updatedAt - a.updatedAt : a.updatedAt - b.updatedAt
  );

  const filtered = sorted.filter((q) => {
    const q_ = search.toLowerCase();
    return (
      q.clientInfo.name.toLowerCase().includes(q_) ||
      (q.clientInfo.company ?? "").toLowerCase().includes(q_) ||
      q.quoteNumber.toLowerCase().includes(q_)
    );
  });

  const selectedQuote = filtered.find((q) => q.id === selectedId) ?? null;

  // Stagger rows on mount / list change
  useLayoutEffect(() => {
    const rows = tbodyRef.current?.querySelectorAll("tr");
    if (!rows?.length) return;
    gsap.fromTo(rows,
      { y: 10 },
      { y: 0, duration: 0.35, ease: "power2.out", stagger: 0.05, delay: 0.05 }
    );
  }, [filtered.length]);

  // Panel slide-in on selection
  useLayoutEffect(() => {
    if (selectedId && panelRef.current) {
      gsap.fromTo(panelRef.current,
        { x: 20 },
        { x: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [selectedId]);

  const handleRowClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex h-full">
      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-8 pt-8 pb-5 shrink-0">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Presupuestos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gestión centralizada de cotizaciones</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg bg-white hover:bg-muted transition-colors duration-150"
            >
              <Building2 className="w-4 h-4" />
              Mi Empresa
            </button>
            <button
              type="button"
              onClick={onNewQuote}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-150"
            >
              <Plus className="w-4 h-4" />
              Nuevo Presupuesto
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-8 pb-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar presupuestos por cliente, ID o proyecto..."
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-border rounded-lg bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-8 pb-8">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/30" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-foreground">No hay presupuestos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? "Probá con otro término de búsqueda" : "Creá tu primer presupuesto"}
                </p>
              </div>
              {!search && (
                <button
                  type="button"
                  onClick={onNewQuote}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Presupuesto
                </button>
              )}
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <button
                        type="button"
                        onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Fecha creación
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monto total</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody ref={tbodyRef} className="divide-y divide-border">
                  {filtered.map((quote) => {
                    const isSelected = selectedId === quote.id;
                    const total = calculateTotal(quote);
                    const initials = getInitials(quote.clientInfo.name || "?");
                    const avatarColor = getAvatarColor(quote.clientInfo.name || "?");
                    return (
                      <tr
                        key={quote.id}
                        onClick={() => handleRowClick(quote.id)}
                        className={cn(
                          "cursor-pointer transition-colors duration-100",
                          isSelected ? "bg-blue-50/70" : "hover:bg-muted/40"
                        )}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", avatarColor)}>
                              {initials}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {quote.clientInfo.name || "Sin nombre de cliente"}
                              </p>
                              {quote.clientInfo.company && (
                                <p className="text-xs text-muted-foreground truncate">{quote.clientInfo.company}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground tabular-nums">{quote.quoteNumber}</td>
                        <td className="px-4 py-3.5 text-muted-foreground tabular-nums">{formatDate(quote.updatedAt)}</td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={quote.status ?? "borrador"} />
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold tabular-nums">
                          {formatMoney(total)}
                          <span className="text-muted-foreground font-normal ml-1 text-xs">{quote.currency}</span>
                        </td>
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Abrir"
                              onClick={() => onOpenQuote(quote.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              title="Duplicar"
                              onClick={() => onDuplicateQuote(quote.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  type="button"
                                  title="Eliminar"
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar este presupuesto?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará {quote.quoteNumber} de forma permanente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => { onDeleteQuote(quote.id); if (selectedId === quote.id) setSelectedId(null); }}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      {selectedQuote && (
        <div
          ref={panelRef}
          className="w-72 shrink-0 border-l border-border bg-white flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Resumen del presupuesto</h3>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{selectedQuote.quoteNumber}</p>
              <p className="font-medium text-sm">
                {selectedQuote.clientInfo.name || "Sin nombre de cliente"}
              </p>
              {selectedQuote.clientInfo.company && (
                <p className="text-xs text-muted-foreground">{selectedQuote.clientInfo.company}</p>
              )}
            </div>

            <div className="border-t border-border/60 pt-3 space-y-2">
              {selectedQuote.items.map((item) => {
                const row = item.quantity * item.price * (1 - (item.discount ?? 0) / 100);
                return (
                  <div key={item.id} className="flex justify-between gap-2 text-xs">
                    <span className="text-muted-foreground truncate flex-1">
                      {item.description || "Sin descripción"}
                    </span>
                    <span className="tabular-nums font-medium shrink-0">
                      {formatMoney(row)}
                    </span>
                  </div>
                );
              })}
              {!selectedQuote.items.length && (
                <p className="text-xs text-muted-foreground">Sin ítems</p>
              )}
            </div>

            {selectedQuote.items.length > 0 && (
              <div className="border-t border-border pt-3 space-y-1">
                {(() => {
                  const subtotal = selectedQuote.items.reduce((s, i) => s + i.quantity * i.price * (1 - (i.discount ?? 0) / 100), 0);
                  const tax = selectedQuote.items.reduce((s, i) => {
                    const row = i.quantity * i.price * (1 - (i.discount ?? 0) / 100);
                    return s + row * ((i.taxRate ?? 21) / 100);
                  }, 0);
                  return (
                    <>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Subtotal</span><span className="tabular-nums">{formatMoney(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>IVA</span><span className="tabular-nums">{formatMoney(tax)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
                        <span>Total</span>
                        <span className="tabular-nums">{formatMoney(subtotal + tax)} <span className="text-muted-foreground font-normal text-xs">{selectedQuote.currency}</span></span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-border space-y-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenQuote(selectedQuote.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
            <button
              type="button"
              onClick={() => onOpenQuote(selectedQuote.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium border border-border rounded-lg bg-white hover:bg-muted transition-colors"
            >
              Abrir presupuesto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
