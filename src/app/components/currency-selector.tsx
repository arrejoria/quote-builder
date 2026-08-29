import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CurrencySelectorProps {
  currency: string;
  onCurrencyChange: (value: string) => void;
}

export function CurrencySelector({ currency, onCurrencyChange }: CurrencySelectorProps) {
  return (
    <Select value={currency} onValueChange={onCurrencyChange}>
      <SelectTrigger className="rounded-none border-0 border-b border-border/50 px-0 bg-transparent focus:ring-0 h-auto pb-2 pt-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ARS">ARS ($)</SelectItem>
        <SelectItem value="USD">USD ($)</SelectItem>
        <SelectItem value="EUR">EUR (€)</SelectItem>
      </SelectContent>
    </Select>
  );
}
