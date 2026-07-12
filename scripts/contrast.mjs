/**
 * contrast.mjs — palette integrity gate (docs/design-language.md §0.2.1).
 *
 * 1. Parses the hex colour tokens out of src/app/globals.css @theme and the
 *    mirror in src/lib/design-tokens.ts, and FAILS if the two files disagree
 *    (the classic split-palette trap — docs/clean-code.md §6.1).
 * 2. Computes the WCAG 2.x contrast ratio for every sanctioned text/field
 *    pairing and FAILS if a normal-text pair drops below 4.5:1 or a
 *    large-text/UI-only pair below 3:1.
 *
 * Run via `npm run check:contrast` after ANY colour change. The printed table
 * is the source for the measured ratios in the design-language palette table.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const css = readFileSync(resolve(root, "src/app/globals.css"), "utf8");
const ts = readFileSync(resolve(root, "src/lib/design-tokens.ts"), "utf8");

// --color-<kebab-name>: #hex;  (alpha-derived color-mix tokens have no hex and
// deliberately no TS mirror, so this regex skips them by construction)
const cssTokens = new Map(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map(
    ([, name, hex]) => [name, hex.toUpperCase()],
  ),
);
// key: "#hex",
const tsTokens = new Map(
  [...ts.matchAll(/(\w+):\s*"(#[0-9a-fA-F]{6})"/g)].map(([, name, hex]) => [
    name,
    hex.toUpperCase(),
  ]),
);

const kebabToCamel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(`  ✗ ${msg}`);
};

console.log("── mirror check (globals.css @theme ↔ design-tokens.ts)");
for (const [name, hex] of cssTokens) {
  const mirror = tsTokens.get(kebabToCamel(name));
  if (!mirror) fail(`--color-${name} has no design-tokens.ts mirror`);
  else if (mirror !== hex)
    fail(`--color-${name}: css ${hex} ≠ ts ${mirror}`);
}
for (const name of tsTokens.keys()) {
  const inCss = [...cssTokens.keys()].some((k) => kebabToCamel(k) === name);
  if (!inCss) fail(`design-tokens.ts "${name}" has no globals.css token`);
}
if (!failed) console.log("  ✓ mirrors match");

// WCAG relative luminance / contrast
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const T = Object.fromEntries(cssTokens); // kebab name → hex

/** Sanctioned pairings. Anything not listed here is NOT a sanctioned text/field
 *  combination — components must not invent new ones without adding them. */
const NORMAL = [ // ≥ 4.5:1 — body/normal text
  // Crimson fills carry INK text ONLY, at any size: ink-muted on fill-crimson is
  // 4.34 < 4.5, and a 12–13px mono badge is never "large text" (so ink-only, not
  // a LARGE demotion which would be a lie). ink on fill-crimson = 7.7 ✓ below.
  ...["base", "base-2", "base-deep", "surface", "surface-2", "field-crimson", "field-slate"]
    .flatMap((f) => [["ink", f], ["ink-muted", f]]),
  ["ink", "fill-crimson"],
  ...["base", "base-2", "base-deep", "surface", "surface-2", "field-crimson", "field-slate"]
    .map((f) => ["accent-gold", f]),
  // purple = identity fill: ink 10.3 / ink-muted 5.8 / gold 6.0 clear it;
  // purple-soft on purple (4.31) FAILS — the no-purple-text-on-purple law stands.
  ["ink", "purple"], ["ink-muted", "purple"], ["accent-gold", "purple"],
  ["purple-soft", "base"], ["purple-soft", "base-2"],
  ["crimson-soft", "base"], ["crimson-soft", "base-2"], ["crimson-soft", "field-crimson"],
  ["slate-soft", "base"], ["slate-soft", "field-slate"],
  ["ink-inverse", "accent-gold"],
];
const LARGE = [ // ≥ 3:1 — large text / UI accents only
  ["accent-gold", "fill-crimson"],
  ["accent-slate", "base"],
  ["copper", "base"],
];

console.log("── contrast (WCAG)");
const check = (pairs, min, tag) => {
  for (const [fg, bg] of pairs) {
    if (!T[fg] || !T[bg]) { fail(`unknown token in pair ${fg}/${bg}`); continue; }
    const r = ratio(T[fg], T[bg]);
    const ok = r >= min;
    if (!ok) fail(`${fg} on ${bg}: ${r.toFixed(2)} < ${min} (${tag})`);
    else console.log(`  ✓ ${fg.padEnd(13)} on ${bg.padEnd(14)} ${r.toFixed(2)}:1 ${tag}`);
  }
};
check(NORMAL, 4.5, "normal");
check(LARGE, 3.0, "large/UI");

// ── blended field (the animated DitherField backdrop) ────────────────────────
// Text never sits on the raw field; it sits on a deep-base SCRIM (globals.css
// .scrim / .scrim-soft) that veils it. Worst case = the scrim at its lowest
// sanctioned alpha composited over the BRIGHTEST colour the field can emit
// (gold). We apply the sRGB `over` operator (as the browser stacks `background`
// layers), then reuse the WCAG luminance/ratio above on the resulting pixel.
const scrimAlpha = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*([0-9.]+)`));
  if (!m) { fail(`globals.css --${name} not found`); return null; }
  return parseFloat(m[1]);
};
const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hexOf = (arr) =>
  "#" + arr.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
// fg at `alpha` OVER opaque bg, per-channel in sRGB (gamma) space.
const over = (fg, alpha, bg) =>
  hexOf(rgbOf(fg).map((c, i) => c * alpha + rgbOf(bg)[i] * (1 - alpha)));

const checkBlend = (fg, bgHex, min, tag) => {
  if (!T[fg]) { fail(`unknown token ${fg}`); return; }
  const r = ratio(T[fg], bgHex);
  if (r < min) fail(`${fg} on ${tag}: ${r.toFixed(2)} < ${min}`);
  else console.log(`  ✓ ${fg.padEnd(13)} on ${tag.padEnd(24)} ${r.toFixed(2)}:1`);
};

console.log("── blended field (scrim over brightest field colour)");
const strong = scrimAlpha("scrim-strong");
const soft = scrimAlpha("scrim-soft");
const brightest = T["accent-gold"]; // brightest colour the field palette emits
if (strong != null && soft != null) {
  const effStrong = over(T["base-deep"], strong, brightest);
  const effSoft = over(T["base-deep"], soft, brightest);
  checkBlend("ink", effStrong, 4.5, `scrim-strong(${strong}) / gold`);
  checkBlend("ink-muted", effStrong, 4.5, `scrim-strong(${strong}) / gold`);
  checkBlend("ink", effSoft, 4.5, `scrim-soft(${soft}) / gold`);
  checkBlend("ink-muted", effSoft, 3.0, `scrim-soft(${soft}) / gold large`);
}

if (failed) {
  console.error("\ncontrast gate FAILED");
  process.exit(1);
}
console.log("\ncontrast gate passed");
