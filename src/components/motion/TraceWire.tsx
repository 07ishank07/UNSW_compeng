"use client";
/**
 * TraceWire — the living copper bus that threads the whole page (the signature
 * element, docs/design-language.md §0.2.3). Rebuilt from the broken TraceSpine.
 *
 * What was broken (visual-revision audit, finding D): the path was authored in a
 * FIXED 0–400 viewBox-unit space decoupled from the dynamic viewBox height, and
 * preserveAspectRatio="none" stretched x:0–100 across the full page width — so the
 * line mis-scaled vertically and wove across the content column. The fix, here:
 *   - Author the path in REAL px: viewBox = measured width × document height, so
 *     1 unit ≈ 1px and nothing is stretched (vias stay circular, not ellipses).
 *   - Route it as a spine inside the side gutter so it never sits over interactive
 *     content, kept at -z-10 behind content, with a copper drop-shadow glow so it
 *     reads as a depth layer rather than a line slapped on top.
 *
 * Positioning rule (do NOT regress — §0.2.3): absolute top-0, height = document
 * height; never fixed/viewport (that collapses the coordinate space).
 *
 * Flow tied to scroll (point 2): DrawSVG scrubs the trace in with page progress,
 * a bright pulse travels the path with scroll, vias light as each enters view.
 * Reduced motion → fully drawn, static, no pulse.
 *
 * GSAP is loaded lazily (loadGsap) inside the effect — it is also dynamically
 * imported as a whole via DecorLayer — so none of it touches first-load JS.
 * One concern: animation only. Publishes { page, hero } into scrollSignal.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useDocumentHeight } from "@/hooks/useDocumentHeight";
import { scrollSignal } from "@/lib/scrollSignal";
import { loadGsap } from "./loadGsap";

interface Via {
  x: number;
  y: number;
}

/** Build a gentle meandering spine down the side gutter, in px coordinates. */
function buildTrace(width: number, height: number, viewportH: number): { d: string; vias: Via[] } {
  const railX = width - 16; // base x: inside the right edge padding (~px-6 gutter)
  const amp = 6; // meander amplitude (px) — subtle, stays within the gutter
  const seg = Math.max(520, Math.min(viewportH || 800, 900)); // ~one bend per viewport
  const top = 16;
  const bottom = Math.max(top + seg, height - 28);

  let d = `M ${railX.toFixed(1)},${top}`;
  const vias: Via[] = [];
  let y = top;
  let dir = -1;
  while (y < bottom - 1) {
    const nextY = Math.min(y + seg, bottom);
    const midY = (y + nextY) / 2;
    const cx = railX + dir * amp;
    d += ` Q ${cx.toFixed(1)},${midY.toFixed(1)} ${railX.toFixed(1)},${nextY.toFixed(1)}`;
    vias.push({ x: cx, y: midY });
    y = nextY;
    dir *= -1;
  }
  return { d, vias };
}

export function TraceWire() {
  const root = useRef<SVGSVGElement>(null);
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const docH = useDocumentHeight();

  // Measure viewport in an effect (not during render) to avoid hydration mismatch.
  const [dims, setDims] = useState({ w: 0, vh: 0 });
  useEffect(() => {
    const measure = () => setDims({ w: window.innerWidth, vh: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const ready = dims.w > 0 && docH > 0;
  const { d, vias } = useMemo(() => buildTrace(dims.w, docH, dims.vh), [dims.w, dims.vh, docH]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const svg = root.current;
      if (!svg) return;

      ctx = gsap.context(() => {
        const trace = svg.querySelector<SVGPathElement>("#tw-trace");
        const pulse = svg.querySelector<SVGPathElement>("#tw-pulse");
        if (!trace || !pulse) return;
        const viaEls = Array.from(svg.querySelectorAll<SVGCircleElement>(".tw-via"));

        if (reduced) {
          gsap.set(trace, { drawSVG: "100%" });
          gsap.set(pulse, { autoAlpha: 0 });
          viaEls.forEach((v) => v.classList.add("via--lit"));
          scrollSignal.set({ page: 0, hero: 0 });
          return;
        }

        const end = () => document.documentElement.scrollHeight - window.innerHeight;

        gsap.set(trace, { drawSVG: "0%" });
        gsap.to(trace, {
          drawSVG: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: 0,
            end,
            scrub: 1,
            onUpdate(self) {
              const heroRaw = window.scrollY / window.innerHeight;
              scrollSignal.set({ page: self.progress, hero: Math.min(1, Math.max(0, heroRaw)) });
            },
          },
        });

        gsap.fromTo(
          pulse,
          { drawSVG: "0% 5%" },
          {
            drawSVG: "95% 100%",
            ease: "none",
            scrollTrigger: { trigger: document.documentElement, start: 0, end, scrub: 1 },
          },
        );

        viaEls.forEach((via) => {
          const vy = parseFloat(via.dataset.y ?? "0");
          ScrollTrigger.create({
            trigger: document.documentElement,
            start: () => vy - window.innerHeight * 0.7,
            end: () => vy - window.innerHeight * 0.2,
            onEnter: () => via.classList.add("via--lit"),
            onLeaveBack: () => via.classList.remove("via--lit"),
          });
        });

        ScrollTrigger.refresh();
      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, docH, d, ready]);

  // Content height changes on navigation — refresh triggers once GSAP is loaded.
  useEffect(() => {
    let cancelled = false;
    loadGsap().then(({ ScrollTrigger }) => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!ready) return null;

  return (
    <svg
      ref={root}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 -z-10 w-full overflow-visible"
      style={{ height: `${docH}px` }}
      viewBox={`0 0 ${dims.w} ${docH}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="tw-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          #tw-trace { filter: drop-shadow(0 0 2px color-mix(in srgb, var(--color-copper) 25%, transparent)); }
          .tw-via { fill: var(--color-copper); transition: fill var(--dur-fast) var(--ease-energize); }
          .via--lit {
            fill: var(--color-gold);
            filter:
              drop-shadow(0 0 1px color-mix(in srgb, var(--color-gold) 60%, transparent))
              drop-shadow(0 0 3px color-mix(in srgb, var(--color-purple) 40%, transparent));
          }
        `}</style>
      </defs>

      {/* Copper trace — drawn in by DrawSVG + ScrollTrigger */}
      <path
        id="tw-trace"
        d={d}
        fill="none"
        stroke="var(--color-copper)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Signal pulse — a short, gold-hot segment that travels the path with scroll */}
      <path
        id="tw-pulse"
        d={d}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#tw-glow)"
      />
      {/* Vias — junction lights at section entry points */}
      {vias.map((v, i) => (
        <circle key={i} className="tw-via" data-y={v.y} cx={v.x} cy={v.y} r="3" />
      ))}
    </svg>
  );
}
