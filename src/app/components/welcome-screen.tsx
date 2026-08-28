import { useState } from "react";
import { motion } from "motion/react";

interface WelcomeScreenProps {
  onEnter: () => void;
}

const EXIT_DURATION = 0.85;
const EXIT_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const REDUCED_MOTION_DURATION = 0.22;

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isMobileLayout =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px)").matches;

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    if (exiting) return;
    setExiting(true);
    const duration = prefersReducedMotion
      ? REDUCED_MOTION_DURATION
      : EXIT_DURATION;
    setTimeout(onEnter, duration * 1000);
  };

  if (prefersReducedMotion) {
    return (
      <motion.div
        className="fixed inset-0 z-[100] flex h-[100dvh] w-screen cursor-pointer flex-col md:flex-row"
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: REDUCED_MOTION_DURATION, ease: "easeOut" }}
        onClick={handleEnter}
      >
        <div className="flex h-[60dvh] w-full flex-col items-start justify-end bg-[#222222] p-6 md:h-full md:w-1/2 md:p-12 lg:p-16">
          <h1 className="text-[clamp(2.25rem,13vw,10rem)] font-extrabold leading-[0.9] tracking-tight text-white md:text-[clamp(4rem,10vw,10rem)]">
            MI
            <br />
            EMPRESA
          </h1>
        </div>
        <div className="flex h-[40dvh] w-full flex-col items-start justify-end bg-[#f2f2f2] p-6 md:h-full md:w-1/2 md:p-12 lg:p-16">
          <p className="max-w-sm text-lg leading-relaxed text-[#222222] md:text-xl">
            Crea, organiza y exporta presupuestos profesionales desde un solo
            lugar.
          </p>
          <button
            type="button"
            className="mt-6 bg-[#222222] px-6 py-3 font-semibold text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleEnter();
            }}
          >
            Entrar
          </button>
        </div>
      </motion.div>
    );
  }

  const growAxis: "scaleX" | "scaleY" = isMobileLayout ? "scaleY" : "scaleX";
  const originClass = isMobileLayout ? "origin-top" : "origin-left";

  return (
    <div
      className="fixed inset-0 z-[100] flex h-[100dvh] w-screen cursor-pointer flex-col overflow-hidden md:flex-row"
      onClick={handleEnter}
    >
      <motion.div
        className={`relative z-20 flex h-[60dvh] w-full ${originClass} flex-col items-start justify-end bg-[#222222] p-6 md:h-full md:w-1/2 md:p-12 lg:p-16`}
        animate={{ [growAxis]: exiting ? 2 : 1 }}
        transition={{ duration: EXIT_DURATION, ease: EXIT_EASE }}
      >
        <motion.h1
          className="text-[clamp(2.25rem,13vw,10rem)] font-extrabold leading-[0.9] tracking-tight text-white md:text-[clamp(4rem,10vw,10rem)]"
          animate={{ opacity: exiting ? [1, 1, 0] : 1 }}
          transition={{ duration: EXIT_DURATION, ease: EXIT_EASE, times: [0, 0.55, 1] }}
        >
          MI
          <br />
          EMPRESA
        </motion.h1>
      </motion.div>
      <div className="relative z-10 flex h-[40dvh] w-full flex-col items-start justify-end bg-[#f2f2f2] p-6 md:h-full md:w-1/2 md:p-12 lg:p-16">
        <motion.div
          className="flex flex-col items-start"
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: EXIT_DURATION * 0.7, ease: EXIT_EASE }}
        >
          <p className="max-w-sm text-lg leading-relaxed text-[#222222] md:text-xl">
            Crea, organiza y exporta presupuestos profesionales desde un solo
            lugar.
          </p>
          <button
            type="button"
            className="mt-6 bg-[#222222] px-6 py-3 font-semibold text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleEnter();
            }}
          >
            Entrar
          </button>
        </motion.div>
      </div>
    </div>
  );
}
