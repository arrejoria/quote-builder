import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { DrawInput } from "./ui/draw-input";
import { CompanyProfile } from "../lib/storage";

const BLANK: CompanyProfile = { name: "", address: "", phone: "", email: "", website: "" };

interface CompanyProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: CompanyProfile | null;
  onSave: (profile: CompanyProfile) => void;
}

export function CompanyProfileDialog({ open, onOpenChange, initialValues, onSave }: CompanyProfileDialogProps) {
  const [values, setValues] = useState<CompanyProfile>(initialValues ?? BLANK);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (open) { setValues(initialValues ?? BLANK); setNameError(false); }
  }, [open, initialValues]);

  const set = (field: keyof CompanyProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (field === "name") setNameError(false);
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
