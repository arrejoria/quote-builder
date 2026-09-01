import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { cn } from "./ui/utils";
import { quoteTemplates, QuoteTemplate } from "../lib/templates";
import { Check } from "lucide-react";

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: QuoteTemplate | null) => void;
}

type SelectionId = string | "blank";

export function TemplatePickerDialog({ open, onOpenChange, onSelect }: TemplatePickerDialogProps) {
  const [selectedId, setSelectedId] = useState<SelectionId | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSelectedId(null);
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    if (selectedId === null) return;
    const template = selectedId === "blank" ? null : (quoteTemplates.find((t) => t.id === selectedId) ?? null);
    onSelect(template);
    setSelectedId(null);
    onOpenChange(false);
  };

  const allOptions = [
    ...quoteTemplates.map((t) => ({ id: t.id, name: t.name, description: t.description, count: t.defaultItems.length })),
    { id: "blank", name: "En blanco", description: "Empezá desde cero, sin ítems precargados.", count: null },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>¿Con qué plantilla empezamos?</DialogTitle>
          <DialogDescription>
            Precarga ítems, así arrancás editando en vez de escribiendo desde cero.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2">
          {allOptions.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedId(opt.id)}
                className={cn(
                  "relative text-left px-4 py-3.5 rounded-lg border transition-colors duration-150 focus:outline-none",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-white hover:bg-muted"
                )}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
                <div className="flex items-start justify-between gap-2 mb-1 pr-6">
                  <span className="font-medium text-sm text-foreground">{opt.name}</span>
                  {opt.count !== null && (
                    <span className="text-xs text-muted-foreground shrink-0">{opt.count} ítems</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {selectedId
              ? `Seleccionaste: ${allOptions.find((o) => o.id === selectedId)?.name}`
              : "Elegí una opción para continuar"}
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedId === null}
            className={cn(
              "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              selectedId !== null
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Usar esta plantilla
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
