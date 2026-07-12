"use client";
/**
 * SplitHeadline — reveals a display-face heading as masked lines: SplitText
 * wraps each line in an overflow-hidden mask and the lines rise in from
 * yPercent 110 → 0 (0.8s, stagger 0.08, power3.out — whole cascade < 1s,
 * docs/design-language.md §0.2.5). GSAP is loaded lazily so it stays out of
 * first-load JS.
 *
 * The heading text is server-rendered (real <h1>/<h2> with its text) for
 * SEO/LCP; [data-split] hides it ONLY under prefers-reduced-motion:
 * no-preference (see globals.css) so motion users get a clean reveal with no
 * flash, while reduced-motion users see it immediately — no split, no motion.
 *
 * a11y: SplitText's aria:"auto" (default) sets aria-label on the heading and
 * aria-hidden on the split line elements before animating. autoSplit re-splits
 * when fonts finish loading so line breaks are measured against the real face.
 */
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { loadGsap } from "./loadGsap";

interface Props {
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  id?: string;
  children: string;
  /** Slower, more theatrical cascade (~1.2–1.6s total) for signature headlines
   *  (docs/design-language.md §0.2.5) — the hero and each major section title. */
  dramatic?: boolean;
  /** Reveal when scrolled into view (once) rather than on mount — for below-fold
   *  headings, so they don't play their cascade while off-screen. Above-fold
   *  titles (hero, page headers) omit this and fire on load (protects LCP). */
  gate?: boolean;
}

export function SplitHeadline({ as: Tag = "h2", className, id, children, dramatic, gate }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.opacity = "1";
      return;
    }

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    let split: { revert: () => void } | undefined;

    loadGsap().then(({ gsap, SplitText }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        gsap.set(el, { opacity: 1 }); // clear the [data-split] pre-hide
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          // Re-runs on font-load/resize resplits; returning the tween lets
          // SplitText revert/replay it cleanly each time.
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: dramatic ? 1.05 : 0.8,
              stagger: dramatic ? 0.16 : 0.08,
              ease: dramatic ? "power4.out" : "power3.out",
              overwrite: true,
              // Gated headings reveal on scroll-in (once); the ScrollTrigger is
              // attached to the onSplit tween so autoSplit reverts it cleanly on
              // each resplit (font-load/resize) instead of leaking triggers.
              scrollTrigger: gate ? { trigger: el, start: "top 85%", once: true } : undefined,
            }),
        });
      }, ref);
    });

    return () => {
      cancelled = true;
      split?.revert();
      ctx?.revert();
    };
  }, [reduced, children, dramatic, gate]);

  return (
    <Tag ref={ref} id={id} className={className} data-split="">
      {children}
    </Tag>
  );
}
