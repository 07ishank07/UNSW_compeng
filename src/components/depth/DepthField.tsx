"use client";
/**
 * DepthField — the site-wide backdrop, mounted once in the root layout behind
 * all content. Two static layers (docs/design-language.md §0.2.4):
 *
 *  1. Blueprint grid — 1px gold lines on 24px cells at ~6% effective opacity
 *     (warm survey lines over the purple field), masked top/bottom. Almost
 *     subliminal by design: if it's the first thing you notice, reduce the
 *     opacity further, never raise it past 10%.
 *  2. Grain veil — the global SVG-turbulence texture (globals.css `.grain`)
 *     that kills flat banding on the large colour fields.
 *
 * No glows, no blurs, no washes — elevation elsewhere comes from surface steps
 * and hairlines, never light sources. Both layers are intentionally static and
 * cheap; the hero + Trace carry the motion.
 *
 * Full-document height: the container is `absolute top-0` sized to the measured
 * document height — never viewport-fixed — so coverage stays consistent to the
 * footer on any page.
 *
 * Decorative: aria-hidden + pointer-events-none, at -z-10 — above the -z-20
 * SIGNAL ripple canvas (so the grid/grain scroll over the fixed pulse, a free
 * depth cue) and below content.
 */
import { useDocumentHeight } from "@/hooks/useDocumentHeight";

export function DepthField() {
  const docH = useDocumentHeight();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden"
      style={{ height: docH ? `${docH}px` : "100%" }}
    >
      <style>{`
        .df-grid {
          background-image:
            linear-gradient(to right,  var(--color-accent-gold) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-accent-gold) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.045;
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 4%, black 96%, transparent);
                  mask-image: linear-gradient(to bottom, transparent, black 4%, black 96%, transparent);
        }
      `}</style>

      <div className="absolute inset-0 df-grid" />
      <div className="absolute inset-0 grain" />
    </div>
  );
}
