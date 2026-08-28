import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { quoteTemplates, QuoteTemplate } from "../lib/templates";

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

    if (selectedId === "blank") {
      onSelect(null);
    } else {
      const template = quoteTemplates.find((t) => t.id === selectedId) ?? null;
      onSelect(template);
    }

    setSelectedId(null);
    onOpenChange(false);
  };

  const selectedTemplate =
    selectedId && selectedId !== "blank"
      ? quoteTemplates.find((t) => t.id === selectedId)
      : null;

  const selectedLabel = selectedId === "blank" ? "En blanco" : selectedTemplate?.name;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>¿Con qué plantilla empezamos?</DialogTitle>
          <DialogDescription>
            Precarga ítems, así arrancás editando en vez de escribiendo desde cero.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quoteTemplates.map((template) => {
            const isSelected = selectedId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedId(template.id)}
                className={cn(
                  "text-left rounded-lg border p-4 transition-colors",
                  "hover:border-primary/60 hover:bg-accent/50",
                  isSelected && "border-primary bg-accent ring-1 ring-primary"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm">{template.name}</span>
                  <Badge variant="secondary" className="shrink-0">
                    {template.defaultItems.length} ítems sugeridos
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedId("blank")}
            className={cn(
              "text-left rounded-lg border border-dashed p-4 transition-colors",
              "hover:border-primary/60 hover:bg-accent/50",
              selectedId === "blank" && "border-primary bg-accent ring-1 ring-primary"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-semibold text-sm">En blanco</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empezá desde cero, sin ítems precargados.
            </p>
          </button>
        </div>

        <DialogFooter className="flex items-center sm:justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {selectedLabel ? `Seleccionaste: ${selectedLabel}` : "Elegí una opción para continuar"}
          </span>
          <Button onClick={handleConfirm} disabled={selectedId === null}>
            Usar esta plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
