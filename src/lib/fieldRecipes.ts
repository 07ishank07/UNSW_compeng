import { tokens } from "./design-tokens";

/**
 * fieldRecipes — the 4 canonical SectionField colour recipes and the ONE place the
 * whole site's field colour is tuned. Each is a RICH two-brand-colour field: a deep
 * brand `back` → a brighter SAME-HUE `front` (a within-hue, low-contrast tonal pair,
 * so the 1-bit dither reads as a rich textured colour, never a stark checkerboard
 * that agitates). NO near-black — this is what kills the "too much graphite" look.
 *
 * Every colour here is ≤ accent-gold luminance, so the scrim contrast gate (which
 * composites the scrim over PURE gold as its worst case) keeps text AA at ANY field
 * opacity. NEVER add a colour brighter than accent-gold (no ink/white).
 */
export const FIELD = {
  gold: { back: tokens.copper, front: tokens.accentGold }, // warm gold shimmer
  purple: { back: tokens.purple, front: tokens.purpleSoft }, // royal purple
  teal: { back: tokens.accentSlate, front: tokens.slateSoft }, // calm teal
  crimson: { back: tokens.fillCrimson, front: tokens.crimsonSoft }, // warm rose
} as const;
