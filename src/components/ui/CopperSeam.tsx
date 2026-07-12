/**
 * CopperSeam — the section separator (SIGNAL Rev 3, slimmed in Rev 5): a
 * full-width near-black bar with bright copper wiring running through it —
 * right-angle jogs, lit vias, one crimson pad and one gold pad. This is where
 * the "printed circuit" motif lives now that the colour fields run edge-to-edge:
 * the seams between stations read as the board's bus layer carrying the signal
 * from one section to the next.
 *
 * preserveAspectRatio="none" stretches the traces to any width, so vias/pads are
 * small rects (circles would ovalize). Token colours only; static; decorative
 * (aria-hidden, pointer-events-none, server-rendered).
 */
type Props = { className?: string };

export default function CopperSeam({ className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden border-y border-hairline bg-base-deep ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 1200 28"
        preserveAspectRatio="none"
        className="pointer-events-none block h-7 w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" strokeWidth="1.25" strokeLinecap="square">
          {/* primary copper run — jogs across the whole seam */}
          <path
            d="M0 9 H310 L318 19 H560 L568 9 H820 L828 19 H1200"
            stroke="var(--color-copper)"
            opacity="0.85"
          />
          {/* secondary copper run, broken */}
          <path
            d="M0 19 H120 L128 9 H300 M660 19 H900 L908 9 H1080"
            stroke="var(--color-copper)"
            opacity="0.5"
          />
          {/* slate return trace */}
          <path d="M380 23 H520 M940 23 H1120" stroke="var(--color-accent-slate)" opacity="0.55" />
        </g>
        {/* vias + pads (rects so the non-uniform stretch can't ovalize them) */}
        <g>
          <rect x="308" y="7" width="4" height="4" fill="var(--color-copper)" opacity="0.9" />
          <rect x="566" y="7" width="4" height="4" fill="var(--color-copper)" opacity="0.9" />
          <rect x="826" y="17" width="4" height="4" fill="var(--color-copper)" opacity="0.9" />
          <rect x="118" y="17" width="4" height="4" fill="var(--color-copper)" opacity="0.7" />
          <rect x="518" y="21" width="4" height="4" fill="var(--color-accent-slate)" opacity="0.7" />
          {/* seasoning pads — one crimson, one gold */}
          <rect x="654" y="7" width="5" height="5" fill="var(--color-fill-crimson)" opacity="0.9" />
          <rect x="1076" y="7" width="4.5" height="4.5" fill="var(--color-accent-gold)" opacity="0.85" />
        </g>
      </svg>
    </div>
  );
}
