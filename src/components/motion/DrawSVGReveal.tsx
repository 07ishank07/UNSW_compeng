"use client";
/**
 * DrawSVGReveal — one-shot stroke-draw for decorative circuit line-art
 * (CircuitSchematic; reusable for any SVG whose paths carry `data-draw`).
 *
 * On first enter (start "top 80%", once — §0.2.5 one-shot law) every
 * `[data-draw]` path draws in (1.2s power2.out, stagger 0.1), then `[data-via]`
 * pads fade in (opacity only — fills are pre-painted so nothing animates paint).
 *
 * SSR/no-JS renders the art fully drawn; the effect hides-then-draws only when
 * motion is allowed (same precedent as TraceWire). Reduced motion: GSAP never
 * loads, the SVG stays statically drawn.
 *
 * Animation only — markup arrives as children.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { loadGsap } from "./loadGsap";

type Props = { children: ReactNode; className?: string };

export function DrawSVGReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        const paths = gsap.utils.toArray<SVGPathElement>("[data-draw]", ref.current);
        const vias = gsap.utils.toArray<SVGElement>("[data-via]", ref.current);
        if (paths.length === 0) return;

        gsap.set(paths, { drawSVG: "0%" });
        gsap.set(vias, { autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        });
        tl.to(paths, {
          drawSVG: "100%",
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.1,
        }).to(
          vias,
          { autoAlpha: 1, duration: 0.4, ease: "power2.out", stagger: 0.06 },
          "-=0.3",
        );
      }, ref);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
