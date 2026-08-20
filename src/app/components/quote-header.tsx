import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface QuoteHeaderProps {
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  onCompanyInfoChange: (field: string, value: string) => void;
  isEditing: boolean;
}

export function QuoteHeader({ companyInfo, onCompanyInfoChange, isEditing }: QuoteHeaderProps) {
  if (isEditing) {
    return (
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold">Información de tu Empresa</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Nombre de la Empresa</Label>
            <Input
              id="companyName"
              value={companyInfo.name}
              onChange={(e) => onCompanyInfoChange('name', e.target.value)}
              placeholder="Tu Empresa S.L."
            />
          </div>
          <div>
            <Label htmlFor="companyPhone">Teléfono</Label>
            <Input
              id="companyPhone"
              value={companyInfo.phone}
              onChange={(e) => onCompanyInfoChange('phone', e.target.value)}
              placeholder="+34 600 000 000"
            />
          </div>
          <div>
            <Label htmlFor="companyEmail">Email</Label>
            <Input
              id="companyEmail"
              type="email"
              value={companyInfo.email}
              onChange={(e) => onCompanyInfoChange('email', e.target.value)}
              placeholder="contacto@tuempresa.com"
            />
          </div>
          <div>
            <Label htmlFor="companyWebsite">Sitio Web</Label>
            <Input
              id="companyWebsite"
              value={companyInfo.website}
              onChange={(e) => onCompanyInfoChange('website', e.target.value)}
              placeholder="www.tuempresa.com"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="companyAddress">Dirección</Label>
            <Textarea
              id="companyAddress"
              value={companyInfo.address}
              onChange={(e) => onCompanyInfoChange('address', e.target.value)}
              placeholder="Calle Principal 123, 28001 Madrid, España"
              rows={2}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">{companyInfo.name}</h1>
          <p className="text-sm text-gray-600 whitespace-pre-line">{companyInfo.address}</p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p>{companyInfo.phone}</p>
          <p>{companyInfo.email}</p>
          <p>{companyInfo.website}</p>
        </div>
      </div>
    </div>
  );
}
