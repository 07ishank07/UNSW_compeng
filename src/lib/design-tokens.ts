// TS MIRROR of the @theme colours in src/app/globals.css (docs/design-language.md
// §0.2.1, docs/clean-code.md §6.1). Canvas/JS code cannot read CSS custom
// properties, so these hex values must match globals.css EXACTLY.
// If you change a colour here, change globals.css in the same commit.
export const tokens = {
  // Structural neutrals
  substrate: "#0A0B0F",
  silk: "#ECECE4",
  ghost: "#8A8D98",
  solder: "#103A33",
  // Logo-sourced brand accents (public/brand/logo.png). Contrast vs substrate:
  // gold 9.9:1 (text-safe) · slate 4.7:1 (text-safe) ·
  // crimson 2.2:1 — decorative only, never text/icons ·
  // purple 1.7:1 — fills/borders/decor only, never text/icons.
  gold: "#D9B36A",
  purple: "#551081",
  crimson: "#931621",
  slate: "#508484",
  // Material exception — the copper Trace pair (the PCB-material colour of the
  // bus/Trace system, not a brand accent). See docs/design-language.md §0.2.1.
  copper: "#C77B45",
  copperBright: "#E8A877",
} as const;
