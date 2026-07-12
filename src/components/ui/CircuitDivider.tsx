/**
 * CircuitDivider — thin SVG circuit-trace line-art used as a section divider
 * (docs/design-language.md §0.2.0 sanctioned texture set (b)): a hairline
 * copper run with right-angle jogs, 45° stubs, pads and vias, drawn at low
 * contrast. Printed-circuit material detail — solid strokes, no glow, static.
 *
 * Decorative: aria-hidden, pointer-events-none, server-rendered.
 */

type Props = { className?: string };

export default function CircuitDivider({ className }: Props) {
  return (
    <svg
      viewBox="0 0 1200 32"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={`pointer-events-none h-8 w-full ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" strokeWidth="1" strokeLinecap="round">
        {/* main copper run with two right-angle jogs */}
        <path
          d="M0 16 H340 L352 8 H520 L532 16 H760 L772 24 H980 L992 16 H1200"
          stroke="var(--color-copper)"
          opacity="0.4"
        />
        {/* secondary slate run, offset */}
        <path
          d="M80 24 H300 L312 16 M640 8 H720 M1020 24 H1140"
          stroke="var(--color-accent-slate)"
          opacity="0.35"
        />
        {/* pads + vias along the run */}
        <circle cx="340" cy="16" r="2.5" fill="var(--color-copper)" opacity="0.5" />
        <circle cx="532" cy="16" r="2.5" fill="var(--color-copper)" opacity="0.5" />
        <circle cx="760" cy="16" r="2.5" fill="var(--color-copper)" opacity="0.5" />
        <circle cx="992" cy="16" r="2.5" fill="var(--color-copper)" opacity="0.5" />
        <circle cx="80" cy="24" r="2" fill="var(--color-accent-slate)" opacity="0.45" />
        <circle cx="720" cy="8" r="2" fill="var(--color-accent-slate)" opacity="0.45" />
        {/* one crimson pad — the seasoning fill */}
        <rect x="637" y="13" width="6" height="6" fill="var(--color-fill-crimson)" opacity="0.8" />
      </g>
    </svg>
  );
}
