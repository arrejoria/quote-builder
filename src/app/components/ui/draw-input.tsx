import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "./utils";

type BaseProps = {
  label?: string;
  containerClassName?: string;
  className?: string;
  error?: string;
};

type InputProps = BaseProps & { as?: "input" } & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & { as: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement>;

type DrawInputProps = InputProps | TextareaProps;

export function DrawInput({ label, containerClassName, className, error, as = "input", ...rest }: DrawInputProps) {
  const baseClass = cn(
    "w-full px-3 py-2 text-sm bg-white border border-border rounded-lg placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
    error && "border-destructive focus:ring-destructive/20",
    className
  );

  return (
    <div className={cn("space-y-1", containerClassName)}>
      {label && (
        <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      )}
      {as === "textarea" ? (
        <textarea
          className={cn(baseClass, "resize-none")}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={baseClass}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
