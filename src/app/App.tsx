import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { WelcomeScreen } from "./components/welcome-screen";
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
  CompanyProfile,
  QuoteStatus,
  SavedQuote,
  createEmptyQuote,
  deleteQuote,
  duplicateQuote,
  getNextQuoteNumber,
  hasProfile,
  loadProfile,
  loadQuotes,
  saveProfile,
  saveQuote
} from "./lib/storage";
import { QuoteTemplate } from "./lib/templates";

export default function App() {
  const [view, setView] = useState<"list" | "editor">("list");
  const [quotes, setQuotes] = useState<SavedQuote[]>(() => loadQuotes());
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);

  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: ""
  });

  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);

  const [clientInfo, setClientInfo] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    cuit: "",
    taxCondition: ""
  });

  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [items, setItems] = useState<ServiceItem[]>([]);

  const [taxRate, setTaxRate] = useState(21);
  const [currency, setCurrency] = useState("ARS");
  const [status, setStatus] = useState<QuoteStatus>("borrador");

  const [terms, setTerms] = useState("");
  const [notes, setNotes] = useState("");

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!hasProfile()) setProfileDialogOpen(true);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price * (1 - (item.discount ?? 0) / 100), 0);
  const taxAmount = items.reduce((sum, item) => {
    const rowSubtotal = item.quantity * item.price * (1 - (item.discount ?? 0) / 100);
    return sum + rowSubtotal * ((item.taxRate ?? 21) / 100);
  }, 0);
  const total = subtotal + taxAmount;

  useEffect(() => {
    if (view !== "editor" || !quoteId) return;

    const quote: SavedQuote = {
      id: quoteId,
      companyInfo,
      clientInfo,
      logoDataUrl,
      quoteNumber,
      quoteDate,
      validUntil,
      items,
      taxRate,
      currency,
      terms,
      notes,
      status,
      updatedAt: Date.now()
    };

    saveQuote(quote);
    setQuotes(loadQuotes());
  }, [
    view,
    quoteId,
    companyInfo,
    clientInfo,
    logoDataUrl,
    quoteNumber,
    quoteDate,
    validUntil,
    items,
    taxRate,
    currency,
    terms,
    notes,
    status
  ]);

  const loadQuoteIntoEditor = (quote: SavedQuote) => {
    setQuoteId(quote.id);
    setCompanyInfo(quote.companyInfo);
    setLogoDataUrl(quote.logoDataUrl);
    setClientInfo({
      ...quote.clientInfo,
      cuit: quote.clientInfo.cuit ?? '',
      taxCondition: quote.clientInfo.taxCondition ?? ''
    });
    setQuoteNumber(quote.quoteNumber);
    setQuoteDate(quote.quoteDate);
    setValidUntil(quote.validUntil);
    setItems(quote.items.map(item => ({
      ...item,
      taxRate: item.taxRate ?? 21,
      discount: item.discount ?? 0
    })));
    setTaxRate(quote.taxRate);
    setCurrency(quote.currency);
    setTerms(quote.terms);
    setNotes(quote.notes);
    setStatus(quote.status ?? "borrador");
    setIsEditing(true);
    setView("editor");
  };

  const handleOpenQuote = (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (quote) loadQuoteIntoEditor(quote);
  };

  const handleNewQuote = () => {
    setTemplatePickerOpen(true);
  };

  const handleSelectTemplate = (template: QuoteTemplate | null) => {
    const nextNumber = getNextQuoteNumber(quotes);
    const quote = createEmptyQuote(nextNumber);

    if (template) {
      quote.items = template.defaultItems.map((item, index) => ({
        ...item,
        id: `${Date.now()}-${index}`
      }));
    }

    saveQuote(quote);
    setQuotes(loadQuotes());
    loadQuoteIntoEditor(quote);
    setTemplatePickerOpen(false);
  };

  const handleDeleteQuote = (id: string) => {
    const deletedQuote = quotes.find((q) => q.id === id);
    deleteQuote(id);
    setQuotes(loadQuotes());

    if (deletedQuote) {
      toast("Presupuesto eliminado", {
        action: {
          label: "Deshacer",
          onClick: () => {
            saveQuote(deletedQuote);
            setQuotes(loadQuotes());
          }
        }
      });
    } else {
      toast.success("Presupuesto eliminado");
    }
  };

  const handleDuplicateQuote = (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) return;

    const nextNumber = getNextQuoteNumber(quotes);
    duplicateQuote(quote, nextNumber);
    setQuotes(loadQuotes());
    toast.success("Presupuesto duplicado");
  };

  const handleBackToList = () => {
    setQuotes(loadQuotes());
    setView("list");
    toast.success("Presupuesto guardado");
  };

  const handleCompanyInfoChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleClientInfoChange = (field: string, value: string) => {
    setClientInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: string, field: keyof ServiceItem, value: string | number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddItem = () => {
    const newItem: ServiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0,
      taxRate,
      discount: 0
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
    toast.success("PDF generado");
  };

  const handleEditProfile = () => {
    setProfileDialogOpen(true);
  };

  const handleSaveProfile = (profile: CompanyProfile) => {
    saveProfile(profile);
    setProfileDialogOpen(false);
  };

  if (view === "list") {
    return (
      <>
        <AnimatePresence>
          {!entered && (
            <WelcomeScreen onEnter={() => setEntered(true)} />
          )}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 8 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <QuoteList
            quotes={quotes}
            onOpenQuote={handleOpenQuote}
            onNewQuote={handleNewQuote}
            onDeleteQuote={handleDeleteQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onEditProfile={handleEditProfile}
          />
        </motion.div>
        <CompanyProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          initialValues={loadProfile()}
          onSave={handleSaveProfile}
        />
        <TemplatePickerDialog
          open={templatePickerOpen}
          onOpenChange={setTemplatePickerOpen}
          onSelect={handleSelectTemplate}
        />
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {!entered && (
          <WelcomeScreen onEnter={() => setEntered(true)} />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 8 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
      <div className="min-h-[100dvh] bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <Button onClick={handleBackToList} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
            >
              {isEditing ? <Eye className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? "Vista Previa" : "Editar"}
            </Button>
            {!isEditing && (
              <Button onClick={handlePrint} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir / PDF
              </Button>
            )}
          </div>
        </div>

        {/* Quote Document */}
        <div className="bg-card border border-border p-8">
          <QuoteHeader
            companyInfo={companyInfo}
            logoDataUrl={logoDataUrl}
            onCompanyInfoChange={handleCompanyInfoChange}
            onLogoChange={setLogoDataUrl}
            onLogoRemove={() => setLogoDataUrl(undefined)}
            isEditing={isEditing}
          />

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">PRESUPUESTO</h2>
          </div>

          <div className={isEditing ? "space-y-6 mb-8" : "grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8"}>
            <ClientInfo
              clientInfo={clientInfo}
              onClientInfoChange={handleClientInfoChange}
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
            onItemChange={handleItemChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            isEditing={isEditing}
            currency={currency}
          />

          <QuoteSummary
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={total}
            currency={currency}
          />

          <QuoteTerms
            terms={terms}
            notes={notes}
            onTermsChange={setTerms}
            onNotesChange={setNotes}
            isEditing={isEditing}
          />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
      </div>
      </motion.div>
      <CompanyProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        initialValues={loadProfile()}
        onSave={handleSaveProfile}
      />
    </>
  );
}
