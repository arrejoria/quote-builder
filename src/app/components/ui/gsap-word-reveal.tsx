import { gsap } from "gsap";
import { Fragment, useLayoutEffect, useRef } from "react";
import { cn } from "./utils";

interface GsapWordRevealProps {
  text: string;
  className?: string;
  staggerDuration?: number;
  duration?: number;
  ease?: string;
  delay?: number;
}

export function GsapWordReveal({
  text,
  className,
  staggerDuration = 0.09,
  duration = 0.7,
  ease = "power3.out",
  delay = 0
}: GsapWordRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const words = text.split(" ");

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const wordEls = container.querySelectorAll("[data-word]");
    gsap.fromTo(
      wordEls,
      { yPercent: 100 },
      { yPercent: 0, duration, ease, delay, stagger: staggerDuration }
    );
  }, [text, duration, ease, delay, staggerDuration]);

  return (
    <span ref={containerRef} className={cn(className)}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom">
            <span data-word className="inline-block">
              {word}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}
