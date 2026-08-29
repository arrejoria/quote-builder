import { gsap } from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { WelcomeScreen } from "./components/welcome-screen";
import { AppSidebar } from "./components/app-sidebar";
import { QuoteHeader } from "./components/quote-header";
import { ClientInfo } from "./components/client-info";
import { QuoteDetails } from "./components/quote-details";
import { ServiceItems, ServiceItem } from "./components/service-items";
import { QuoteSummary } from "./components/quote-summary";
import { QuoteTerms } from "./components/quote-terms";
import { QuoteList } from "./components/quote-list";
import { CompanyProfileDialog } from "./components/company-profile-dialog";
import { TemplatePickerDialog } from "./components/template-picker-dialog";
import { Edit, Printer, Eye, ArrowLeft } from "lucide-react";
import {
  CompanyProfile, QuoteStatus, SavedQuote,
  createEmptyQuote, deleteQuote, duplicateQuote, getNextQuoteNumber,
  hasProfile, loadProfile, loadQuotes, saveProfile, saveQuote,
} from "./lib/storage";
import { QuoteTemplate } from "./lib/templates";

type View = "list" | "editor";

function useViewTransition() {
  const containerRef = useRef<HTMLDivElement>(null);

  const transitionTo = (direction: "in" | "out", onComplete?: () => void) => {
    const el = containerRef.current;
    if (!el) { onComplete?.(); return; }
    if (direction === "out") {
      const fallback = setTimeout(() => onComplete?.(), 350);
      gsap.to(el, {
        opacity: 0, y: -10, duration: 0.22, ease: "power2.in",
        onComplete: () => { clearTimeout(fallback); onComplete?.(); },
      });
    } else {
      gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, ease: "power2.out", onComplete });
    }
  };

  return { containerRef, transitionTo };
}

