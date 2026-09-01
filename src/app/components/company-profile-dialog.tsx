import { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { DrawInput } from "./ui/draw-input";
import { CompanyProfile } from "../lib/storage";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { X } from "lucide-react";

const BLANK: CompanyProfile = { name: "", address: "", phone: "", email: "", website: "", logoDataUrl: undefined };

interface CompanyProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: CompanyProfile | null;
  onSave: (profile: CompanyProfile) => void;
}

export function CompanyProfileDialog({ open, onOpenChange, initialValues, onSave }: CompanyProfileDialogProps) {
  const [values, setValues] = useState<CompanyProfile>(initialValues ?? BLANK);
  const [nameError, setNameError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setValues(initialValues ?? BLANK); setNameError(false); }
  }, [open, initialValues]);

  const set = (field: keyof CompanyProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (field === "name") setNameError(false);
  };

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValues((v) => ({ ...v, logoDataUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) { setNameError(true); return; }
    onSave(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Información de tu Empresa</DialogTitle>
          <DialogDescription>
            Estos datos se usarán por defecto en tus nuevos presupuestos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <DrawInput
            label="Nombre de la empresa *"
            value={values.name}
            onChange={set("name")}
            placeholder="Tu Empresa S.A."
            error={nameError ? "Requerido" : undefined}
          />
          <DrawInput
            label="Teléfono"
            value={values.phone}
            onChange={set("phone")}
            placeholder="+54 9 11 0000 0000"
          />
          <DrawInput
            label="Email"
            type="email"
            value={values.email}
            onChange={set("email")}
            placeholder="contacto@tuempresa.com"
          />
          <DrawInput
            label="Sitio web"
            value={values.website}
            onChange={set("website")}
            placeholder="www.tuempresa.com"
          />
          <DrawInput
            as="textarea"
            label="Dirección"
            value={values.address}
            onChange={set("address")}
            placeholder="Av. Corrientes 1234, CABA, Argentina"
            rows={2}
          />

          {/* Logo */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Logo</p>
            {values.logoDataUrl ? (
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={values.logoDataUrl}
                  alt="Logo"
                  className="max-h-10 max-w-[120px] object-contain border border-border rounded p-1"
                />
                <button
                  type="button"
                  onClick={() => { setValues((v) => ({ ...v, logoDataUrl: undefined })); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" /> Eliminar
                </button>
              </div>
            ) : (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoInput}
                className="text-sm text-muted-foreground file:mr-3 file:text-xs file:font-medium file:bg-transparent file:border file:border-border file:rounded file:px-3 file:py-1.5 file:cursor-pointer hover:file:border-foreground file:transition-colors"
              />
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
