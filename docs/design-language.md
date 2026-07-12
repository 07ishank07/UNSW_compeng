> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §0.2 — DESIGN LANGUAGE

This section is binding. Every colour and type decision in code derives from here. Do not introduce ad-hoc hex values or fonts in components.

## 0.2.0 Calibration — the AI-tell list (binding)

The target register is **premium deep-tech in full colour** — Linear/Vercel/Stripe craft, but colour-expressive: the site is an art-directed composition of the four brand colours, not a neutral dark canvas. The documented visual tells of AI-generated sites below are **banned**; audit against this list whenever the design changes, and never introduce one:

1. **Purple-to-indigo/blue gradients** anywhere. Gradients (where they exist at all) stay *within* the four brand colours as subtle field washes — purple pairs with gold/crimson/slate, never blue.
2. **Radial glow / aurora / bloom** behind the hero or sections "for atmosphere." Depth is contrast + shadow, never a light source.
3. **Gradient text** on headlines.
4. **Uniform border-radius everywhere** → exactly three radius tokens (`--radius-control` 6px / `--radius-panel` 12px / `--radius-pill`), applied consistently, no other values.
5. **Cards for every content block; cards-in-cards** → editorial layout: whitespace, hairline rules, and colour-field changes do the grouping. (2026-07: sponsors are a logo band, the team is a caption gallery, academics and past events are datasheet rows — the only boxed panels left are upcoming events and the contact chips.)
6. **Centered-hero + three-identical-cards** → the home hero is a deliberate centered *ceremony* (monumental mark) but no card grid follows it anywhere on the page; inner pages vary column rhythm per section (2-up featured / 4-up compact team, 2-col row lists).
7. **Emoji as icons/bullets** → consistent line iconography only (inline SVG, `currentColor`).
8. **A tracked-uppercase eyebrow above every heading** → mono labels ONLY where genuinely structural (route labels in PageHeader, datasheet indexes `01`–`03`, course codes, event types), and the placement varies (team roles sit *below* names, blog categories sit inline with dates) so no single label-heading silhouette repeats page after page.
9. **Meaningless status dots, rainbow tabs/labels** → rank and category are carried by order, position, scale, and copy — not colour-coding every group.
10. **Uniform `p-4/gap-6` spacing rhythm** → an intentional scale with real variation; section gaps ≥64px and field changes carry separation.
11. **Fade-in-only animation on everything** → the motion grammar in §0.2.5, applied sparingly.
12. **Glow as elevation, glassmorphism as decoration, neon accents, scanlines/glitch effects** → matte surfaces, hairlines, grain. `backdrop-blur` is reserved for genuine overlays (the mobile menu). The audience test: a UNSW faculty member, an industry sponsor, and a first-year must all read the site as serious and considered.

