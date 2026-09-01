import { Badge } from "./ui/badge";
import { QuoteStatus } from "../lib/storage";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  borrador: "Borrador",
  enviado: "Enviado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  vencido: "Vencido"
};

const QUOTE_STATUS_STYLES: Record<QuoteStatus, string> = {
  borrador: "bg-muted text-foreground border-border",
  enviado: "bg-secondary text-secondary-foreground border-border",
  aceptado: "bg-success text-success-foreground border-success/30",
  rechazado: "bg-destructive/10 text-destructive border-destructive/30",
  vencido: "bg-warning text-warning-foreground border-warning/30"
};

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  className?: string;
}

export function QuoteStatusBadge({ status, className }: QuoteStatusBadgeProps) {
  return (
    <Badge variant="outline" className={`${QUOTE_STATUS_STYLES[status]} ${className ?? ""}`}>
      {QUOTE_STATUS_LABELS[status]}
    </Badge>
  );
}
