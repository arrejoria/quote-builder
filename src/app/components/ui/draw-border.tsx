import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "./utils";

interface DrawBorderProps {
  children: ReactNode;
  className?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  trigger?: "mount" | "hover";
  color?: string;
}

export function DrawBorder({
  children,
  className,
  strokeWidth = 1.5,
  duration = 0.85,
  delay = 0,
  ease = "power2.inOut",
  trigger = "mount",
}: DrawBorderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      let w: number, h: number;
      if (entry.borderBoxSize?.length) {
        w = entry.borderBoxSize[0].inlineSize;
        h = entry.borderBoxSize[0].blockSize;
      } else {
        w = entry.contentRect.width;
        h = entry.contentRect.height;
      }
      setDims({ w: Math.round(w), h: Math.round(h) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl || !dims.w || !dims.h) return;
    const length = pathEl.getTotalLength();
    gsap.set(pathEl, { strokeDasharray: length, strokeDashoffset: trigger === "hover" ? length : length });

    if (trigger === "mount") {
      gsap.to(pathEl, { strokeDashoffset: 0, duration, delay, ease });
    }
  }, [dims, trigger, duration, delay, ease]);

  const handleMouseEnter = () => {
    if (trigger !== "hover" || !pathRef.current) return;
    gsap.to(pathRef.current, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    if (trigger !== "hover" || !pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    gsap.to(pathRef.current, { strokeDashoffset: length, duration: 0.35, ease: "power2.in" });
  };

  const { w, h } = dims;
  const inset = strokeWidth / 2;
  const d =
    w > 0 && h > 0
      ? `M ${inset},${inset} L ${w - inset},${inset} L ${w - inset},${h - inset} L ${inset},${h - inset} Z`
      : "";

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {d && (
        <svg
          className="absolute left-0 top-0 pointer-events-none overflow-visible"
          width={w}
          height={h}
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="square"
          />
        </svg>
      )}
    </div>
  );
}
