"use client";
/**
 * DepthField — the site-wide layered-2D depth backdrop (replaces the WebGL
 * BoardLayers). Mounted once in the root layout, behind all content.
 *
 * Concept (docs/design-language.md §0.2.4): instead of a 3D engine, depth comes
 * from stacked, shaded 2D layers — a graphite wash, a faint Manhattan board
 * grid, soft copper/purple glow nodes, and a scanline veil — each with its own
 * blur/opacity so the page reads as having volume. These layers are intentionally
 * STATIC and cheap: they exist for coverage and "pop," not motion. The mouse-
 * reactive parallax is concentrated in the hero (HeroGate), where it is bounded
 * to one viewport and reads best; this hook is mounted here only because the
 * field is the one always-present client component.
 *
 * Full-document height (§point 6): the container is `absolute top-0` sized to the
 * measured document height — never viewport-fixed — and the glow band repeats
 * down its whole length, so coverage stays consistent to the footer on any page.
 *
 * Decorative: aria-hidden + pointer-events-none, sits at -z-20 below everything.
 */
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { useDocumentHeight } from "@/hooks/useDocumentHeight";

export function DepthField() {
  usePointerParallax();
  const docH = useDocumentHeight();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-20 overflow-hidden"
      style={{ height: docH ? `${docH}px` : "100%" }}
    >
      <style>{`
        /* Far graphite wash with two faint brand tints — the receding substrate. */
        .df-wash {
          background:
            radial-gradient(60% 38% at 18% 6%,  color-mix(in srgb, var(--color-purple) 14%, transparent), transparent 70%),
            radial-gradient(52% 30% at 86% 26%, color-mix(in srgb, var(--color-copper) 10%, transparent), transparent 70%);
          filter: blur(8px);
        }
        /* Faint Manhattan routing grid, masked top/bottom so it fades, never a hard plaid. */
        .df-grid {
          background-image:
            linear-gradient(to right,  color-mix(in srgb, var(--color-solder) 55%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--color-solder) 55%, transparent) 1px, transparent 1px);
          background-size: 46px 46px;
          opacity: 0.16;
          -webkit-mask-image: linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent);
                  mask-image: linear-gradient(to bottom, transparent, #000 6%, #000 94%, transparent);
        }
        /* Copper/purple glow nodes that RECUR every 1400px → consistent coverage
           down a page of any length (no blank mid-page stretch). */
        .df-glows {
          background-image:
            radial-gradient(40% 16% at 12% 16%, color-mix(in srgb, var(--color-purple) 24%, transparent), transparent 72%),
            radial-gradient(36% 15% at 88% 48%, color-mix(in srgb, var(--color-copper) 18%, transparent), transparent 72%),
            radial-gradient(34% 14% at 20% 82%, color-mix(in srgb, var(--color-purple-bright) 16%, transparent), transparent 72%);
          background-size: 100% 1400px;
          background-repeat: repeat-y;
          filter: blur(30px);
          opacity: 0.5;
        }
      `}</style>

      <div className="absolute inset-0 df-wash" />
      <div className="absolute inset-0 df-grid" />
      <div className="absolute inset-0 df-glows" />
      <div className="absolute inset-0 scanlines opacity-40" />
    </div>
  );
}
