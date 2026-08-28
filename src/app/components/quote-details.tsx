import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CurrencySelector } from "./currency-selector";
import { QuoteStatusBadge, QUOTE_STATUS_LABELS } from "./quote-status-badge";
import { QuoteStatus } from "../lib/storage";

interface QuoteDetailsProps {
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  currency: string;
  status: QuoteStatus;
  onQuoteNumberChange: (value: string) => void;
  onQuoteDateChange: (value: string) => void;
  onValidUntilChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onStatusChange: (value: QuoteStatus) => void;
  isEditing: boolean;
}

export function QuoteDetails({
  quoteNumber,
  quoteDate,
  validUntil,
  currency,
  status,
  onQuoteNumberChange,
  onQuoteDateChange,
  onValidUntilChange,
  onCurrencyChange,
  onStatusChange,
  isEditing
}: QuoteDetailsProps) {
  if (isEditing) {
    return (
      <div className="space-y-4 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold tracking-tight">Presupuesto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quoteNumber">Nº Presupuesto</Label>
            <Input
              id="quoteNumber"
              value={quoteNumber}
              onChange={(e) => onQuoteNumberChange(e.target.value)}
              placeholder="PRE-2024-001"
            />
          </div>
          <div>
            <CurrencySelector currency={currency} onCurrencyChange={onCurrencyChange} />
          </div>
          <div>
            <Label htmlFor="quoteDate">Fecha</Label>
            <Input
              id="quoteDate"
              type="date"
              value={quoteDate}
              onChange={(e) => onQuoteDateChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="validUntil">Vencimiento</Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => onValidUntilChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(value) => onStatusChange(value as QuoteStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {QUOTE_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <h3 className="font-semibold text-lg mb-2">Detalles del Presupuesto:</h3>
      <div className="text-sm text-muted-foreground space-y-1">
        <p><span className="font-medium">Nº:</span> {quoteNumber}</p>
        <p><span className="font-medium">Fecha:</span> {new Date(quoteDate).toLocaleDateString('es-ES')}</p>
        <p><span className="font-medium">Vencimiento:</span> {new Date(validUntil).toLocaleDateString('es-ES')}</p>
        <p><span className="font-medium">Moneda:</span> {currency}</p>
        <p className="flex justify-end print:hidden">
          <QuoteStatusBadge status={status} />
        </p>
      </div>
    </div>
  );
}
