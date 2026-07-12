"use client";
/**
 * Reveal — scroll-triggered section reveal. Fades + rises content on power2.out
 * as it enters the viewport; elements already in view on load animate on mount,
 * so this doubles as the content load-in. Reduced motion → rendered final,
 * instantly.
 *
 * Two modes (timings from docs/design-language.md §0.2.5):
 *  - block:   the whole container rises once  (y:30, 0.7s, start "top 80%")
 *  - stagger: ScrollTrigger.batch over the direct children (stagger 0.15,
 *             start "top 90%") — ONE trigger set for many elements, never a
 *             trigger per element.
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
  /** Batch-stagger direct children instead of revealing the block as one. */
  stagger?: boolean;
  /** ARIA role for the wrapper — lets a stagger container stand in for a
   *  <ul> (role="list" here + role="listitem" children) without nesting a div
   *  inside list markup. */
  role?: string;
}

export function Reveal({ children, className, stagger = false, role }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        if (reduced) {
          gsap.set(el, { autoAlpha: 1 });
          if (stagger) gsap.set(el.children, { autoAlpha: 1, y: 0 });
          return;
        }

        if (stagger) {
          // The container un-hides instantly; its children carry the reveal.
          gsap.set(el, { autoAlpha: 1 });
          gsap.set(el.children, { autoAlpha: 0, y: 30 });
          ScrollTrigger.batch(Array.from(el.children), {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: DURATION.base,
                ease: "power2.out",
                stagger: 0.15,
              }),
          });
          return;
        }

        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: DURATION.base,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
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
    <div ref={ref} data-reveal role={role} className={className}>
      {children}
    </div>
  );
}
