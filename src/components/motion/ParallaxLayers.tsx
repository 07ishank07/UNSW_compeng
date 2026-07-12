"use client";
/**
 * ParallaxLayers — reusable scroll parallax + "settle" for any section (the
 * generalised form of the old hero-only HeroDrift; the Osmo "parallax layers"
 * concept from the 21st.dev brief, reimplemented on the house GSAP/Lenis stack —
 * the packaged component news up a second Lenis and kills ALL ScrollTriggers on
 * unmount, which would nuke TraceWire and the field).
 *
 * Descendants opt in via data-attributes, all driven by ONE shared scrubbed
 * timeline (one ScrollTrigger for the whole section — cheap):
 *   - data-drift="<yPercent>"   translate as the wrapper scrolls through view,
 *     so foreground/mid/background planes visibly separate.
 *   - data-settle="<fromScale>" scale fromScale→1 — the "container scroll" settle
 *     from the brief, reimplemented WITHOUT a pin (pinning halved scroll fps
 *     under CPU throttle; a hero scrolls away regardless, so the settle carries
 *     the feel). Scale only — 2D, compositor-cheap; no 3D rotate/perspective.
 *
 * Transform-only → stays on the compositor. Desktop only (gsap.matchMedia
 * ≥1024px); static under reduced motion and on mobile. Animation only — no copy.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { loadGsap } from "./loadGsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** ScrollTrigger start/end — defaults span the whole time the wrapper is in
   *  view (enters bottom → leaves top). Heroes pass "top top"/"bottom top". */
  start?: string;
  end?: string;
};

export function ParallaxLayers({
  children,
  className,
  start = "top bottom",
  end = "bottom top",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px)", () => {
          const root = ref.current;
          if (!root) return;
          const tl = gsap.timeline({
            scrollTrigger: { trigger: root, start, end, scrub: 1 },
          });
          gsap.utils.toArray<HTMLElement>("[data-drift]", root).forEach((el) => {
            tl.to(el, { yPercent: parseFloat(el.dataset.drift ?? "0"), ease: "none" }, 0);
          });
          gsap.utils.toArray<HTMLElement>("[data-settle]", root).forEach((el) => {
            tl.fromTo(
              el,
              { scale: parseFloat(el.dataset.settle ?? "1.05"), transformOrigin: "50% 50%" },
              { scale: 1, ease: "none" },
              0,
            );
          });
        });
      }, ref);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, start, end]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
