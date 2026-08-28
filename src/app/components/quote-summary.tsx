interface QuoteSummaryProps {
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
}

function formatMoney(value: number) {
  return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function QuoteSummary({ subtotal, taxAmount, total, currency }: QuoteSummaryProps) {
  return (
    <div className="flex justify-end mb-8">
      <div className="w-full sm:w-80 space-y-1">
        <div className="flex justify-between py-1.5">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-sm text-foreground">{formatMoney(subtotal)} {currency}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-sm text-muted-foreground">IVA</span>
          <span className="text-sm text-foreground">{formatMoney(taxAmount)} {currency}</span>
        </div>
        <div className="border-t-2 border-border pt-3 flex justify-between items-baseline">
          <span className="font-bold tracking-tight">TOTAL</span>
          <span className="text-2xl font-extrabold tracking-tight text-foreground">{formatMoney(total)} {currency}</span>
        </div>
      </div>
    </div>
  );
}
