import { DrawInput } from "./ui/draw-input";
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
  isEditing,
}: QuoteDetailsProps) {
  if (isEditing) {
    return (
      <div className="space-y-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Presupuesto
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <DrawInput
            label="Nº Presupuesto"
            value={quoteNumber}
            onChange={(e) => onQuoteNumberChange(e.target.value)}
            placeholder="PRE-2024-001"
          />
          <div className="space-y-1.5">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Moneda
            </span>
            <CurrencySelector currency={currency} onCurrencyChange={onCurrencyChange} />
          </div>
          <DrawInput
            label="Fecha"
            type="date"
            value={quoteDate}
            onChange={(e) => onQuoteDateChange(e.target.value)}
          />
          <DrawInput
            label="Vencimiento"
            type="date"
            value={validUntil}
            onChange={(e) => onValidUntilChange(e.target.value)}
          />
          <div className="space-y-1.5">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Estado
            </span>
            <Select
              value={status}
              onValueChange={(value) => onStatusChange(value as QuoteStatus)}
            >
              <SelectTrigger className="rounded-none border-0 border-b border-border/50 px-0 bg-transparent focus:ring-0 h-auto pb-2 pt-1">
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
        Presupuesto
      </p>
      <div className="text-sm space-y-0.5">
        <p className="text-muted-foreground">
          <span className="text-foreground font-medium">Nº </span>
          {quoteNumber}
        </p>
        <p className="text-muted-foreground">
          {new Date(quoteDate).toLocaleDateString("es-AR")}
        </p>
        <p className="text-muted-foreground">
          Vence: {new Date(validUntil).toLocaleDateString("es-AR")}
        </p>
        <p className="text-muted-foreground">{currency}</p>
        <p className="flex justify-end pt-1 print:hidden">
          <QuoteStatusBadge status={status} />
        </p>
      </div>
    </div>
  );
}
