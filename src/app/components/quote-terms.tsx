import { DrawInput } from "./ui/draw-input";

interface QuoteTermsProps {
  terms: string;
  notes: string;
  onTermsChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  isEditing: boolean;
}

export function QuoteTerms({ terms, notes, onTermsChange, onNotesChange, isEditing }: QuoteTermsProps) {
  if (isEditing) {
    return (
      <div className="space-y-6 pt-2">
        <DrawInput
          as="textarea"
          label="Términos y condiciones"
          value={terms}
          onChange={(e) => onTermsChange(e.target.value)}
          rows={5}
          placeholder="Incluye aquí tus términos y condiciones..."
        />
        <DrawInput
          as="textarea"
          label="Notas adicionales"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Notas adicionales o información relevante..."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      {terms && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
            Términos y condiciones
          </p>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{terms}</p>
        </div>
      )}
      {notes && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
            Notas
          </p>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{notes}</p>
        </div>
      )}
    </div>
  );
}
