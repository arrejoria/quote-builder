import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./ui/alert-dialog";
import { Plus, FileText, Trash2, Building2 } from "lucide-react";
import { SavedQuote } from "../lib/storage";

interface QuoteListProps {
  quotes: SavedQuote[];
  onOpenQuote: (id: string) => void;
  onNewQuote: () => void;
  onDeleteQuote: (id: string) => void;
  onEditProfile: () => void;
}

function calculateTotal(quote: SavedQuote) {
  const subtotal = quote.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = subtotal * (quote.taxRate / 100);
  return subtotal + taxAmount;
}

export function QuoteList({ quotes, onOpenQuote, onNewQuote, onDeleteQuote, onEditProfile }: QuoteListProps) {
  const sortedQuotes = [...quotes].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Presupuestos Guardados</h1>
          <div className="flex gap-2">
            <Button onClick={onEditProfile} variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Mi Empresa
            </Button>
            <Button onClick={onNewQuote}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </div>
        </div>

        {sortedQuotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <FileText className="w-12 h-12 text-gray-400" />
              <p className="text-gray-600">Todavía no tenés presupuestos guardados</p>
              <Button onClick={onNewQuote}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Presupuesto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedQuotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        {quote.clientInfo.name || "Sin nombre de cliente"}
                        {quote.clientInfo.company && (
                          <span className="text-muted-foreground font-normal"> · {quote.clientInfo.company}</span>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {quote.quoteNumber} · Actualizado el{" "}
                        {new Date(quote.updatedAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                    <p className="font-semibold whitespace-nowrap">
                      {calculateTotal(quote).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}{" "}
                      {quote.currency}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-end gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar este presupuesto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará el presupuesto{" "}
                          {quote.quoteNumber} de forma permanente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteQuote(quote.id)}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button onClick={() => onOpenQuote(quote.id)}>Abrir</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
