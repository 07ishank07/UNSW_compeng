import { tokens } from "@/lib/design-tokens";

/**
 * DuotoneDefs — reusable SVG duotone filter definitions (docs/design-language.md
 * makeover: palette-graded imagery so editor-uploaded photos join the colour
 * world instead of clashing). Mounted ONCE in the root layout; the `.duotone-*`
 * utilities in globals.css reference these by id via `filter: url(#…)`.
 *
 * Responsibility: static SVG filter defs ONLY — no data, no client JS, no
 * animation. A STATIC filter is sanctioned; animating `filter` is not
 * (.claude/rules/motion-canvas.md), so these ids are only ever applied, never
 * transitioned. The two-tone endpoints come from the token MIRROR
 * (src/lib/design-tokens.ts), never a literal hex, so the palette stays
 * single-sourced — the same pattern DitherField uses for the WebGL layer.
 * MUST NOT import: Sanity data, content modules.
 *
 * Technique: feColorMatrix collapses the image to perceptual luminance (Rec.709
 * luma), then feComponentTransfer remaps luminance 0→shadow, 1→highlight per
 * channel — an accurate two-colour duotone.
 */

// hex (#RRGGBB) → normalised [r, g, b] in 0..1 for feFunc tableValues.
function rgb01(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const DUOTONES: { id: string; shadow: string; highlight: string }[] = [
  // Portraits — deep-purple shadows to warm cream: unifies mismatched exec photos.
  { id: "duotone-purple", shadow: tokens.base, highlight: tokens.ink },
  // Upcoming event heroes — crimson→gold, the "energized" warm grade.
  { id: "duotone-crimson", shadow: tokens.fieldCrimson, highlight: tokens.accentGold },
  // Calm covers / receded past — cool desaturated teal.
  { id: "duotone-slate", shadow: tokens.baseDeep, highlight: tokens.slateSoft },
];

// Rec.709 luma — every output channel reads the same luminance of the input.
const LUMA =
  "0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0";

export function DuotoneDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        {DUOTONES.map(({ id, shadow, highlight }) => {
          const s = rgb01(shadow);
          const h = rgb01(highlight);
          return (
            <filter key={id} id={id} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={LUMA} />
              <feComponentTransfer>
                <feFuncR type="table" tableValues={`${s[0]} ${h[0]}`} />
                <feFuncG type="table" tableValues={`${s[1]} ${h[1]}`} />
                <feFuncB type="table" tableValues={`${s[2]} ${h[2]}`} />
              </feComponentTransfer>
            </filter>
          );
        })}
      </defs>
    </svg>
  );
}
