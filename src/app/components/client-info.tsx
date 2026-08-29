import { DrawInput } from "./ui/draw-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const TAX_CONDITIONS = [
  "Responsable Inscripto",
  "Monotributista",
  "Consumidor Final",
  "Exento",
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
      <div className="space-y-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Cliente
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <DrawInput
            label="Nombre"
            value={clientInfo.name}
            onChange={(e) => onClientInfoChange("name", e.target.value)}
            placeholder="Juan Pérez"
          />
          <DrawInput
            label="Empresa"
            value={clientInfo.company}
            onChange={(e) => onClientInfoChange("company", e.target.value)}
            placeholder="Cliente S.L."
          />
          <DrawInput
            label="Email"
            type="email"
            value={clientInfo.email}
            onChange={(e) => onClientInfoChange("email", e.target.value)}
            placeholder="cliente@empresa.com"
          />
          <DrawInput
            label="Teléfono"
            value={clientInfo.phone}
            onChange={(e) => onClientInfoChange("phone", e.target.value)}
            placeholder="+54 9 11 0000 0000"
          />
          <DrawInput
            label="CUIT / CUIL"
            value={clientInfo.cuit}
            onChange={(e) => onClientInfoChange("cuit", e.target.value)}
            placeholder="20-12345678-9"
          />
          <div className="space-y-1.5">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Condición IVA
            </span>
            <Select
              value={clientInfo.taxCondition}
              onValueChange={(value) => onClientInfoChange("taxCondition", value)}
            >
              <SelectTrigger className="rounded-none border-0 border-b border-border/50 px-0 bg-transparent focus:ring-0 h-auto pb-2 pt-1">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {TAX_CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <DrawInput
              as="textarea"
              label="Dirección"
              value={clientInfo.address}
              onChange={(e) => onClientInfoChange("address", e.target.value)}
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
        Cliente
      </p>
      <div className="text-sm space-y-0.5">
        <p className="font-medium text-foreground">{clientInfo.name}</p>
        {clientInfo.company && <p className="text-muted-foreground">{clientInfo.company}</p>}
        {clientInfo.email && <p className="text-muted-foreground">{clientInfo.email}</p>}
        {clientInfo.phone && <p className="text-muted-foreground">{clientInfo.phone}</p>}
        {clientInfo.cuit && (
          <p className="text-muted-foreground">CUIT/CUIL: {clientInfo.cuit}</p>
        )}
        {clientInfo.taxCondition && (
          <p className="text-muted-foreground">{clientInfo.taxCondition}</p>
        )}
        {clientInfo.address && (
          <p className="text-muted-foreground mt-1 whitespace-pre-line">{clientInfo.address}</p>
        )}
      </div>
    </div>
  );
}
