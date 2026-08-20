import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface ClientInfoProps {
  clientInfo: {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
  };
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  onClientInfoChange: (field: string, value: string) => void;
  onQuoteNumberChange: (value: string) => void;
  onQuoteDateChange: (value: string) => void;
  onValidUntilChange: (value: string) => void;
  isEditing: boolean;
}

export function ClientInfo({
  clientInfo,
  quoteNumber,
  quoteDate,
  validUntil,
  onClientInfoChange,
  onQuoteNumberChange,
  onQuoteDateChange,
  onValidUntilChange,
  isEditing
}: ClientInfoProps) {
  if (isEditing) {
    return (
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold">Información del Cliente</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Nombre del Cliente</Label>
            <Input
              id="clientName"
              value={clientInfo.name}
              onChange={(e) => onClientInfoChange('name', e.target.value)}
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <Label htmlFor="clientCompany">Empresa</Label>
            <Input
              id="clientCompany"
              value={clientInfo.company}
              onChange={(e) => onClientInfoChange('company', e.target.value)}
              placeholder="Cliente S.L."
            />
          </div>
          <div>
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={clientInfo.email}
              onChange={(e) => onClientInfoChange('email', e.target.value)}
              placeholder="cliente@empresa.com"
            />
          </div>
          <div>
            <Label htmlFor="clientPhone">Teléfono</Label>
            <Input
              id="clientPhone"
              value={clientInfo.phone}
              onChange={(e) => onClientInfoChange('phone', e.target.value)}
              placeholder="+34 600 000 000"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="clientAddress">Dirección</Label>
            <Textarea
              id="clientAddress"
              value={clientInfo.address}
              onChange={(e) => onClientInfoChange('address', e.target.value)}
              placeholder="Dirección del cliente"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="quoteNumber">Nº Presupuesto</Label>
            <Input
              id="quoteNumber"
              value={quoteNumber}
              onChange={(e) => onQuoteNumberChange(e.target.value)}
              placeholder="PRE-2024-001"
            />
          </div>
          <div>
            <Label htmlFor="quoteDate">Fecha</Label>
            <Input
              id="quoteDate"
              type="date"
              value={quoteDate}
              onChange={(e) => onQuoteDateChange(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="validUntil">Válido hasta</Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => onValidUntilChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      <div>
        <h3 className="font-semibold text-lg mb-2">Cliente:</h3>
        <div className="text-sm text-gray-700">
          <p className="font-medium">{clientInfo.name}</p>
          {clientInfo.company && <p>{clientInfo.company}</p>}
          <p>{clientInfo.email}</p>
          <p>{clientInfo.phone}</p>
          {clientInfo.address && <p className="mt-1 whitespace-pre-line">{clientInfo.address}</p>}
        </div>
      </div>
      <div className="text-right">
        <h3 className="font-semibold text-lg mb-2">Detalles del Presupuesto:</h3>
        <div className="text-sm text-gray-700">
          <p><span className="font-medium">Nº:</span> {quoteNumber}</p>
          <p><span className="font-medium">Fecha:</span> {new Date(quoteDate).toLocaleDateString('es-ES')}</p>
          <p><span className="font-medium">Válido hasta:</span> {new Date(validUntil).toLocaleDateString('es-ES')}</p>
        </div>
      </div>
    </div>
  );
}
