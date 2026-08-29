import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";
import { cn } from "./utils";

interface LineDrawSvgProps {
  path: string;
  draw: boolean;
  viewBox?: string;
  className?: string;
  strokeClassName?: string;
  strokeWidth?: number;
  duration?: number;
  undrawDuration?: number;
  ease?: string;
  delay?: number;
  arrow?: boolean;
  arrowSize?: number;
}

export function LineDrawSvg({
  path,
  draw,
  viewBox = "0 0 600 220",
  className,
  strokeClassName,
  strokeWidth = 2.5,
  duration = 1.1,
  undrawDuration = 0.65,
  ease = "power2.inOut",
  delay = 0,
  arrow = false,
  arrowSize = 16
}: LineDrawSvgProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPolygonElement>(null);
  const lengthRef = useRef(0);

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;

    if (!lengthRef.current) {
      const length = pathEl.getTotalLength();
      lengthRef.current = length;
      gsap.set(pathEl, { strokeDasharray: length, strokeDashoffset: length });

      if (arrow && arrowRef.current) {
        const end = pathEl.getPointAtLength(length);
        const near = pathEl.getPointAtLength(Math.max(0, length - 1));
        const angle = Math.atan2(end.y - near.y, end.x - near.x) * (180 / Math.PI);
        arrowRef.current.setAttribute(
          "transform",
          `translate(${end.x}, ${end.y}) rotate(${angle})`
        );
        gsap.set(arrowRef.current, { opacity: 0, scale: 0.4, transformOrigin: "0px 0px" });
      }
    }

    const tl = gsap.timeline();
    tl.to(pathEl, {
      strokeDashoffset: draw ? 0 : lengthRef.current,
      duration: draw ? duration : undrawDuration,
      ease,
      delay: draw ? delay : 0
    });

    if (arrow && arrowRef.current) {
      if (draw) {
        tl.to(
          arrowRef.current,
          { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" },
          ">-0.15"
        );
      } else {
        tl.to(
          arrowRef.current,
          { opacity: 0, scale: 0.4, duration: 0.2, ease: "power1.in" },
          0
        );
      }
    }
  }, [draw, duration, undrawDuration, ease, delay, arrow]);

  return (
    <svg
      className={cn("pointer-events-none overflow-visible", className)}
      viewBox={viewBox}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={strokeClassName}
      />
      {arrow && (
        <polygon
          ref={arrowRef}
          points={`0,0 ${-arrowSize},${-arrowSize * 0.42} ${-arrowSize * 0.62},0 ${-arrowSize},${arrowSize * 0.42}`}
          fill="currentColor"
        />
      )}
    </svg>
  );
}
