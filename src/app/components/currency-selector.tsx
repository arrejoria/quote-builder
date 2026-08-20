import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CurrencySelectorProps {
  currency: string;
  onCurrencyChange: (value: string) => void;
}

export function CurrencySelector({ currency, onCurrencyChange }: CurrencySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="currency" className="text-sm font-medium">Moneda:</Label>
      <Select value={currency} onValueChange={onCurrencyChange}>
        <SelectTrigger id="currency" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ARS">ARS ($)</SelectItem>
          <SelectItem value="USD">USD ($)</SelectItem>
          <SelectItem value="EUR">EUR (€)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
