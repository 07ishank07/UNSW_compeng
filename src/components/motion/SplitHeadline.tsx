"use client";
/**
 * SplitHeadline — reveals a display-face heading by splitting it into characters
 * and animating them in on the `energize` curve, with an optional variable-weight
 * morph (Clash Display / Switzer expose a `wght` axis) and a one-shot glitch on
 * complete. Uses GSAP SplitText, loaded lazily so it stays out of first-load JS.
 *
 * The heading text is server-rendered (real <h1>/<h2> with its text) for SEO/LCP;
 * [data-split] hides it ONLY under prefers-reduced-motion: no-preference (see
 * globals.css) so motion users get a clean reveal with no flash, while reduced-
 * motion users see it immediately at final weight — no split, no glitch.
 *
 * Note (audit finding F): JetBrains Mono ships static (no `wght` axis), so the
 * weight morph is for display/body faces only — callers pass mono headings
 * without `weight`.
 */
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { fireGlitch } from "./glitch";
import { DURATION } from "@/lib/easing";
import { loadGsap } from "./loadGsap";

interface Props {
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  children: string;
  /** Morph font-variation `wght` from→to during the reveal (display/body only). */
  weight?: [number, number];
  glitch?: boolean;
}

export function SplitHeadline({ as: Tag = "h2", className, children, weight, glitch = true }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();
  const [wFrom, wTo] = weight ?? [];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.opacity = "1";
      if (wTo !== undefined) el.style.fontVariationSettings = `'wght' ${wTo}`;
      return;
    }

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    let split: { revert: () => void; chars: Element[] } | undefined;

    loadGsap().then(({ gsap, SplitText }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        gsap.set(el, { opacity: 1 }); // clear the [data-split] pre-hide
        split = new SplitText(el, { type: "chars,words", charsClass: "sh-char" });

        const tl = gsap.timeline({
          onComplete: () => {
            if (glitch) fireGlitch(el);
            split?.revert();
          },
        });

        tl.from(split.chars, {
          yPercent: 40,
          opacity: 0,
          ease: "energize",
          duration: DURATION.base,
          stagger: 0.03,
        });

        if (wFrom !== undefined && wTo !== undefined) {
          const proxy = { w: wFrom };
          el.style.fontVariationSettings = `'wght' ${wFrom}`;
          tl.to(
            proxy,
            {
              w: wTo,
              ease: "energize",
              duration: DURATION.slow,
              onUpdate: () => {
                el.style.fontVariationSettings = `'wght' ${proxy.w.toFixed(0)}`;
              },
            },
            0,
          );
        }
      }, ref);
    });

    return () => {
      cancelled = true;
      split?.revert?.();
      ctx?.revert();
    };
  }, [reduced, children, glitch, wFrom, wTo]);

  return (
    <Tag ref={ref} className={className} data-split="">
      {children}
    </Tag>
  );
}
