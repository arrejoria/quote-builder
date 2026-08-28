import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const TAX_CONDITIONS = [
  "Responsable Inscripto",
  "Monotributista",
  "Consumidor Final",
  "Exento"
];

interface ClientInfoProps {
  clientInfo: {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    cuit: string;
    taxCondition: string;
  };
  onClientInfoChange: (field: string, value: string) => void;
  isEditing: boolean;
}

export function ClientInfo({ clientInfo, onClientInfoChange, isEditing }: ClientInfoProps) {
  if (isEditing) {
    return (
      <div className="space-y-4 p-6 bg-muted rounded-lg">
        <h3 className="font-bold tracking-tight">Cliente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <Label htmlFor="clientCuit">CUIT/CUIL</Label>
            <Input
              id="clientCuit"
              value={clientInfo.cuit}
              onChange={(e) => onClientInfoChange('cuit', e.target.value)}
              placeholder="20-12345678-9"
            />
          </div>
          <div>
            <Label htmlFor="clientTaxCondition">Condición frente al IVA</Label>
            <Select
              value={clientInfo.taxCondition}
              onValueChange={(value) => onClientInfoChange('taxCondition', value)}
            >
              <SelectTrigger id="clientTaxCondition">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {TAX_CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="clientAddress">Dirección</Label>
            <Textarea
              id="clientAddress"
              value={clientInfo.address}
              onChange={(e) => onClientInfoChange('address', e.target.value)}
              placeholder="Dirección del cliente"
              rows={2}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Cliente:</h3>
      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{clientInfo.name}</p>
        {clientInfo.company && <p>{clientInfo.company}</p>}
        <p>{clientInfo.email}</p>
        <p>{clientInfo.phone}</p>
        {clientInfo.cuit && <p>CUIT/CUIL: {clientInfo.cuit}</p>}
        {clientInfo.taxCondition && <p>{clientInfo.taxCondition}</p>}
        {clientInfo.address && <p className="mt-1 whitespace-pre-line">{clientInfo.address}</p>}
      </div>
    </div>
  );
}
