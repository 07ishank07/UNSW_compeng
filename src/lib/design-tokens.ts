// TS MIRROR of the @theme colours in src/app/globals.css (docs/design-language.md
// §0.2.1, docs/clean-code.md §6.1). Shaders/canvas cannot read CSS custom
// properties, so these hex values must match globals.css EXACTLY.
// If you change a colour here, change globals.css in the same commit.
export const tokens = {
  substrate: "#0A0B0F",
  copper: "#C77B45",
  copperBright: "#E8A877",
  gold: "#D9B36A",
  // Brand accents sampled from the society logo (public/brand/logo.png):
  // the lit gold of the gate and the purple field. Used for the energized
  // hero/Trace states — see docs/design-language.md §0.2.4.
  goldBright: "#FFDA03",
  purple: "#551081",
  purpleBright: "#7B3FB0",
  signal: "#86E0D8",
  solder: "#103A33",
  silk: "#ECECE4",
  ghost: "#8A8D98",
} as const;
