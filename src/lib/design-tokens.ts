// TS MIRROR of the @theme colours in src/app/globals.css (docs/design-language.md
// §0.2.1, docs/clean-code.md §6.1). JS code cannot read CSS custom properties at
// module scope, so these hex values must match globals.css EXACTLY — change both
// files in the same commit, then run `npm run check:contrast`
// (scripts/contrast.mjs cross-checks the two files and gates WCAG AA).
// Alpha-derived tokens (hairline/hairline-gold) are CSS-only color-mix values
// and deliberately have no mirror — derive them in place if JS ever needs one.
// Current consumer: layout.tsx viewport themeColor.
export const tokens = {
  // Shell fields — the near-black ground (SIGNAL palette). base2 aliases surface
  // (no fifth ladder rung); baseDeep is the footer/deepest + scrim veil colour.
  base: "#120A18",
  base2: "#1B1024",
  baseDeep: "#0B0710",
  // Elevated dark panels — one step up from shell, then insets.
  surface: "#1B1024",
  surface2: "#241531",
  // IDENTITY fill — the brand purple. Fills/aura/gradient endpoints, NEVER text.
  purple: "#551081",
  // Section fields + crimson fill. fillCrimson carries INK text only (ink 7.7 ✓;
  // ink-muted 4.34 ✗); fields are near-black grounds for the scroll rhythm.
  fieldCrimson: "#2A0E14",
  fillCrimson: "#931621",
  fieldSlate: "#16211F",
  // Inks. inkInverse is the ONLY text colour on gold (9.8:1).
  ink: "#F2EFE6",
  inkMuted: "#B9B3C4",
  inkInverse: "#120A18",
  // Accents. Gold is THE interactive accent; slate/teal is structure (large/UI).
  accentGold: "#D9B368",
  accentSlate: "#508484",
  // Text-safe lightened variants — the only purple/crimson/slate at text sizes.
  purpleSoft: "#B78BD4",
  crimsonSoft: "#E57B85",
  slateSoft: "#7FB5B5",
  // Material exception — printed-copper Trace colour (TraceWire/vias only).
  copper: "#C77B45",
} as const;
