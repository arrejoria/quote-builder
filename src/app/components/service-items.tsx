import { DrawInput } from "./ui/draw-input";
import { DrawButton } from "./ui/draw-button";
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
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function rowSubtotal(item: ServiceItem) {
  return item.quantity * item.price * (1 - item.discount / 100);
}

function rowTax(item: ServiceItem) {
  return rowSubtotal(item) * (item.taxRate / 100);
}

function rowTotal(item: ServiceItem) {
  return rowSubtotal(item) + rowTax(item);
}

export function ServiceItems({ items, onItemChange, onAddItem, onRemoveItem, isEditing, currency }: ServiceItemsProps) {
  if (isEditing) {
    return (
      <div className="space-y-5 mb-8">
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Conceptos
          </p>
          <DrawButton onClick={onAddItem} size="sm" magnetic={false}>
            <Plus className="w-3.5 h-3.5" />
            Añadir
          </DrawButton>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="space-y-4">
              {/* Row number */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
                  #{String(index + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-destructive/60 hover:text-destructive transition-colors cursor-pointer p-0.5"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <DrawInput
                as="textarea"
                label="Descripción"
                value={item.description}
                onChange={(e) => onItemChange(item.id, "description", e.target.value)}
                rows={2}
                placeholder="Descripción del servicio o producto"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
                <DrawInput
                  label="Cantidad"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                />
                <DrawInput
                  label="Precio"
                  type="number"
                  value={item.price}
                  onChange={(e) => onItemChange(item.id, "price", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
                <DrawInput
                  label="IVA %"
                  type="number"
                  value={item.taxRate}
                  onChange={(e) => onItemChange(item.id, "taxRate", parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                />
                <DrawInput
                  label="Descuento %"
                  type="number"
                  value={item.discount}
                  onChange={(e) => onItemChange(item.id, "discount", parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                />
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground tabular-nums pt-1">
                <span>
                  Subtotal <span className="text-foreground font-medium">{formatMoney(rowSubtotal(item))} {currency}</span>
                </span>
                <span>·</span>
                <span>
                  IVA <span className="text-foreground font-medium">{formatMoney(rowTax(item))} {currency}</span>
                </span>
                <span>·</span>
                <span>
                  Total <span className="text-foreground font-semibold">{formatMoney(rowTotal(item))} {currency}</span>
                </span>
              </div>

              {/* Separator between items */}
              {index < items.length - 1 && (
                <div className="h-px bg-border/40" />
              )}
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-sm text-muted-foreground/50 text-center py-8">
              Todavía no hay conceptos — agregá el primero
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4">
        Conceptos
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 font-semibold text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Descripción
              </th>
              <th className="text-center pb-2 font-semibold text-[10px] uppercase tracking-[0.1em] text-muted-foreground w-16">
                Cant.
              </th>
              <th className="text-right pb-2 font-semibold text-[10px] uppercase tracking-[0.1em] text-muted-foreground w-28">
                Precio unit.
              </th>
              <th className="text-right pb-2 font-semibold text-[10px] uppercase tracking-[0.1em] text-muted-foreground w-16">
                IVA
              </th>
              <th className="text-right pb-2 font-semibold text-[10px] uppercase tracking-[0.1em] text-muted-foreground w-16">
                Desc.
              </th>
              <th className="text-right pb-2 font-semibold text-[10px] uppercase tracking-[0.1em] text-muted-foreground w-28">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/40">
                <td className="py-3 pr-4 whitespace-pre-line">{item.description}</td>
                <td className="py-3 text-center text-muted-foreground">{item.quantity}</td>
                <td className="py-3 text-right tabular-nums">{formatMoney(item.price)} {currency}</td>
                <td className="py-3 text-right text-muted-foreground">{item.taxRate}%</td>
                <td className="py-3 text-right text-muted-foreground">{item.discount}%</td>
                <td className="py-3 text-right font-medium tabular-nums">{formatMoney(rowSubtotal(item))} {currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
