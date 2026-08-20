import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { QuoteHeader } from "./components/quote-header";
import { ClientInfo } from "./components/client-info";
import { ServiceItems, ServiceItem } from "./components/service-items";
import { QuoteSummary } from "./components/quote-summary";
import { QuoteTerms } from "./components/quote-terms";
import { CurrencySelector } from "./components/currency-selector";
import { QuoteList } from "./components/quote-list";
import { CompanyProfileDialog } from "./components/company-profile-dialog";
import { Edit, Printer, Eye, ArrowLeft } from "lucide-react";
import {
  CompanyProfile,
  SavedQuote,
  createEmptyQuote,
  deleteQuote,
  getNextQuoteNumber,
  hasProfile,
  loadProfile,
  loadQuotes,
  saveProfile,
  saveQuote
} from "./lib/storage";

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
    address: ""
  });

  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [items, setItems] = useState<ServiceItem[]>([]);

  const [taxRate, setTaxRate] = useState(21);
  const [currency, setCurrency] = useState("ARS");

  const [terms, setTerms] = useState("");
  const [notes, setNotes] = useState("");

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    if (!hasProfile()) setProfileDialogOpen(true);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (taxRate / 100);
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
    notes
  ]);

  const loadQuoteIntoEditor = (quote: SavedQuote) => {
    setQuoteId(quote.id);
    setCompanyInfo(quote.companyInfo);
    setLogoDataUrl(quote.logoDataUrl);
    setClientInfo(quote.clientInfo);
    setQuoteNumber(quote.quoteNumber);
    setQuoteDate(quote.quoteDate);
    setValidUntil(quote.validUntil);
    setItems(quote.items);
    setTaxRate(quote.taxRate);
    setCurrency(quote.currency);
    setTerms(quote.terms);
    setNotes(quote.notes);
    setIsEditing(true);
    setView("editor");
  };

  const handleOpenQuote = (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (quote) loadQuoteIntoEditor(quote);
  };

  const handleNewQuote = () => {
    const nextNumber = getNextQuoteNumber(quotes);
    const quote = createEmptyQuote(nextNumber);
    saveQuote(quote);
    setQuotes(loadQuotes());
    loadQuoteIntoEditor(quote);
  };

  const handleDeleteQuote = (id: string) => {
    deleteQuote(id);
    setQuotes(loadQuotes());
  };

  const handleBackToList = () => {
    setQuotes(loadQuotes());
    setView("list");
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
      price: 0
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
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
        <QuoteList
          quotes={quotes}
          onOpenQuote={handleOpenQuote}
          onNewQuote={handleNewQuote}
          onDeleteQuote={handleDeleteQuote}
          onEditProfile={handleEditProfile}
        />
        <CompanyProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          initialValues={loadProfile()}
          onSave={handleSaveProfile}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <Button onClick={handleBackToList} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
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
        <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none">
          <QuoteHeader
            companyInfo={companyInfo}
            logoDataUrl={logoDataUrl}
            onCompanyInfoChange={handleCompanyInfoChange}
            onLogoChange={setLogoDataUrl}
            onLogoRemove={() => setLogoDataUrl(undefined)}
            isEditing={isEditing}
          />

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800">PRESUPUESTO</h2>
          </div>

          <ClientInfo
            clientInfo={clientInfo}
            quoteNumber={quoteNumber}
            quoteDate={quoteDate}
            validUntil={validUntil}
            onClientInfoChange={handleClientInfoChange}
            onQuoteNumberChange={setQuoteNumber}
            onQuoteDateChange={setQuoteDate}
            onValidUntilChange={setValidUntil}
            isEditing={isEditing}
          />

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
            taxRate={taxRate}
            taxAmount={taxAmount}
            total={total}
            onTaxRateChange={setTaxRate}
            isEditing={isEditing}
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
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
      </div>
      <CompanyProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        initialValues={loadProfile()}
        onSave={handleSaveProfile}
      />
    </>
  );
}