export default function App() {
  const [view, setView] = useState<View>("list");
  const [quotes, setQuotes] = useState<SavedQuote[]>(() => loadQuotes());
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [entered, setEntered] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({ name: "", address: "", phone: "", email: "", website: "" });
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [clientInfo, setClientInfo] = useState({ name: "", company: "", email: "", phone: "", address: "", cuit: "", taxCondition: "" });
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [taxRate, setTaxRate] = useState(21);
  const [currency, setCurrency] = useState("ARS");
  const [status, setStatus] = useState<QuoteStatus>("borrador");
  const [terms, setTerms] = useState("");
  const [notes, setNotes] = useState("");

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const { containerRef, transitionTo } = useViewTransition();

  useEffect(() => { if (!hasProfile()) setProfileDialogOpen(true); }, []);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price * (1 - (item.discount ?? 0) / 100), 0);
  const taxAmount = items.reduce((sum, item) => {
    const row = item.quantity * item.price * (1 - (item.discount ?? 0) / 100);
    return sum + row * ((item.taxRate ?? 21) / 100);
  }, 0);
  const total = subtotal + taxAmount;

  useEffect(() => {
    if (view !== "editor" || !quoteId) return;
    const quote: SavedQuote = {
      id: quoteId, companyInfo, clientInfo, logoDataUrl, quoteNumber, quoteDate,
      validUntil, items, taxRate, currency, terms, notes, status, updatedAt: Date.now(),
    };
    saveQuote(quote);
    setQuotes(loadQuotes());
  }, [view, quoteId, companyInfo, clientInfo, logoDataUrl, quoteNumber, quoteDate, validUntil, items, taxRate, currency, terms, notes, status]);

  const loadQuoteIntoEditor = (quote: SavedQuote) => {
    setQuoteId(quote.id);
    setCompanyInfo(quote.companyInfo);
    setLogoDataUrl(quote.logoDataUrl);
    setClientInfo({ ...quote.clientInfo, cuit: quote.clientInfo.cuit ?? "", taxCondition: quote.clientInfo.taxCondition ?? "" });
    setQuoteNumber(quote.quoteNumber);
    setQuoteDate(quote.quoteDate);
    setValidUntil(quote.validUntil);
    setItems(quote.items.map((item) => ({ ...item, taxRate: item.taxRate ?? 21, discount: item.discount ?? 0 })));
    setTaxRate(quote.taxRate);
    setCurrency(quote.currency);
    setTerms(quote.terms);
    setNotes(quote.notes);
    setStatus(quote.status ?? "borrador");
    setIsEditing(true);
  };

  const navigateTo = (nextView: View, action: () => void) => {
    transitionTo("out", () => { action(); setView(nextView); });
  };

  const handleOpenQuote = (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) return;
    navigateTo("editor", () => loadQuoteIntoEditor(quote));
  };

  const handleNewQuote = () => setTemplatePickerOpen(true);

  const handleSelectTemplate = (template: QuoteTemplate | null) => {
    const nextNumber = getNextQuoteNumber(quotes);
    const quote = createEmptyQuote(nextNumber);
    if (template) {
      quote.items = template.defaultItems.map((item, i) => ({ ...item, id: `${Date.now()}-${i}` }));
    }
    saveQuote(quote);
    setQuotes(loadQuotes());
    navigateTo("editor", () => loadQuoteIntoEditor(quote));
    setTemplatePickerOpen(false);
  };

  const handleDeleteQuote = (id: string) => {
    const deleted = quotes.find((q) => q.id === id);
    deleteQuote(id);
    setQuotes(loadQuotes());
    if (deleted) {
      toast("Presupuesto eliminado", {
        action: { label: "Deshacer", onClick: () => { saveQuote(deleted); setQuotes(loadQuotes()); } },
      });
    }
  };

  const handleDuplicateQuote = (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) return;
    duplicateQuote(quote, getNextQuoteNumber(quotes));
    setQuotes(loadQuotes());
    toast.success("Presupuesto duplicado");
  };

  const handleBackToList = () => {
    navigateTo("list", () => { setQuotes(loadQuotes()); toast.success("Presupuesto guardado"); });
  };

  useLayoutEffect(() => {
    if (!entered) return;
    transitionTo("in");
  }, [view, entered]);

  if (!entered) return <WelcomeScreen onEnter={() => setEntered(true)} />;

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      <AppSidebar />

      {/* Content */}
      <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
        {view === "list" ? (
          <>
            <QuoteList
              quotes={quotes}
              onOpenQuote={handleOpenQuote}
              onNewQuote={handleNewQuote}
              onDeleteQuote={handleDeleteQuote}
              onDuplicateQuote={handleDuplicateQuote}
              onEditProfile={() => setProfileDialogOpen(true)}
            />
            <CompanyProfileDialog
              open={profileDialogOpen}
              onOpenChange={setProfileDialogOpen}
              initialValues={loadProfile()}
              onSave={(p: CompanyProfile) => { saveProfile(p); setProfileDialogOpen(false); }}
            />
            <TemplatePickerDialog
              open={templatePickerOpen}
              onOpenChange={setTemplatePickerOpen}
              onSelect={handleSelectTemplate}
            />
          </>
        ) : (
          <div className="flex-1 overflow-auto bg-muted/30">
            {/* Editor toolbar */}
            <div className="sticky top-0 z-10 bg-white border-b border-border px-8 py-3 flex items-center justify-between print:hidden">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a presupuestos
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                    isEditing
                      ? "bg-primary text-white border-primary hover:bg-primary/90"
                      : "bg-white text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                  {isEditing ? "Vista previa" : "Editar"}
                </button>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => { window.print(); toast.success("PDF generado"); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-white hover:bg-muted transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir / PDF
                  </button>
                )}
              </div>
            </div>

            {/* Document */}
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="bg-white border border-border rounded-xl shadow-sm p-8">
                <QuoteHeader
                  companyInfo={companyInfo}
                  logoDataUrl={logoDataUrl}
                  onCompanyInfoChange={(field, value) => setCompanyInfo((prev) => ({ ...prev, [field]: value }))}
                  onLogoChange={setLogoDataUrl}
                  onLogoRemove={() => setLogoDataUrl(undefined)}
                  isEditing={isEditing}
                />

                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">PRESUPUESTO</h2>
                </div>

                <div className={isEditing ? "space-y-8 mb-8" : "grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8"}>
                  <ClientInfo
                    clientInfo={clientInfo}
                    onClientInfoChange={(field, value) => setClientInfo((prev) => ({ ...prev, [field]: value }))}
                    isEditing={isEditing}
                  />
                  <QuoteDetails
                    quoteNumber={quoteNumber}
                    quoteDate={quoteDate}
                    validUntil={validUntil}
                    currency={currency}
                    status={status}
                    onQuoteNumberChange={setQuoteNumber}
                    onQuoteDateChange={setQuoteDate}
                    onValidUntilChange={setValidUntil}
                    onCurrencyChange={setCurrency}
                    onStatusChange={setStatus}
                    isEditing={isEditing}
                  />
                </div>

                <ServiceItems
                  items={items}
                  onItemChange={(id, field, value) =>
                    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
                  }
                  onAddItem={() =>
                    setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, price: 0, taxRate, discount: 0 }])
                  }
                  onRemoveItem={(id) => setItems(items.filter((item) => item.id !== id))}
                  isEditing={isEditing}
                  currency={currency}
                />

                <QuoteSummary subtotal={subtotal} taxAmount={taxAmount} total={total} currency={currency} />

                <QuoteTerms
                  terms={terms}
                  notes={notes}
                  onTermsChange={setTerms}
                  onNotesChange={setNotes}
                  isEditing={isEditing}
                />
              </div>
            </div>

            <style>{`
              @media print {
                body { background: white; }
                .print\\:hidden { display: none !important; }
              }
            `}</style>

            <CompanyProfileDialog
              open={profileDialogOpen}
              onOpenChange={setProfileDialogOpen}
              initialValues={loadProfile()}
              onSave={(p: CompanyProfile) => { saveProfile(p); setProfileDialogOpen(false); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
