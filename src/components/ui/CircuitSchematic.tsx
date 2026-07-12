/**
 * CircuitSchematic — decorative board line-art: eight bus traces converging on
 * a central "CESoC" package (the 21st.dev CPU-architecture concept rebuilt to
 * the design language — docs/design-language.md §0.2.0 texture set (b)).
 *
 * Material rules: solid token-coloured hairline strokes (gold primary runs,
 * slate secondary), matte chip fill, copper edge pads, NO gradients, NO glow,
 * NO SMIL. Motion (stroke draw-in + via fade) is applied by DrawSVGReveal —
 * `data-draw` marks drawable paths, `data-via` the pads that fade in after;
 * without JS or under reduced motion the art simply renders fully drawn.
 *
 * Decorative only: aria-hidden, pointer-events-none, no text content that
 * carries meaning (the chip label is silkscreen, not copy).
 */
export default function CircuitSchematic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 240"
      className={`pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Primary bus runs — gold, drawn in on enter */}
      <g
        fill="none"
        stroke="var(--color-accent-gold)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      >
        <path data-draw d="M 0 44 H 128 L 168 84 V 104 H 198" />
        <path data-draw d="M 0 196 H 112 L 152 156 V 136 H 198" />
        <path data-draw d="M 236 0 V 56 L 224 68 V 92" />
        <path data-draw d="M 480 60 H 352 L 320 92 V 104 H 282" />
        <path data-draw d="M 480 178 H 368 L 336 146 V 136 H 282" />
        <path data-draw d="M 256 240 V 188 L 268 176 V 148" />
      </g>

      {/* Secondary runs — slate, quieter, offset parallels */}
      <g
        fill="none"
        stroke="var(--color-accent-slate)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      >
        <path data-draw d="M 0 58 H 118 L 154 94 H 198" />
        <path data-draw d="M 480 192 H 360 L 332 164 L 300 164 V 148 H 282" />
      </g>

      {/* Vias + edge pads — fade in after the traces complete */}
      <g data-via fill="var(--color-copper)">
        <circle cx="128" cy="44" r="3" />
        <circle cx="112" cy="196" r="3" />
        <circle cx="352" cy="60" r="3" />
        <circle cx="368" cy="178" r="3" />
        <circle cx="236" cy="56" r="3" />
        <circle cx="256" cy="188" r="3" />
      </g>
      <g data-via fill="var(--color-accent-gold)">
        <rect x="0" y="40" width="5" height="8" rx="1" />
        <rect x="0" y="192" width="5" height="8" rx="1" />
        <rect x="475" y="56" width="5" height="8" rx="1" />
        <rect x="475" y="174" width="5" height="8" rx="1" />
      </g>

      {/* The package — matte chip on the field, gold outline, silkscreen label */}
      <g>
        {/* Pin stubs */}
        <g fill="var(--color-accent-slate)">
          <rect x="194" y="100" width="8" height="3" rx="1" />
          <rect x="194" y="132" width="8" height="3" rx="1" />
          <rect x="278" y="100" width="8" height="3" rx="1" />
          <rect x="278" y="132" width="8" height="3" rx="1" />
          <rect x="222" y="88" width="3" height="8" rx="1" />
          <rect x="234" y="88" width="3" height="8" rx="1" />
          <rect x="255" y="144" width="3" height="8" rx="1" />
          <rect x="267" y="144" width="3" height="8" rx="1" />
        </g>
        <rect
          x="202"
          y="96"
          width="76"
          height="44"
          rx="4"
          fill="color-mix(in oklch, var(--color-field-slate) 55%, black)"
          stroke="var(--color-hairline-gold)"
          strokeWidth="1"
        />
        <text
          x="240"
          y="122"
          textAnchor="middle"
          fill="var(--color-ink)"
          fontFamily="var(--font-mono)"
          fontSize="12"
          letterSpacing="0.08em"
        >
          CESoC
        </text>
      </g>
    </svg>
  );
}
