import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface QuoteSummaryProps {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  onTaxRateChange: (value: number) => void;
  isEditing: boolean;
  currency: string;
}

export function QuoteSummary({ subtotal, taxRate, taxAmount, total, onTaxRateChange, isEditing, currency }: QuoteSummaryProps) {
  return (
    <div className="flex justify-end mb-8">
      <div className="w-80 space-y-2">
        <div className="flex justify-between py-2 border-b">
          <span className="text-sm">Subtotal:</span>
          <span className="text-sm font-medium">{subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          {isEditing ? (
            <>
              <Label htmlFor="taxRate" className="text-sm">IVA (%):</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="taxRate"
                  type="number"
                  value={taxRate}
                  onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                  className="w-20 text-right"
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="text-sm">%</span>
              </div>
            </>
          ) : (
            <>
              <span className="text-sm">IVA ({taxRate}%):</span>
              <span className="text-sm font-medium">{taxAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
            </>
          )}
        </div>
        <div className="flex justify-between py-3 border-t-2 border-gray-300">
          <span className="font-semibold">TOTAL:</span>
          <span className="font-bold text-lg text-blue-600">{total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
        </div>
      </div>
    </div>
  );
}