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
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground self-center">
            Subtotal
          </span>
          <span className="text-sm text-foreground tabular-nums">{formatMoney(subtotal)} {currency}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground self-center">
            IVA
          </span>
          <span className="text-sm text-foreground tabular-nums">{formatMoney(taxAmount)} {currency}</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between items-baseline">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
            Total
          </span>
          <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {formatMoney(total)} <span className="text-sm font-normal text-muted-foreground">{currency}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
