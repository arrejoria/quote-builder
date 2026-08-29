import type { ChangeEvent } from "react";
import { DrawInput } from "./ui/draw-input";
import { X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface QuoteHeaderProps {
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  logoDataUrl?: string;
  onCompanyInfoChange: (field: string, value: string) => void;
  onLogoChange: (dataUrl: string) => void;
  onLogoRemove: () => void;
  isEditing: boolean;
}

export function QuoteHeader({
  companyInfo,
  logoDataUrl,
  onCompanyInfoChange,
  onLogoChange,
  onLogoRemove,
  isEditing,
}: QuoteHeaderProps) {
  const handleLogoInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onLogoChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (isEditing) {
    return (
      <div className="space-y-5 mb-8 pb-8 border-b border-border/40">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Tu empresa
        </p>

        {/* Logo upload */}
        <div className="space-y-1.5">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Logo
          </span>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoInput}
              className="text-sm text-muted-foreground file:mr-3 file:text-xs file:font-medium file:bg-transparent file:border file:border-border file:px-3 file:py-1.5 file:cursor-pointer hover:file:border-foreground file:transition-colors"
            />
            {logoDataUrl && (
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={logoDataUrl}
                  alt="Logo"
                  className="max-h-10 max-w-20 object-contain"
                />
                <button
                  type="button"
                  onClick={onLogoRemove}
                  className="inline-flex items-center gap-1 text-xs text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Quitar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <DrawInput
            label="Nombre de la empresa"
            value={companyInfo.name}
            onChange={(e) => onCompanyInfoChange("name", e.target.value)}
            placeholder="Tu Empresa S.A."
          />
          <DrawInput
            label="Teléfono"
            value={companyInfo.phone}
            onChange={(e) => onCompanyInfoChange("phone", e.target.value)}
            placeholder="+54 9 11 0000 0000"
          />
          <DrawInput
            label="Email"
            type="email"
            value={companyInfo.email}
            onChange={(e) => onCompanyInfoChange("email", e.target.value)}
            placeholder="contacto@tuempresa.com"
          />
          <DrawInput
            label="Sitio web"
            value={companyInfo.website}
            onChange={(e) => onCompanyInfoChange("website", e.target.value)}
            placeholder="www.tuempresa.com"
          />
          <div className="sm:col-span-2">
            <DrawInput
              as="textarea"
              label="Dirección"
              value={companyInfo.address}
              onChange={(e) => onCompanyInfoChange("address", e.target.value)}
              placeholder="Av. Corrientes 1234, CABA, Argentina"
              rows={2}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border/40 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {logoDataUrl && (
            <ImageWithFallback
              src={logoDataUrl}
              alt={companyInfo.name || "Logo"}
              className="max-h-14 mb-3 object-contain"
            />
          )}
          {companyInfo.name && (
            <h1 className="text-xl font-semibold tracking-tight text-foreground mb-1">
              {companyInfo.name}
            </h1>
          )}
          {companyInfo.address && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {companyInfo.address}
            </p>
          )}
        </div>
        <div className="text-right text-sm text-muted-foreground space-y-0.5">
          {companyInfo.phone && <p>{companyInfo.phone}</p>}
          {companyInfo.email && <p>{companyInfo.email}</p>}
          {companyInfo.website && <p>{companyInfo.website}</p>}
        </div>
      </div>
    </div>
  );
}
