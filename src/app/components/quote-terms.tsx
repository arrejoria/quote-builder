import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

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
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <div>
          <Label htmlFor="terms">Términos y Condiciones</Label>
          <Textarea
            id="terms"
            value={terms}
            onChange={(e) => onTermsChange(e.target.value)}
            rows={6}
            placeholder="Incluye aquí tus términos y condiciones..."
          />
        </div>
        <div>
          <Label htmlFor="notes">Notas Adicionales</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            placeholder="Notas adicionales o información relevante..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      {terms && (
        <div>
          <h3 className="font-semibold mb-2">Términos y Condiciones:</h3>
          <p className="text-gray-700 whitespace-pre-line">{terms}</p>
        </div>
      )}
      {notes && (
        <div>
          <h3 className="font-semibold mb-2">Notas:</h3>
          <p className="text-gray-700 whitespace-pre-line">{notes}</p>
        </div>
      )}
    </div>
  );
}
