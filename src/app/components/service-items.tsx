import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Trash2, Plus } from "lucide-react";

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  taxRate: number;
  discount: number;
}

interface ServiceItemsProps {
  items: ServiceItem[];
  onItemChange: (id: string, field: keyof ServiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  isEditing: boolean;
  currency: string;
}

function formatMoney(value: number) {
  return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateRowSubtotal(item: ServiceItem) {
  return item.quantity * item.price * (1 - item.discount / 100);
}

function calculateRowTax(item: ServiceItem) {
  return calculateRowSubtotal(item) * (item.taxRate / 100);
}

function calculateRowTotal(item: ServiceItem) {
  return calculateRowSubtotal(item) + calculateRowTax(item);
}

export function ServiceItems({ items, onItemChange, onAddItem, onRemoveItem, isEditing, currency }: ServiceItemsProps) {
  if (isEditing) {
    return (
      <div className="space-y-4 p-6 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="font-bold tracking-tight">Conceptos</h3>
          <Button onClick={onAddItem} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Servicio
          </Button>
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="space-y-3 bg-card p-4 rounded border">
              <div>
                <Label htmlFor={`desc-${item.id}`}>Descripción</Label>
                <Textarea
                  id={`desc-${item.id}`}
                  value={item.description}
                  onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor={`qty-${item.id}`}>Cantidad</Label>
                  <Input
                    id={`qty-${item.id}`}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${item.id}`}>Precio</Label>
                  <Input
                    id={`price-${item.id}`}
                    type="number"
                    value={item.price}
                    onChange={(e) => onItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor={`tax-${item.id}`}>Impuestos (%)</Label>
                  <Input
                    id={`tax-${item.id}`}
                    type="number"
                    value={item.taxRate}
                    onChange={(e) => onItemChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <div>
                  <Label htmlFor={`discount-${item.id}`}>Descuento (%)</Label>
                  <Input
                    id={`discount-${item.id}`}
                    type="number"
                    value={item.discount}
                    onChange={(e) => onItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-muted-foreground">
                  Subtotal: <span className="font-medium text-foreground">{formatMoney(calculateRowSubtotal(item))} {currency}</span>
                  {" · "}IVA: <span className="font-medium text-foreground">{formatMoney(calculateRowTax(item))} {currency}</span>
                  {" · "}Total: <span className="font-medium text-foreground">{formatMoney(calculateRowTotal(item))} {currency}</span>
                </span>
                <Button
                  onClick={() => onRemoveItem(item.id)}
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-4">Servicios:</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b-2 border-border">
            <tr>
              <th className="text-left p-3 text-sm font-semibold">Descripción</th>
              <th className="text-center p-3 text-sm font-semibold w-20">Cantidad</th>
              <th className="text-right p-3 text-sm font-semibold w-28">Precio Unit.</th>
              <th className="text-right p-3 text-sm font-semibold w-20">Impuestos</th>
              <th className="text-right p-3 text-sm font-semibold w-20">Descuento</th>
              <th className="text-right p-3 text-sm font-semibold w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-3 text-sm whitespace-pre-line">{item.description}</td>
                <td className="p-3 text-sm text-center">{item.quantity}</td>
                <td className="p-3 text-sm text-right">{formatMoney(item.price)} {currency}</td>
                <td className="p-3 text-sm text-right">{item.taxRate}%</td>
                <td className="p-3 text-sm text-right">{item.discount}%</td>
                <td className="p-3 text-sm text-right font-medium">{formatMoney(calculateRowSubtotal(item))} {currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