The sanctioned texture set for the silicon/PCB theme: (a) the blueprint grid (1px **gold** lines on the purple field, 24px cells, ≤10% — *almost subliminal; if it's the first thing you notice, reduce it*); (b) copper/gold printed-circuit line-art — the Trace, the static `CircuitDivider`, and the `CircuitSchematic` ("CESoC" package) that draws in on the About section; (c) mono machine-voice labels — the datasheet indexes (`01`…), the gold pad chip on route headers, the `TickerBand` marquee, and the one-shot `ScrambleLabel` decode (hero data-line + route labels ONLY); (d) the global grain veil (SVG turbulence, 4% — kills banding on the colour fields and reads as printed-poster tooth). Nothing else.

**Makeover reconciliation (2026-07 — `docs/design-makeover-prompt.md`).** That research brief reads greenfield, but ~75% of it was already built (the fonts, the anti-tell law above, SplitText reveals, empty states, the mobile overlay). HARVESTED from it: CMS-hardening (`line-clamp` on titles/excerpts; `auto-fit` + `minmax(min(N,100%),1fr)` grids on the row/list layouts — **not** the team gallery, whose `col-span` leadership pair needs fixed columns or a lone member balloons to full width); broader `aspect-ratio`; the duotone image treatment (§0.2.1); a sticky hide-on-scroll nav; and resolving the one hairline+shadow tell on `EventCard` (featured poster = elevation, compact card = hairline — never both). DECLINED, and NOT to be "re-added as missing": (1) **CSS radial auras** — tell #2 bans them and `DitherField` already IS the one flowing colour field; (2) a **Canvas2D dot-field → cursor-grid** — breaks the one-WebGL-surface / two-rAF-loop budget (`.claude/rules/motion-canvas.md`) and the cursor-grid was already cut for fps (`docs/checklists.md §2.1`); (3) **pin + scrub** cinematic scroll — pins were removed for halving scroll fps under throttle; (4) **magnetic CTAs**. The brief's *goals* (flowing colour, cinematic direction, not-AI-slop) are met by the existing perf-safe means, not these techniques.

## 0.2.1 Colour tokens — the colour-field system (2026-07: graphite retired)

The site is composed **entirely from the four brand colours** — gold `#D9B368` · purple `#551081` · crimson `#931621` · teal-slate `#508484` — led by a deep-purple base. The raw brand purple is the *elevated surface* colour (panels rise toward the brand); crimson and slate get deep field variants for section grounds; gold is the light in the composition. Copper is the one material exception (the Trace).

Tokens are named by ROLE, defined once in `globals.css` `@theme`, mirrored in `src/lib/design-tokens.ts`. **`npm run check:contrast` (scripts/contrast.mjs) cross-checks the two files and gates every sanctioned text/field pairing** — the ratios below are its measured output, not assumptions. Change all three (both files + this table) in the same commit and re-run it. Hover/pressed tints are derived in place with `color-mix(in oklch, …)` — never a new ad-hoc hex.

**Fields** (grounds). Since the 2026-07 cinematic makeover these are no longer painted as solid per-section bands — they are the **palette of the flowing `DitherField`** (which journeys through them down the document) and the endpoints of the static **`.scrim` pools / token-gradient panels** that carry text over it. `accent-gold` is no longer a full section band (the old gold Contact band was the worst colour-block seam) — gold is accents/CTAs only:

| Token | Hex | Role |
|---|---|---|
| `--color-base` | `#2E0C47` | The page field — dominant deep plum-purple. |
| `--color-base-2` | `#3A1259` | Raised purple band (ticker, row hovers, quiet panels). |
| `--color-base-deep` | `#23093A` | Footer / deepest band. |
| `--color-surface` | `#551081` | Elevated panels — THE brand purple (Follow band, team route header). |
| `--color-surface-2` | `#63219A` | Wells/insets one step above surface. |
| `--color-field-crimson` | `#4A1218` | Deep crimson section field (events identity). |
| `--color-fill-crimson` | `#931621` | Raw crimson fills/bands/marks — fills first; ink on it 7.7 ✓. |
| `--color-field-slate` | `#24403F` | Deep slate section field (About, academics identity). |
| `--color-accent-gold` | `#D9B368` | Doubles as the GOLD FIELD (Contact band) — dark ink only on it. |

**Inks & accents** (measured WCAG, per field):

| Token | Hex | Role | Measured contrast |
|---|---|---|---|
| `--color-ink` | `#F2EFE6` | Body text on every dark field (warm cream; never pure #FFF) | 14.5 base · 13.0 base-2 · 10.3 surface · 8.3 surface-2 · 13.1 field-crimson · 9.7 field-slate · 7.7 fill-crimson — all AA+ |
| `--color-ink-muted` | `#C7BCD4` | Secondary text/meta (lavender-grey) | ≥4.9 on every dark field (9.2 base · 6.5 surface · 4.9 fill-crimson) |
| `--color-ink-inverse` | `#2E0C47` | **The ONLY text/icon/outline colour on gold** | 8.4 on accent-gold (light inks FAIL on gold — banned there) |
| `--color-accent-gold` | `#D9B368` | THE interactive accent: primary CTA fill (ink-inverse text on it), link/label hover, active nav, focus outlines, lit vias | as text: 8.4 base · 7.5 base-2 · 6.0 surface · 4.8 surface-2 · 7.6 field-crimson · 5.6 field-slate ✓ — but **4.46 on fill-crimson → large text/UI only there** |
| `--color-purple-soft` | `#B78BD4` | Purple at text sizes — **base fields only** | 6.1 base · 5.4 base-2 — FAILS on surface (4.3): no purple text on purple panels |
| `--color-crimson-soft` | `#E57B85` | Crimson at text sizes (event types, crimson-section indexes) | 6.0 base · 5.3 base-2 · 5.4 field-crimson |
| `--color-slate-soft` | `#7FB5B5` | Slate at text sizes (slate-section indexes) | 7.3 base · 4.9 field-slate |
| `--color-accent-slate` | `#508484` | Slate as non-text accent: separators, secondary strokes, blockquote rails | 3.95 on base → large/UI only, never body text |
| `--color-hairline` | ink @ 12% (color-mix) | ALL structural borders/rules. Elevation = field step + hairline + shadow, never glow. | non-text |
| `--color-hairline-gold` | gold @ 28% (color-mix) | Emphasis rules: hero plate ring, footer top rule, sponsor header band | non-text |
| `--color-copper` | `#C77B45` | **Material exception** — the Trace/vias only (PCB copper, not identity) | 5.0 on base (decorative) |

**Fills vs text — the law.** `surface`, `fill-crimson`, `field-*`, and `accent-slate` are FILLS: never body text, never meaning-carrying small icons. Purple/crimson/slate reach text sizes only through their `-soft` variants, on the fields listed above. On the gold field everything readable is `ink-inverse` — including `focus-visible` outlines (a gold outline on gold is invisible).

**Colour rhythm — the flowing field** (2026-07 cinematic makeover; supersedes the old per-section solid bands, which read as stacked colour blocks):

- One continuous **`DitherField`** (`components/depth/DitherField.tsx`) is the ground for every route — a WebGL2 pixel-dither field, document-anchored and fps-capped. Its dominant hue is a **vertical journey down the document: deep purple (top) → gold-warm → crimson → slate cool-down (footer)**, with a per-route bias (events→crimson, academics→slate, team/blog→purple, sponsors→gold). Scrolling moves you through it like a title sequence; it grounds toward deep purple so it leans purple/gold and never reads rainbow.
- Sections are **transparent**; text sits on deep-base **`.scrim` pools** (radial-gradient feather — gated AA over the field's brightest patch), cards on **crimson→purple token gradients**. Every crop carries several hues, but restraint holds: one gold interactive accent per viewport, utility modules stay calm, never all four colours at full saturation on one control.

**Retired (2026-07 colour-field revision — do not reintroduce):** `canvas`, `surface-1`, old `surface-2` value, `fill-purple` (→ `surface`), `purple-text`/`purple-text-strong` (→ `purple-soft`), `crimson` (→ `fill-crimson`), `crimson-text` (→ `crimson-soft`), `slate` (→ `accent-slate`), bare `accent` (→ `accent-gold`), and the graphite-era ink values. Earlier retirements (`substrate/silk/ghost/solder`, `--color-gold`, `--color-purple`, `copper-bright`) stay retired.

**Image treatment — duotone (2026-07 makeover).** Editor-uploaded photos are palette-graded so they join the colour world instead of clashing. A STATIC two-tone SVG filter (`components/ui/DuotoneDefs.tsx`; endpoints read from the `design-tokens.ts` mirror, never a literal hex) is applied through `DuotoneImage` in three grades — `duotone-purple` (exec portraits), `duotone-crimson` (energized upcoming event-poster heroes), `duotone-slate` (calm post covers / receded past). Sponsor logos instead go grayscale→full-colour on hover via an opacity cross-fade of two same-URL layers — the `filter` is a fixed state, never animated (a static filter is sanctioned; animating one is not — `.claude/rules/motion-canvas.md`, and `filter` is compositor-expensive on scroll). Visuals are DEFERRED: every image field is null today, so `DuotoneImage` renders the identical-aspect placeholder well until editors upload — zero CLS when they do.

## 0.2.2 Typography — the usage law

Two registers, three faces, all self-hosted via `next/font/local`. The scale lives in `@theme` (`--text-*` tokens carry size, line-height, and letter-spacing) — **no inline font-size magic numbers**.

- **Display — `Clash Display`.** Display/headlines ONLY, large and infrequent, never paragraphs. Tight negative tracking at size (display −0.02em, h1-page −0.015em, h2 −0.01em — baked into the tokens). Controlled weight band: medium/semibold (≈500–600), never maxed to heavy-bold everywhere. **Sentence case for display headlines and buttons — no random Title Case** ("Get tickets", not "Get Tickets"). The dramatic jump from 64–72px display to 17px body is itself the art direction: protect the scale contrast — which is why inner-route h1s now render at `--text-h1-page` (36–56px), not h2 size.
- **Body — `Switzer`.** All human prose. 17px (`--text-body`), line-height 1.5, weight 400 with 500/600 for emphasis, measure capped at 65–75ch (`max-w-[65ch]`).
- **Mono — `JetBrains Mono`.** **The machine voice**, and the only sanctioned label register: structural eyebrows/kickers, section labels, tags, stats, timestamps, the social labels, `// comment` empty states, code. UPPERCASE + letter-spacing 0.08em (`--text-mono-label`; sanctioned range 0.06–0.14em). Wide tracking on short uppercase labels ONLY — never body text. Do not set timestamps in the body face or prose in mono. (JetBrains Mono ships static — no `wght` axis; never apply the variable-weight hover to mono.)

Scale tokens: display `clamp(2.5rem, 5.5vw, 4.5rem)/1.05`; h1-page `clamp(2.25rem, 4vw, 3.5rem)/1.1`; h2 `clamp(1.75rem, 3vw, 2.75rem)/1.15`; h3 `1.25rem/1.3` (card/row titles); body `1.0625rem/1.5`; mono-label `0.8125rem/0.08em`.

## 0.2.3 The signature element — "The Trace" (spend boldness here)

There is exactly **one** thing this site is remembered by: **a copper bus that threads the entire page**, drawn as the reader scrolls, with a **signal pulse** that travels along it synchronised to scroll progress, and **vias** (junction points) that light copper → gold as each section enters the viewport. Scrolling literally powers the board from top to bottom.

**Material rule:** the Trace is *printed copper*, not a laser — solid token-coloured strokes at hairline weight (1.5px trace / 2px pulse), colour-only via lighting, **no `feGaussianBlur`, no drop-shadows, no glow filters.** Copper reads at 5.0:1 on the base field (decorative), the lit gold vias at 8.4:1.

Everything else stays quiet. The utility modules are themed but calm. **Do not give every module its own competing animation** — that is the failure mode that reads as AI-generated. Restraint is the brief.

Implementation: `src/components/motion/TraceWire.tsx` — a document-height SVG whose path is authored in **real px** (viewBox = measured width × document height via `useDocumentHeight`, so nothing is stretched and vias stay circular), routed in the side gutter so it never overlaps content, animated with GSAP DrawSVG bound to ScrollTrigger (`scrub: 1, ease: "none"`).

**SVG container positioning (do not repeat this mistake):** the container `<svg>` must be `position: absolute; top: 0` sized to the full *document* height — never `position: fixed`/viewport-pinned (a fixed container collapses the coordinate space and clips any path taller than one screen). The earlier `TraceSpine.tsx` was exactly that bug and has been removed.

## 0.2.4 The hero — the monumental mark (layered 2D)

The landing hero is a **centered ceremony on the deep-purple base field** (2026-07): the society disc leads, lifted off a circular **survey plate** — a base-2-tinted disc with concentric gold rings ≤9%, a gold hairline edge, and the layered plum panel shadow. Beneath it: the machine-voice data line (decodes once via `ScrambleLabel`), the "CompEngSoc" display headline (masked SplitText lines), the Switzer sub-line, and the gold CTA (`bg-accent-gold text-ink-inverse`). Built in `src/components/depth/HeroGate.tsx` (plate + mark), composed in `src/app/page.tsx`.

> **No per-element glow, bloom, sheen, scanlines, or glitch.** Depth comes from the 2.5D toolkit minus light-sources-on-controls: surface contrast, shadow, and differential parallax — over the atmospheric `DitherField` colour wash (the ONE sanctioned wash, and the ONE sanctioned WebGL surface; the old WebGL *hero* and the glow/glitch set stay removed, reference code in `docs/reference-implementations.md`).

**Layers (back → front):** survey plate → the sharp logo mark (gold hairline ring, tilts toward the pointer, soft plum `box-shadow` — not `filter: drop-shadow`, which recomposites per scroll frame). Each is a `.depth-layer` parallaxing against the global `--mx`/`--my` pointer channel by its own `--depth`, **and** the whole mark settles (scale) while its sub-layers drift apart on scroll via **`ParallaxLayers`** (`data-drift` yPercent / `data-settle` scale, scrub 1, desktop only — cheap 2D; no pin, no 3D). Generalised from the removed hero-only `HeroDrift`; the Osmo layer-parallax concept on the house stack.

**Site-wide backdrop (back → front):** the **`DitherField`** colour field (the flowing WebGL pixel-dither ground, §0.2.1) → `DepthField.tsx` blueprint grid (1px **gold** lines, 24px cells, ~6% opacity) + grain veil (`.grain`, SVG turbulence at 4%). All document-height `absolute` (never viewport-fixed), decorative, recurring to the footer.

**Signature systems + per-viewport effect budget (binding).** Always on, every viewport: the `DitherField` (frozen during scroll), the grid/grain, Lenis, the pointer channel. On top, per zone: hero adds the settle + mark drift + `ScrambleLabel` + on-load dramatic headline; About adds a scroll-gated dramatic h2 + schematic drift + DrawSVG; events posters add reveals + a dramatic featured title; Follow/Contact add reveals. **Ceilings:** no ScrollTrigger `pin` on a scroll-through section, no 3D/`mask` on scrolling elements, ≤ a couple of scrubbed transforms per viewport. Mobile (`matchMedia <1024px`/coarse): no drift/settle, field is a static frame. Reduced motion: native scroll, static field, instant text — fully usable.

**21st.dev component verdicts (perf-gated).** Special-text → reused the *effect* via GSAP `ScrambleText`/`SplitText` (`ScrambleLabel`, `SplitHeadline dramatic`), not the `motion/react` code. Parallax (Osmo) → pattern adopted, rewritten as `ParallaxLayers` on the house Lenis (the packaged one news up a 2nd Lenis + kills all ScrollTriggers). Dithering shader (Simplex/Wave) → adopted & reworked as the `DitherField` (the one WebGL surface). Container-scroll (Aceternity) → the *settle* adopted as `data-settle` (no `framer-motion`); the **pin was dropped** (halved scroll fps). Cursor-grid → built hero-only then **cut for perf** (a full-viewport `mask` cost ~7fps; re-add only if the fps budget allows). CPU-architecture/Limelight-nav → out of scope (CircuitSchematic/Nav already cover them).

**Pointer reactivity:** the mark tilts via `--mx`/`--my`, written rAF-throttled by `usePointerParallax`. Disabled on touch (`pointer: coarse`), under reduced motion, and on weak devices (`hardwareConcurrency < 4` → `data-perf="lite"`); the channel then stays 0 and the composition is simply static.

**Mobile / reduced motion:** the same composition on every device; under `prefers-reduced-motion` all motion (parallax, drift, reveals, scramble) is off and the hero is static.

**"Learn more" CTA:** always present, gold fill (`bg-accent-gold text-ink-inverse`), linking to `https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering` (`target="_blank"`, `rel="noopener noreferrer"`).

## 0.2.5 Motion grammar — timings are law

GSAP is lazy-loaded (`loadGsap`: core + ScrollTrigger + DrawSVG + SplitText + ScrambleText); eases are the built-in `power2.out`/`power3.out` (CSS mirror: `--ease-out` = `cubic-bezier(0.33, 1, 0.68, 1)`; durations mirror `DURATION` in `src/lib/easing.ts`).

| Motion | Values |
|---|---|
| Micro-interactions (hover/press) | 0.2–0.3s (`--dur-fast` 0.25s), power2.out; hover = translateY(−2px) + border/tint shift (`.lift`); press = scale 0.98 |
| Section/element entrances | 0.6–1.0s (`DURATION.base` 0.7s), power2.out/power3.out, from y:30–60 + autoAlpha |
| SplitText headline reveals | masked lines: yPercent 110→0, duration 0.8, stagger 0.08, power3.out — whole cascade < 1s. `aria` handled by SplitText; revert on cleanup |
| Scrubbed scroll effects | `scrub: 1`, `ease: "none"` (TraceWire; `HeroDrift` layer drift — desktop ≥1024px only via `gsap.matchMedia`) |
| One-shot reveal triggers | `start: "top 80%"`, `once: true` |
| Card/list reveals | `ScrollTrigger.batch`, stagger 0.15, `start: "top 90%"` — one trigger set for many elements, never one each (`Reveal stagger`) |
| Circuit line-art draw-in | `DrawSVGReveal`: `[data-draw]` paths 1.2s power2.out stagger 0.1, then `[data-via]` pads fade (opacity only), once at "top 80%"; fully drawn under reduced motion / no-JS |
| Machine-voice decode | `ScrambleLabel`: 0.6s power2.out, once at "top 90%" — hero data-line + PageHeader route labels ONLY |
| Variable-weight hover | CSS `font-variation-settings` transition (`.vf-shift`) — transform-free; display/body faces only |
| Marquee/ticker | pure CSS keyframes translateX on duplicated content, 36s linear, pause on hover; no JS |

**Performance guardrails (binding):** animate ONLY `transform` + `opacity` — never `filter` (static filters are fine; *animating* them is not, and prefer `box-shadow` over `filter: drop-shadow` on scrolling elements). **No `mask-image` on large/scrolling elements** (use a `background: radial-gradient` feather — see `.scrim`); **no ScrollTrigger `pin` on scroll-through sections, no 3D transforms in scroll effects** (both roughly halve scroll fps under CPU throttle). All GSAP inside `gsap.context` with cleanup (`ctx.revert()`); `gsap.matchMedia()` cuts drift/settle below 1024px. Every animation has a static/instant `prefers-reduced-motion` branch. Exactly **two** sanctioned rAF loops (pointer channel + `DitherField`; both cancel on `visibilitychange`, the field also freezes during scroll). **Verify with `node scripts/perf-probe.mjs`** (4× CPU throttle, per-route fps + 360px overflow + reduced-motion). Target: ~60fps scroll on a weak laptop (holds ≥50 at 1–2× throttle; 4× is an extreme stress). If frames drop, cut in this order: cursor-grid (already cut) → parallax drift/settle → schematic stagger → scramble.

## 0.2.6 Cursor — the probe *(deferred — not implemented)*

A custom oscilloscope-probe cursor (ring + centre dot, magnetic snap) remains a possible future flourish. If built: disabled on touch and under reduced motion, `pointer-events: none`, never intercepts clicks, and it must not remove focus visibility.

## 0.2.7 Voice & copy rules

Copy is design material (§6). Active voice; sentence case; plain verbs. Interface states speak in the interface's voice, optionally as machine comments: an empty events list reads `// signal idle — no upcoming events on the bus`; an error reads `// fetch failed — retrying`. Buttons say exactly what happens ("Open in Studio", "Get tickets", "Read the changelog"). Names describe what the user controls, never how the system is built.

---
