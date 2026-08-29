import { gsap } from "gsap";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface GsapMagneticWrapProps {
  children: ReactNode;
  distance?: number;
  disabled?: boolean;
}

export function GsapMagneticWrap({
  children,
  distance = 0.35,
  disabled = false
}: GsapMagneticWrapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const quickX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    if (disabled || !ref.current) return;
    quickX.current = gsap.quickTo(ref.current, "x", { duration: 0.4, ease: "power3" });
    quickY.current = gsap.quickTo(ref.current, "y", { duration: 0.4, ease: "power3" });
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;

    const handleMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      if (isHovered) {
        quickX.current?.((e.clientX - centerX) * distance);
        quickY.current?.((e.clientY - centerY) * distance);
      } else {
        quickX.current?.(0);
        quickY.current?.(0);
      }
    };

    document.addEventListener("mousemove", handleMove);
    return () => document.removeEventListener("mousemove", handleMove);
  }, [isHovered, disabled, distance]);

  if (disabled) return <>{children}</>;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="inline-block"
    >
      {children}
    </div>
  );
}
