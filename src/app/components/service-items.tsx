import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Trash2, Plus } from "lucide-react";

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface ServiceItemsProps {
  items: ServiceItem[];
  onItemChange: (id: string, field: keyof ServiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  isEditing: boolean;
  currency: string;
}

export function ServiceItems({ items, onItemChange, onAddItem, onRemoveItem, isEditing, currency }: ServiceItemsProps) {
  const calculateItemTotal = (item: ServiceItem) => item.quantity * item.price;

  if (isEditing) {
    return (
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Servicios / Conceptos</h3>
          <Button onClick={onAddItem} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Servicio
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-start bg-white p-3 rounded border">
              <div className="col-span-6">
                <Textarea
                  value={item.description}
                  onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
                  placeholder="Descripción del servicio"
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  placeholder="Cant."
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => onItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="Precio unitario"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <Button
                  onClick={() => onRemoveItem(item.id)}
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
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
      <table className="w-full">
        <thead className="bg-gray-100 border-b-2 border-gray-300">
          <tr>
            <th className="text-left p-3 text-sm font-semibold">Descripción</th>
            <th className="text-center p-3 text-sm font-semibold w-24">Cantidad</th>
            <th className="text-right p-3 text-sm font-semibold w-32">Precio Unit.</th>
            <th className="text-right p-3 text-sm font-semibold w-32">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="p-3 text-sm whitespace-pre-line">{item.description}</td>
              <td className="p-3 text-sm text-center">{item.quantity}</td>
              <td className="p-3 text-sm text-right">{item.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</td>
              <td className="p-3 text-sm text-right font-medium">{calculateItemTotal(item).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}