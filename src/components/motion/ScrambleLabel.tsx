"use client";
/**
 * ScrambleLabel — one-shot machine-voice "decode" on a short mono label
 * (adapted from the 21st.dev SpecialText brief via GSAP ScrambleTextPlugin —
 * zero new deps, no per-tick React re-renders; docs/design-language.md §0.2.5).
 *
 * Scope is deliberately tight: the hero data-line and PageHeader route labels
 * ONLY — anywhere else and the effect tips into hacker-gimmick territory.
 *
 * Behaviour: the real text is server-rendered (no-JS/SEO safe); on first enter
 * (once) the visible text scrambles→resolves over ~0.9s. Reduced motion: static,
 * GSAP never loads. a11y: the wrapper carries the accessible name; the mutating
 * span is aria-hidden so screen readers never hear the scramble frames.
 *
 * May import: loadGsap, hooks. MUST NOT hold copy (text arrives as a prop).
 */
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { loadGsap } from "./loadGsap";

type Props = { text: string; className?: string };

export function ScrambleLabel({ text, className }: Props) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        gsap.to(ref.current, {
          // Deliberate, cinematic decode — slower than a flicker so the label
          // reads as it resolves (docs/design-language.md §0.2.5).
          duration: 0.9,
          ease: "power2.out",
          scrambleText: { text, chars: "01<>/#_·", speed: 0.3 },
          scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        });
      }, ref);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, text]);

  return (
    <span aria-label={text} className={className}>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
