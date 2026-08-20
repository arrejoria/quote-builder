import { useState } from "react";
import { Button } from "./components/ui/button";
import { QuoteHeader } from "./components/quote-header";
import { ClientInfo } from "./components/client-info";
import { ServiceItems, ServiceItem } from "./components/service-items";
import { QuoteSummary } from "./components/quote-summary";
import { QuoteTerms } from "./components/quote-terms";
import { CurrencySelector } from "./components/currency-selector";
import { Edit, Printer, Eye } from "lucide-react";

export default function App() {
  const [isEditing, setIsEditing] = useState(true);

  // Company Info
  const [companyInfo, setCompanyInfo] = useState({
    name: "Desarrollo Web Profesional",
    address: "Calle Ejemplo 123\n28001 Madrid, España",
    phone: "+34 600 000 000",
    email: "contacto@tuempresa.com",
    website: "www.tuempresa.com"
  });

  // Client Info
  const [clientInfo, setClientInfo] = useState({
    name: "Juan Pérez",
    company: "Cliente Ejemplo S.L.",
    email: "cliente@ejemplo.com",
    phone: "+34 600 111 222",
    address: "Calle Cliente 456\n28002 Madrid, España"
  });

  // Quote Details
  const [quoteNumber, setQuoteNumber] = useState("PRE-2024-001");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Service Items
  const [items, setItems] = useState<ServiceItem[]>([
    {
      id: '1',
      description: 'Diseño y desarrollo de sitio web WordPress personalizado\nIncluye diseño responsive y optimización SEO',
      quantity: 1,
      price: 500000
    },
    {
      id: '2',
      description: 'Instalación y configuración de plugins premium\n(WooCommerce, Yoast SEO, Elementor Pro)',
      quantity: 1,
      price: 100000
    },
    {
      id: '3',
      description: 'Migración de contenido desde sitio web anterior',
      quantity: 1,
      price: 65000
    },
    {
      id: '4',
      description: 'Capacitación para gestión del sitio web\n(2 sesiones de 2 horas)',
      quantity: 4,
      price: 25000
    }
  ]);

  // Tax and Totals
  const [taxRate, setTaxRate] = useState(21);

  // Currency
  const [currency, setCurrency] = useState("ARS");

  // Terms and Notes
  const [terms, setTerms] = useState(
    `- El presupuesto es válido por 30 días desde la fecha de emisión.
- Se requiere un pago del 50% para iniciar el proyecto.
- El 50% restante se abonará al finalizar el proyecto.
- El plazo de entrega estimado es de 4-6 semanas desde el inicio del proyecto.
- Incluye 3 rondas de revisiones.
- No incluye registro de dominio ni hosting (se puede contratar por separado).
- Los cambios significativos fuera del alcance inicial podrían generar costes adicionales.`
  );
  const [notes, setNotes] = useState(
    `Este presupuesto incluye todos los servicios especificados para el desarrollo de un sitio web WordPress profesional y funcional. Estoy disponible para resolver cualquier duda o ajustar el presupuesto según tus necesidades específicas.`
  );

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Handlers
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <CurrencySelector currency={currency} onCurrencyChange={setCurrency} />
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
            onCompanyInfoChange={handleCompanyInfoChange}
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
  );
}