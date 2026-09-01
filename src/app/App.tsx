import { gsap } from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { WelcomeScreen } from "./components/welcome-screen";
import { AuthPage } from "./components/auth/AuthPage";
import { GuestBanner, GUEST_QUOTA } from "./components/auth/GuestBanner";
import { AppSidebar } from "./components/app-sidebar";
import { useAuth } from "../contexts/AuthContext";
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
  createEmptyQuote, getNextQuoteNumber,
} from "./lib/storage";
import { getProfile, upsertProfile } from "../lib/profile-service";
import {
  listQuotes, getFullQuote, createQuote, persistQuote,
  removeQuote, cloneQuote, importLocalQuotes,
} from "../lib/quotes-service";
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

const GUEST_KEY = "presupuestador:guestMode";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === "true");

  const handleGuestContinue = () => {
    localStorage.setItem(GUEST_KEY, "true");
    setIsGuest(true);
  };

  const handleSignUpFromGuest = () => {
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
    }
  }, [isAuthenticated]);

  const [view, setView] = useState<View>("list");
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [entered, setEntered] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasAuthenticatedRef = useRef(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const refreshQuotes = useCallback(async () => {
    const list = await listQuotes(isAuthenticated);
    setQuotes(list);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!entered) return;
    if (!isAuthenticated && !isGuest) return;
    refreshQuotes();
  }, [entered, isAuthenticated, isGuest, refreshQuotes]);

  // Guest → account migration: runs once on first sign-in
  useEffect(() => {
    if (isAuthenticated && !wasAuthenticatedRef.current) {
      importLocalQuotes()
        .then(() => refreshQuotes())
        .catch(() => {});
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, refreshQuotes]);

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
  const [profileData, setProfileData] = useState<CompanyProfile | null>(null);

  const { containerRef, transitionTo } = useViewTransition();

  const handleExportPdf = async () => {
    const el = documentRef.current;
    if (!el) return;
    const toastId = toast.loading("Generando PDF…");
    try {
      const [{ toJpeg }, { default: jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      const dataUrl = await toJpeg(el, { quality: 0.97, pixelRatio: 2, backgroundColor: "#ffffff" });
      const img = new Image();
      await new Promise<void>((res) => { img.onload = () => res(); img.src = dataUrl; });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (img.naturalHeight * imgW) / img.naturalWidth;
      let yOffset = 0;
      let remaining = imgH;
      while (remaining > 0) {
        pdf.addImage(dataUrl, "JPEG", 0, -yOffset, imgW, imgH);
        remaining -= pageH;
        if (remaining > 0) { pdf.addPage(); yOffset += pageH; }
      }
      pdf.save(`Presupuesto-${quoteNumber}.pdf`);
      toast.success("PDF descargado", { id: toastId });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Error al generar el PDF", { id: toastId });
    }
  };

  useEffect(() => {
    if (!entered || (!isAuthenticated && !isGuest)) return;
    getProfile(isAuthenticated).then((p) => {
      setProfileData(p);
      if (!p) setProfileDialogOpen(true);
    });
  }, [entered, isAuthenticated, isGuest]);

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
    if (!isAuthenticated) {
      persistQuote(quote, false);
      listQuotes(false).then(setQuotes);
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistQuote(quote, true)
        .then(() => listQuotes(true))
        .then(setQuotes)
        .catch(() => toast.error("Error al guardar"));
    }, 1500);
  }, [view, quoteId, companyInfo, clientInfo, logoDataUrl, quoteNumber, quoteDate, validUntil, items, taxRate, currency, terms, notes, status, isAuthenticated]);

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

  const handleOpenQuote = async (id: string) => {
    const quote = await getFullQuote(id, isAuthenticated);
    if (!quote) return;
    navigateTo("editor", () => loadQuoteIntoEditor(quote));
  };

  const handleNewQuote = () => {
    if (isGuest && quotes.length >= GUEST_QUOTA) {
      toast("Guest limit reached", {
        description: "Create a free account to add unlimited quotes.",
        action: { label: "Sign up", onClick: handleSignUpFromGuest },
      });
      return;
    }
    setTemplatePickerOpen(true);
  };

  const handleSelectTemplate = async (template: QuoteTemplate | null) => {
    const nextNumber = getNextQuoteNumber(quotes);
    const quote = createEmptyQuote(nextNumber);
    if (profileData) {
      quote.companyInfo = { ...profileData };
      if (profileData.logoDataUrl) quote.logoDataUrl = profileData.logoDataUrl;
    }
    if (template) {
      quote.items = template.defaultItems.map((item, i) => ({ ...item, id: `${Date.now()}-${i}` }));
    }
    await createQuote(quote, isAuthenticated);
    await refreshQuotes();
    navigateTo("editor", () => loadQuoteIntoEditor(quote));
    setTemplatePickerOpen(false);
  };

  const handleDeleteQuote = async (id: string) => {
    const deleted = quotes.find((q) => q.id === id);
    await removeQuote(id, isAuthenticated);
    await refreshQuotes();
    if (deleted) {
      toast("Presupuesto eliminado", {
        action: {
          label: "Deshacer",
          onClick: () => createQuote(deleted, isAuthenticated).then(refreshQuotes),
        },
      });
    }
  };

  const handleDuplicateQuote = async (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) return;
    await cloneQuote(quote, getNextQuoteNumber(quotes), isAuthenticated);
    await refreshQuotes();
    toast.success("Presupuesto duplicado");
  };

  const handleBackToList = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    navigateTo("list", () => {
      if (quoteId) {
        const quote: SavedQuote = {
          id: quoteId, companyInfo, clientInfo, logoDataUrl, quoteNumber, quoteDate,
          validUntil, items, taxRate, currency, terms, notes, status, updatedAt: Date.now(),
        };
        persistQuote(quote, isAuthenticated)
          .then(refreshQuotes)
          .catch(() => {});
      }
      toast.success("Presupuesto guardado");
    });
  };

  useLayoutEffect(() => {
    if (!entered) return;
    transitionTo("in");
  }, [view, entered]);

  if (!entered) return <WelcomeScreen onEnter={() => setEntered(true)} />;
  if (isLoading) return (
    <div className="flex h-[100dvh] items-center justify-center bg-background">
      <div className="w-5 h-5 rounded-full border-2 border-border border-t-primary animate-spin" />
    </div>
  );
  if (!isAuthenticated && !isGuest) return <AuthPage onGuestContinue={handleGuestContinue} />;

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      <AppSidebar />

      {/* Content */}
      <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
        {view === "list" ? (
          <>
            {isGuest && (
              <GuestBanner quoteCount={quotes.length} onSignUp={handleSignUpFromGuest} />
            )}
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
              initialValues={profileData}
              onSave={(p: CompanyProfile) => {
                upsertProfile(p, isAuthenticated).then(() => setProfileData(p));
                setProfileDialogOpen(false);
              }}
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
                    onClick={handleExportPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-white hover:bg-muted transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Descargar PDF
                  </button>
                )}
              </div>
            </div>

            {/* Document */}
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div ref={documentRef} className="bg-white border border-border rounded-xl shadow-sm p-8">
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


            <CompanyProfileDialog
              open={profileDialogOpen}
              onOpenChange={setProfileDialogOpen}
              initialValues={profileData}
              onSave={(p: CompanyProfile) => {
                upsertProfile(p, isAuthenticated).then(() => setProfileData(p));
                setProfileDialogOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
