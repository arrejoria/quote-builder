import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "./utils";

interface DrawButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "outline" | "solid";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
}

const sizeClasses = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

export function DrawButton({
  children,
  className,
  variant = "outline",
  size = "md",
  magnetic: _magnetic,
  ...props
}: DrawButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-medium cursor-pointer select-none",
        "border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        variant === "outline"
          ? "border-border bg-transparent text-foreground hover:bg-foreground/[0.04]"
          : "border-foreground bg-foreground text-background hover:bg-foreground/90 hover:border-foreground/90",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
