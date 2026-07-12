"use client";
/**
 * CpuArchitecture — the 21st.dev CPU schematic (docs/21stdev.md) adapted to the
 * house system: eight bus traces draw in and carry travelling data pulses into
 * the central package, relabelled "CESOC". Token colours ONLY (no hex): traces
 * hairline, package base-deep, pulses in the brand accents. Pulses ride SMIL
 * <animateMotion> along the same trace paths (the doc's version relied on
 * external CSS that was never shipped).
 *
 * Mounts its SVG only when scrolled into view (IntersectionObserver, once) so
 * the SMIL clocks start on screen; under reduced motion it renders immediately,
 * fully static (no dash draw, no pulses, plain text). Decorative: aria-hidden,
 * pointer-events-none; data arrives as props (text label only).
 */
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  className?: string;
  text?: string;
};

const TRACES = [
  "M 10 20 h 79.5 q 5 0 5 5 v 30",
  "M 180 10 h -69.7 q -5 0 -5 5 v 30",
  "M 130 20 v 21.8 q 0 5 -5 5 h -10",
  "M 170 80 v -21.8 q 0 -5 -5 -5 h -50",
  "M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20",
  "M 94.8 95 v -36",
  "M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14",
  "M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20",
] as const;

// One pulse per trace — brand accents rotated (token vars, never hex).
const PULSES = [
  { color: "var(--color-accent-gold)", dur: "4.2s", begin: "0s" },
  { color: "var(--color-purple-soft)", dur: "5.1s", begin: "0.6s" },
  { color: "var(--color-crimson-soft)", dur: "3.6s", begin: "1.2s" },
  { color: "var(--color-slate-soft)", dur: "5.6s", begin: "0.3s" },
  { color: "var(--color-copper)", dur: "6.2s", begin: "1.8s" },
  { color: "var(--color-accent-gold)", dur: "3.2s", begin: "0.9s" },
  { color: "var(--color-accent-slate)", dur: "5.9s", begin: "1.5s" },
  { color: "var(--color-crimson-soft)", dur: "4.6s", begin: "0.2s" },
] as const;

export default function CpuArchitecture({ className, text = "CESOC" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // One gate for every tier: mount the SVG on first approach. Under reduced
    // motion the render is fully static (no dash draw, no pulses), so "appears
    // once scrolled to" is the correct behaviour there too.
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px 80px 0px" },
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  const animate = inView && !reduced;

  return (
    <div ref={hostRef} aria-hidden="true" className={`pointer-events-none aspect-[2/1] ${className ?? ""}`}>
      {inView && (
        <svg viewBox="0 0 200 100" className="h-full w-full">
          {/* Bus traces — draw in once on entry (freeze), static under reduced. */}
          <g
            stroke="var(--color-hairline-gold)"
            fill="none"
            strokeWidth="0.4"
            strokeDasharray={animate ? "100 100" : undefined}
            pathLength={animate ? 100 : undefined}
          >
            {TRACES.map((d) => (
              <path key={d} d={d} pathLength={animate ? 100 : undefined} />
            ))}
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                from="100"
                to="0"
                dur="1.2s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.25,0.1,0.5,1"
                keyTimes="0; 1"
              />
            )}
          </g>

          {/* Travelling data pulses — one per trace, into the package. */}
          {animate &&
            TRACES.map((d, i) => (
              <circle key={d} r="4" fill={`url(#cesoc-pulse-${i})`}>
                <animateMotion dur={PULSES[i].dur} begin={PULSES[i].begin} repeatCount="indefinite" path={d} />
              </circle>
            ))}

          {/* Package pins */}
          <g fill="var(--color-surface-2)">
            <rect x="93" y="37" width="2.5" height="4" rx="0.7" />
            <rect x="104" y="37" width="2.5" height="4" rx="0.7" />
            <rect x="93" y="59" width="2.5" height="4" rx="0.7" />
            <rect x="104" y="59" width="2.5" height="4" rx="0.7" />
            <rect x="82" y="46" width="4" height="2.5" rx="0.7" />
            <rect x="82" y="52" width="4" height="2.5" rx="0.7" />
            <rect x="114" y="46" width="4" height="2.5" rx="0.7" />
            <rect x="114" y="52" width="4" height="2.5" rx="0.7" />
          </g>

          {/* The package — the society as the chip everything converges on. */}
          <rect
            x="85"
            y="40"
            width="30"
            height="20"
            rx="2"
            fill="var(--color-base-deep)"
            stroke="var(--color-hairline)"
            strokeWidth="0.5"
          />
          <text
            x="100"
            y="52.6"
            textAnchor="middle"
            fontSize="6"
            fontWeight="600"
            letterSpacing="0.08em"
            className="font-mono"
            fill={animate ? "url(#cesoc-text-grad)" : "var(--color-ink)"}
          >
            {text}
          </text>

          <defs>
            {PULSES.map((p, i) => (
              <radialGradient key={i} id={`cesoc-pulse-${i}`} fx="0.9">
                <stop offset="0%" stopColor={p.color} />
                <stop offset="55%" stopColor={p.color} stopOpacity="0.55" />
                <stop offset="100%" stopColor={p.color} stopOpacity="0" />
              </radialGradient>
            ))}
            {animate && (
              <linearGradient id="cesoc-text-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-ink-muted)">
                  <animate attributeName="offset" values="-2; -1; 0" dur="5s" repeatCount="indefinite" />
                </stop>
                <stop offset="25%" stopColor="var(--color-ink)">
                  <animate attributeName="offset" values="-1; 0; 1" dur="5s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="var(--color-ink-muted)">
                  <animate attributeName="offset" values="0; 1; 2" dur="5s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            )}
          </defs>
        </svg>
      )}
    </div>
  );
}
