import { useRef, useState } from "react";
import { gsap } from "gsap";
import { GsapWordReveal } from "./ui/gsap-word-reveal";
import { GsapMagneticWrap } from "./ui/gsap-magnetic-button";
import { LineDrawSvg } from "./ui/line-draw-svg";

interface WelcomeScreenProps {
  onEnter: () => void;
}

const EXIT_DURATION = 0.85;
const EXIT_EASE = "power3.inOut";
const REDUCED_MOTION_DURATION = 0.22;

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isMobileLayout =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px)").matches;

const CIRCLE_PATH =
  "M 40,118 C 34,54 176,14 300,12 C 428,10 566,42 560,110 C 564,178 418,208 297,206 C 195,204 100,192 68,158";

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [exiting, setExiting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (exiting) return;
    setExiting(true);

    if (prefersReducedMotion) {
      gsap.to(panelRef.current, {
        opacity: 0,
        duration: REDUCED_MOTION_DURATION,
        ease: "power1.out",
        onComplete: onEnter
      });
      return;
    }

    const fallback = setTimeout(onEnter, (EXIT_DURATION + 0.1) * 1000);

    gsap.to(panelRef.current, {
      opacity: 0,
      scale: 1.04,
      duration: EXIT_DURATION,
      ease: EXIT_EASE,
      onComplete: () => { clearTimeout(fallback); onEnter(); }
    });
    gsap.to(contentRef.current, {
      opacity: 0,
      duration: EXIT_DURATION * 0.6,
      ease: EXIT_EASE
    });
  };

  if (prefersReducedMotion) {
    return (
      <div
        ref={panelRef}
        className="fixed inset-0 z-[100] flex h-[100dvh] w-screen cursor-pointer flex-col items-center justify-center bg-[#222222] px-6 text-center"
        onClick={handleEnter}
      >
        <h1 className="text-[clamp(1.75rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
          ARMA TU PRESUPUESTO
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
          Crea, organiza y exporta presupuestos profesionales desde un solo
          lugar.
        </p>
        <button
          type="button"
          className="mt-8 bg-[#2563EB] px-8 py-3 font-semibold text-white rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            handleEnter();
          }}
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[100] flex h-[100dvh] w-screen cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#222222] px-6 text-center"
      onClick={handleEnter}
    >
      <div
        ref={contentRef}
        className="flex flex-col items-center px-4 py-6 sm:px-8 sm:py-8"
      >
        <div className="relative px-6 py-6 sm:px-20 sm:py-14">
          {!isMobileLayout && (
            <LineDrawSvg
              path={CIRCLE_PATH}
              draw={!exiting}
              duration={1.1}
              undrawDuration={EXIT_DURATION * 0.8}
              delay={0.3}
              arrow
              className="absolute inset-0 h-full w-full text-white"
            />
          )}

          <h1 className="relative z-10 text-[clamp(1.75rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight text-white">
            <GsapWordReveal
              text="ARMA TU PRESUPUESTO"
              staggerDuration={0.09}
              duration={0.7}
              delay={0.1}
            />
          </h1>
        </div>

        <p className="relative z-10 mt-6 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
          Crea, organiza y exporta presupuestos profesionales desde un solo
          lugar.
        </p>

        <div className="relative z-10 mt-8">
          <GsapMagneticWrap disabled={isMobileLayout}>
            <button
              type="button"
              className="bg-[#2563EB] px-8 py-3 font-semibold text-white rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleEnter();
              }}
            >
              Entrar
            </button>
          </GsapMagneticWrap>
        </div>
      </div>
    </div>
  );
}
