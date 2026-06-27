"use client";
/**
 * HeroGate — the landing hero rendered as layered, shaded 2D (replaces the retired
 * WebGL Gate/Scene/Wire). docs/design-language.md §0.2.4.
 *
 * Depth without a 3D engine: stacked layers in a single grid cell — a purple
 * back-glow, a board-grid card, a drop-shadow plate, the sharp logo mark, a
 * pointer-tracked spec sheen, and a scanline veil — each parallaxing against the
 * pointer by a different `--depth` (via the global --mx/--my channel from
 * usePointerParallax). On touch / reduced-motion / weak devices the channel stays
 * 0, so the composition is simply static — blur + shadow + glow still carry the
 * depth without any motion.
 *
 * Energize + glitch (point 3): when scroll crosses the "output goes high"
 * threshold the gate warms copper→gold and fires ONE brief glitch — never a
 * constant effect. Reduced motion → no energize (scrollSignal.hero stays 0).
 *
 * Decorative: aria-hidden + pointer-events-none. The clickable hero content
 * (wordmark + CTA) sits above this at z-10 in page.tsx.
 */
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { scrollSignal } from "@/lib/scrollSignal";
import { fireGlitch } from "@/components/motion/glitch";

const depth = (n: number) => ({ ["--depth"]: n } as CSSProperties);

export function HeroGate() {
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let fired = false;
    return scrollSignal.subscribe(({ hero }) => {
      if (!fired && hero >= 0.12) {
        fired = true;
        el.classList.add("hg-energized");
        fireGlitch(markRef.current, { img: true });
      } else if (fired && hero < 0.06) {
        fired = false;
        el.classList.remove("hg-energized");
      }
    });
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden [&>*]:[grid-area:1/1]"
    >
      <style>{`
        .hg-glow {
          background: radial-gradient(circle at center,
            color-mix(in srgb, var(--color-purple) 72%, transparent) 0%,
            color-mix(in srgb, var(--color-purple) 20%, transparent) 38%,
            transparent 64%);
          filter: blur(30px);
          transition: background var(--dur-slow) var(--ease-energize);
        }
        .hg-energized .hg-glow {
          background: radial-gradient(circle at center,
            color-mix(in srgb, var(--color-gold) 60%, transparent) 0%,
            color-mix(in srgb, var(--color-purple) 28%, transparent) 42%,
            transparent 66%);
        }
        .hg-card {
          background-image:
            linear-gradient(to right,  color-mix(in srgb, var(--color-copper) 22%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--color-copper) 22%, transparent) 1px, transparent 1px);
          background-size: 30px 30px;
          border: 1px solid color-mix(in srgb, var(--color-copper) 18%, transparent);
          border-radius: 16px;
          opacity: 0.5;
          -webkit-mask-image: radial-gradient(closest-side, #000 58%, transparent);
                  mask-image: radial-gradient(closest-side, #000 58%, transparent);
        }
        .hg-plate {
          background: radial-gradient(closest-side, color-mix(in srgb, #000 55%, transparent), transparent 72%);
          filter: blur(7px);
        }
        .hg-mark {
          transform: perspective(900px)
                     rotateY(calc(var(--mx) * 5deg))
                     rotateX(calc(var(--my) * -5deg));
          transition: transform var(--dur-fast) var(--ease-energize);
          filter: drop-shadow(0 14px 26px color-mix(in srgb, #000 60%, transparent));
        }
        .hg-sheen {
          background: radial-gradient(38% 38% at calc(50% + var(--mx) * 16%) calc(42% + var(--my) * 16%),
            color-mix(in srgb, var(--color-gold-bright) 24%, transparent), transparent 70%);
          mix-blend-mode: screen;
          transition: background var(--dur-fast) var(--ease-energize);
        }
        @media (prefers-reduced-motion: no-preference) {
          .hg-glow { animation: hg-breathe 5s ease-in-out infinite; }
        }
        @keyframes hg-breathe { 0%, 100% { opacity: 0.72; } 50% { opacity: 1; } }
      `}</style>

      {/* Purple back-glow — farthest, drifts opposite the mark */}
      <div className="hg-glow depth-layer h-[64vmin] w-[64vmin] rounded-full" style={depth(-8)} />

      {/* Board-grid card behind the mark */}
      <div className="hg-card depth-layer h-[52vmin] w-[52vmin] max-h-[440px] max-w-[440px]" style={depth(-4)} />

      {/* Drop-shadow plate lifts the mark off the board */}
      <div className="hg-plate depth-layer h-[46vmin] w-[46vmin] max-h-[380px] max-w-[380px]" style={depth(6)} />

      {/* The brand mark — sharp, nearest, tilts toward the pointer */}
      <div className="depth-layer" style={depth(16)}>
        <div ref={markRef} className="hg-mark relative h-[50vmin] w-[50vmin] max-h-[400px] max-w-[400px]">
          <Image
            src="/brand/logo.png"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 60vw, 400px"
            className="object-contain"
          />
        </div>
      </div>

      {/* Pointer-tracked specular sheen */}
      <div className="hg-sheen depth-layer h-full w-full" style={depth(24)} />

      {/* Scanline veil — static, on top */}
      <div className="scanlines h-full w-full opacity-50" />
    </div>
  );
}
