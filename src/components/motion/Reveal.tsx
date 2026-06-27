"use client";
/**
 * Reveal — scroll-triggered section reveal. Fades + rises its content on the
 * `energize` curve as it enters the viewport; elements already in view on load
 * animate on mount, so this doubles as the content load-in. Reduced motion →
 * rendered final, instantly.
 *
 * Used sparingly on section/grid containers — NOT every element — per the
 * restraint rule (docs/design-language.md §0.2.3). One concern: animation only.
 *
 * No-flash: [data-reveal] starts at opacity:0 ONLY under prefers-reduced-motion:
 * no-preference (see globals.css), so reduced-motion / no-JS users always see
 * content immediately while motion users get the reveal. GSAP is loaded lazily.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { DURATION } from "@/lib/easing";
import { loadGsap } from "./loadGsap";

interface Props {
  children: ReactNode;
  className?: string;
  /** Stagger direct children instead of revealing the block as one. */
  stagger?: boolean;
}

export function Reveal({ children, className, stagger = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        if (reduced) {
          gsap.set(el, { autoAlpha: 1 });
          if (stagger) gsap.set(el.children, { autoAlpha: 1, y: 0 });
          return;
        }
        gsap.fromTo(
          stagger ? el.children : el,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "energize",
            duration: DURATION.base,
            stagger: stagger ? 0.08 : 0,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      }, ref);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, stagger]);

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}
