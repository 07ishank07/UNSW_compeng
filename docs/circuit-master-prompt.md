# CIRCUIT — Master Redesign & Bundle Rescue (CompEngSoc)

**Execute ONE PHASE PER SESSION.** After each phase: verify, commit, `/clear`, then start the next. Do not attempt multiple phases in one context window — this document is long and context degradation will cause errors.

**Design concept: CIRCUIT.** The society is a board. Copper and gold traces route signal between components. The entire visual identity is the printed circuit — not as gaming decoration, but as the precise, material, engineered thing it actually is. Deep ink-purple substrate, cream silkscreen, gold and copper traces. Restrained, expensive, credible to a sponsor's marketing director.

**Two hard constraints override everything:**
1. The deployed Worker must be under **3 MiB gzipped** (Cloudflare Free plan). Phase 1 exists solely for this and must pass before any design work.
2. The site must NOT read as black or graphite. The background is genuinely, visibly purple.

---

# PHASE 1 — BUNDLE RESCUE (deploy-blocking, do first)

Deployment currently fails with error 10027: Worker exceeds 3 MiB. The 3 MiB limit applies to the **server bundle** (`.open-next/server-functions/default/handler.mjs`), not client chunks — client-only code loaded via `next/dynamic({ ssr: false })` is emitted as static assets and does not count.

## 1.0 Audit and report before changing anything
```bash
npx opennextjs-cloudflare build
```
Then report:
- The gzipped size Wrangler prints and the "5 largest dependencies" list.
- Parse the exact offenders: `cd .open-next/server-functions/default && cat handler.mjs.meta.json | jq '.outputs["handler.mjs"].inputs | to_entries | sort_by(-.value.bytesInOutput) | .[0:25]'`
- Current versions of: `@opennextjs/cloudflare`, `next`, `react`, `sanity`, `next-sanity`, `three`, `@react-three/*`, `motion`, `framer-motion`, `gsap`, `lenis`.
- Every file importing `three`, `@react-three/*`, `motion`, `framer-motion`, or the DitheringShader.
- Whether `sanity.config.ts`, `sanity.cli.ts`, and `src/app/studio/**` still exist.

Report all of this, then present the plan before editing.

## 1.1 Upgrade the adapter (biggest low-effort win)
`@opennextjs/cloudflare` v1.2 cut generated bundles from 14 MiB to 8 MiB (2.3 → 1.6 MiB gzipped) by dropping babel and `@ampproject/toolbox-optimizer`. Upgrade to the latest version (minimum 1.3.0 — earlier versions have a documented SSRF vulnerability). Upgrade `next` and `wrangler` to latest too. Rebuild and report the new size before continuing — this alone may resolve the failure.

## 1.2 Remove Sanity Studio from the Next app
The Studio is now deployed standalone at `https://compengsoc.sanity.studio` (done manually). Remove it from this codebase:
- Delete `src/app/studio/**` entirely.
- Keep `sanity.config.ts` and `sanity.cli.ts` (the standalone deploy uses them) and keep `src/sanity/**` schemas, client, and queries — the site still reads content.
- Remove `@sanity/vision` from dependencies if only the embedded Studio used it.
- Update every link pointing to `/studio` (footer, docs, README) to the new standalone URL.
- Verify `sanity` (the Studio package) is no longer imported anywhere under `src/app/**` or `src/components/**`. `next-sanity`'s client functions are fine; the Studio UI is not.

## 1.3 Delete the abandoned WebGL stack
three.js is ~155 KB gzipped alone and does not tree-shake well; fiber/drei/postprocessing add more. The WebGL direction is dead and the dithering shader is off-brand (see Phase 5.4).
```bash
npm uninstall three @react-three/fiber @react-three/drei @react-three/postprocessing @types/three
```
Delete: `src/components/canvas/**`, `src/shaders/**`, the `DitheringShader` component, and every import of them. Delete any `.glb`/`.gltf` model files and unused texture assets from `public/`.

## 1.4 Remove the second animation engine
GSAP is the animation system. Do not also ship `motion`/`framer-motion`:
- `SpecialText` uses `motion`'s `useInView` — replace with a plain `IntersectionObserver` (Phase 5.3 details this).
- `ContainerScroll` is `motion`-powered — cut it (Phase 5.5).
- `npm uninstall motion framer-motion` once no imports remain.

## 1.5 Config-level reductions
In `next.config.ts`:
- Add `serverExternalPackages` for any server-reachable package that should not be bundled (name them from the 1.0 audit).
- Add `experimental.optimizePackageImports` for barrel-heavy libraries. Barrel imports are expensive — `import { Check, X } from 'lucide-react'` loads 1,583 modules. Convert any barrel imports to deep imports where the package isn't optimized.
- Do not set `ignoreBuildErrors` or `ignoreDuringBuilds`.

Ensure `wrangler.jsonc` has `nodejs_compat` and a compatibility date on or after `2024-09-23`. Add `--minify` to the build step if not already applied.

## 1.6 Verification (must all pass before Phase 2)
1. `npm run check` — zero type errors, zero lint errors.
2. `npx opennextjs-cloudflare build` — report the gzipped size. Must be **under 3 MiB**.
3. `npx wrangler deploy` — must succeed. Report the deployed URL.
4. Load the deployed site: every route renders, Sanity content appears, no console errors.
5. Confirm zero remaining imports of `three`, `@react-three/*`, `motion`, `framer-motion`, or `sanity` (Studio) in `src/`.
6. Report the final gzipped size and how much each step saved.

**If still over 3 MiB after all of the above:** report the top 10 remaining dependencies by size and stop. Do not proceed to Phase 2 — the user needs to decide between further cuts and the $5/month Workers Paid plan (which raises the limit to 10 MiB and also raises CPU time from 10ms to 30s).

---

# PHASE 2 — PALETTE, TYPE, AND SHAPE RESET

Everything visual derives from this phase. No component work until these tokens exist and are documented.

## 2.1 The CIRCUIT palette (contrast-verified against #2A0A3D)

Define in `globals.css` `@theme`, mirror in `src/lib/design-tokens.ts`, document in `docs/design-language.md`. All three files change in the same commit — they must never drift.

| Token | Hex | Contrast on substrate | Role |
|---|---|---|---|
| `--color-substrate` | `#2A0A3D` | — | **The background.** Deep ink-purple. Reads unmistakably purple, never black. This is the single most important token. |
| `--color-substrate-deep` | `#1F0730` | — | Recessed areas: footer, code wells, inset panels. |
| `--color-surface` | `#38124F` | — | Elevated panels and cards, one step up from substrate. |
| `--color-surface-2` | `#45185F` | — | Second elevation: hover states, nested surfaces. |
| `--color-cream` | `#F5F0E6` | **15.3:1** | Primary text and headlines. Warm, silkscreen-like. Never pure white. |
| `--color-cream-muted` | `#C9C0D4` | ~8:1 | Secondary text, captions, metadata. |
| `--color-gold` | `#D9B368` | **8.8:1** | **Primary accent.** CTA fills (with substrate-coloured text on them), active states, primary traces, the travelling signal. Safe as text. |
| `--color-copper` | `#C77B45` | **5.3:1** | **Second metal.** Secondary traces, pads, warm structural accents, hairline highlights. Safe as text at ≥16px. This provides the palette's warmth diversity. |
| `--color-lilac` | `#B78BD4` | **6.3:1** | Light purple accent for text: mono eyebrows, tags, secondary links, muted labels. |
| `--color-brand-purple` | `#551081` | **1.5:1 — FAILS** | **Fill only, never text, never a border that carries meaning.** Large blocks, section bands, logo backdrop, the darker half of duotone images. |
| `--color-hairline` | `color-mix(in oklch, var(--color-copper) 22%, transparent)` | — | All 1px borders. Copper-tinted, not grey. |

**Retired permanently:** crimson `#931621`, teal `#508484`, near-black `#0A0B0F`, graphite. Remove every reference. If any code still uses them, replace with the nearest role above.

**Diversity discipline:** the palette's variety comes from *material tones* (gold vs copper), *elevation steps* (substrate → surface → surface-2), and *lightness* (cream → cream-muted → lilac) — not from adding hues. Do not introduce a sixth hue for "variety." One accent does the work per viewport; gold leads, copper supports.

**Zero hardcoded hex in `src/components/**` after this phase.** Grep-verify. Derive all tints via `color-mix(in oklch, …)`.

## 2.2 Typography
- **Clash Display** — headlines only. Sentence case (never Title Case, never ALL CAPS). Tracking `-0.02em` at ≥48px. Weight 500–600; reserve 700 for one hero moment. Hero `clamp(2.75rem, 6vw, 5.5rem)`; section H2 `clamp(1.9rem, 3.2vw, 3rem)`.
- **Switzer** — all body and UI. 16–17px, line-height 1.6, measure capped at 70ch, weights 400/500.
- **JetBrains Mono** — the machine voice: eyebrows, labels, tags, dates, stats, course codes, nav items. UPPERCASE, `letter-spacing: 0.1em`, 12–13px. **Never full paragraphs** — that is the terminal/hacker cliché. Labels, data, and captions only.
- Type scale as tokens. No inline font-size values anywhere.

## 2.3 Shape system — containers that don't look AI-generated
This is where most sites give themselves away. Rules:

**Radius scale — four values, used with intent, never one value everywhere:**
`--r-xs: 4px` (tags, inputs) · `--r-sm: 8px` (buttons) · `--r-md: 16px` (cards, panels) · `--r-lg: 24px` (feature blocks, media).

**Squircle corners on primary surfaces** (progressive enhancement, zero JS):
```css
.panel {
  border-radius: var(--r-md);
}
@supports (corner-shape: squircle) {
  .panel { corner-shape: squircle; }
}
```
`corner-shape` shipped in Chrome/Edge 139 and is Chromium-only — the `border-radius` fallback covers Safari and Firefox. Never ship a JS squircle polyfill; bundle size matters more than pixel-perfect corners in one browser.

**Notched / bracket corners as the signature container treatment.** At least one container family per page uses a PCB-derived corner instead of a plain radius: a cut corner (`clip-path: polygon()` with a 12px chamfer on two opposite corners), or copper corner brackets (four small L-shaped SVG marks at the container's corners, like fiducial marks on a board). This is the anti-generic move — it reads as designed, is on-theme, and costs nothing.

**Forbidden container patterns** (audit and remove every instance):
- The same border-radius on every element on the page.
- Three identical equal-width cards in a row. Use asymmetric spans instead: 7/5, 5/7, 8/4, or a feature card at 2× span.
- Cards nested inside cards.
- A coloured 3–4px left-border strip on a card. This is the single most reliable AI tell.
- Hairline border AND drop shadow on the same element. Pick one.
- Uniform `p-4`/`gap-6` rhythm across everything.
- Emoji as icons.
- Elevation via glow. Elevation is a surface step plus a hairline.

**Spacing scale:** 4/8/12/16/24/32/48/64/96/128. Section padding `py-24 md:py-32`. Separation is whitespace and trace-lines, not divider rules.

## 2.4 Documentation
Rewrite `docs/design-language.md` around this phase: the palette table with measured ratios and the fill-vs-text law, the type rules, the shape system including the forbidden-container list, and the CIRCUIT concept statement. Update `docs/clean-code.md` with: the four-radius law, the semantic-colour law (a colour never appears outside its role), and the zero-hardcoded-hex law.

## 2.5 Verification
- Every route renders with the new substrate; nothing is black or grey.
- `npm run check` clean; grep confirms zero hardcoded hex in components.
- Report the computed contrast ratio for every text/background pair actually used.
- Screenshot each route at desktop and 375px.

---

# PHASE 3 — THE CIRCUIT IDENTITY SYSTEM

The `CpuArchitecture` SVG from `21stdev.md` is promoted from a one-off decoration to the site's entire visual identity. Read that component's source in `21stdev.md` before starting.

## 3.1 Fix the component (it is broken as shipped)
The eight `.cpu-line-N` circles are the travelling lights, but **the CSS that moves them is missing from the snippet** — without it they sit frozen at `cx=0, cy=0`. Write it:

```css
.cpu-line-1 {
  offset-path: path("M 10 20 h 79.5 q 5 0 5 5 v 24");  /* same d as cpu-mask-1 */
  offset-distance: 0%;
  animation: circuit-flow 7s linear infinite;
}
@keyframes circuit-flow { to { offset-distance: 100%; } }
```
One rule per line, each using **that line's own mask path `d`**, with staggered durations (6s, 7.5s, 9s, 6.5s, 8s, 10s, 7s, 8.5s) and varied `animation-delay` (0 to -4s) so the lights never pulse in lockstep. `offset-path`/`offset-distance` have been Baseline since 2022 and animate on the compositor — no JS, no GSAP MotionPath, near-zero cost.

## 3.2 Recolour to CIRCUIT (mandatory — the stock colours are the video-gamey problem)
The component ships with blue, green, orange, cyan, and rose neon gradients. That is exactly the gaming aesthetic to eliminate. Remap all eight radial gradients to: **gold, copper, gold, cream, lilac, copper, gold, copper**. No colour outside the palette. Also:
- CPU rect fill `#181818` → `--color-surface`.
- Connection-pin gradient greys → copper at low alpha.
- Marker circle `black`/`#232323` → substrate and hairline.
- Text gradient stops → cream and gold.
- Trace strokes (`currentColor` via `text-muted`) → copper at ~40% alpha for resting traces.
- Replace the `"CPU"` text with **`CESoc`**. Widen the CPU rect to `width="34"` and set `fontSize="5.5"`, adjusting `x` so the text is optically centred in the 200×100 viewBox. Verify it does not overflow the rect at any render size.

## 3.3 Build the variant system
Refactor into `src/components/circuit/` with a shared trace vocabulary. Variants required:
- **`CircuitHero`** — the full CPU diagram, large, the home page centrepiece.
- **`CircuitDivider`** — a horizontal trace run with 2–3 vias, used between sections in place of an `<hr>`. Draws in on scroll via `stroke-dashoffset`.
- **`CircuitFrame`** — corner brackets and short trace stubs that frame a container (the notched-container treatment from 2.3).
- **`CircuitField`** — a large, very low-opacity (0.08–0.12) trace network for section backgrounds. Static or extremely slow.
- **`CircuitNode`** — a single via/pad used as a bullet, list marker, or anchor point beside headings.
All share the same stroke weights (1–1.5px), the same copper/gold logic, and the same alpha conventions. Background traces sit at 0.10–0.25 alpha; only the one "live" path is bright.

## 3.4 Mouse reactivity — restrained, not a light show
This is where the design either reads sophisticated or reads gamer. The rule: **traces respond, they do not perform.**
- Use `gsap.quickTo` for pointer values — it reuses a single tween and costs almost nothing per frame: `const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" })`.
- Effect: traces within ~180px of the cursor raise stroke opacity slightly (e.g. 0.18 → 0.42) and the nearest via brightens toward gold. That is all. Drive it through a CSS custom property so the paint stays cheap.
- **Forbidden:** cursor-following glows, particle trails, colour cycling, multiple fast pulses, anything that could be described as "reacting dramatically." One slow travelling signal per trace run (3–6s traversal) is the ceiling.
- Throttle all pointer handling to `requestAnimationFrame`. Disable proximity reactivity entirely on touch/coarse-pointer devices.

## 3.5 Performance gating (all variants)
- **IntersectionObserver**: the draw-in animation fires once on first intersection; travelling lights get `animation-play-state: paused` whenever off-screen.
- `document.visibilitychange` pauses everything when the tab is hidden.
- `prefers-reduced-motion`: traces render fully drawn and static, no travelling lights, no proximity reaction, no draw-in.
- Only ONE `CircuitHero` or heavy variant animates per viewport. Dividers and nodes are cheap and may repeat freely.

## 3.6 Verification
- The travelling lights actually move (this was broken — confirm visually and report).
- Zero non-palette colours remain in the SVG (grep the component for hex values).
- `CESoc` text fits its rect at 320px, 768px, and 1440px viewport widths.
- Off-screen instances are paused (check via DevTools Animations panel or a console log on the IntersectionObserver).
- Reduced-motion: fully static, still legible.
- DevTools Performance at 4× CPU throttle while scrolling: report FPS, must be ≥50.

---

# PHASE 4 — PAGE LAYOUTS

Apply the palette, shape system, and circuit variants across every route. Content comes from Sanity — every layout must look designed with 0, 1, 3, or 20 items and with pathologically long titles.

## 4.0 Layout constitution (global)
One `<Container>`: `max-w-[1200px] mx-auto px-6 md:px-10`. All content inside it; full-bleed sections wrap an inner Container. 12-column grid with asymmetric spans. Media always in `aspect-ratio` boxes with `object-cover`. Touch targets ≥44px. Gold focus ring on every interactive element. `overflow-x: clip` on html/body, and every absolutely-positioned decorative layer inside a `relative overflow-hidden` parent.

## 4.1 Home
1. **Hero** — left-aligned editorial. Mono eyebrow (`// UNSW COMPUTER ENGINEERING · EST 2026`) in lilac. Clash Display H1 "Where silicon meets software." with a GSAP SplitText masked-lines reveal (§4.8). Switzer sub-line. CTA row: gold-filled **"Join us"** → Discord, and a copper-hairline ghost **"Learn more"** → `https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering` (new tab, `rel="noopener noreferrer"` — this exact URL is a preserved requirement). `CircuitHero` occupies the right half on desktop, sits below the copy on mobile.
2. **Stats band** — hairline-bordered row, mono labels, Clash numerals, GSAP count-ups on scroll-in. `CircuitDivider` above and below.
3. **What we do** — three blocks in asymmetric spans (7/5, then 5/7 offset), each with a `CircuitNode` marker, mono eyebrow, Clash H3, two Switzer lines, gold arrow link.
4. **Upcoming events** — the three soonest from Sanity, poster cards (see 4.2). Empty state: `// no upcoming events on the bus` in mono.
5. **Sponsors strip** — logo well band, tier-ordered, greyscale-to-colour on hover.
6. **Follow band** — Instagram and Discord transparent logos at 96–128px, equal optical size, shared centreline, mono labels the same size below each, centred under their logo. Links: `https://www.instagram.com/unswcompengsoc/` and `https://discord.gg/DHFDcaNgSH`, new tab, descriptive `aria-label` on each (image-only links). Cream-tinted at rest, lift 2px plus full colour on hover. Mobile: stacked, ≥44px targets.
7. **Footer** — `--color-substrate-deep`, copper hairline top, mono sitemap, `© CompEngSoc 2026`, link to the standalone Sanity Studio URL, build stamp.

## 4.2 Events
- Header with mono eyebrow and Clash H1.
- **Upcoming** (`startDateTime >= now()`): poster cards. Duotone hero image (substrate shadows → gold highlights via `feComponentTransfer`, §4.7) so any editor upload joins the palette. Gold mono date, `CircuitFrame` corner brackets, Clash title clamped to two lines, mono location. Grid `auto-fit minmax(320px, 1fr)`; the soonest event spans 2 columns.
- **Past**: receding — smaller, image desaturated toward substrate, cream-muted text, no frame, no motion.
- **Detail page**: full-width duotone poster, mono metadata rail (date / time / location / type / capacity), Switzer body in a `--color-surface` panel, gold CTA when `ticketUrl` exists.

## 4.3 Sponsors
Tier bands top-down (platinum → gold → silver → partner). Prominence encodes tier: platinum logos largest with `CircuitFrame` brackets, descending sizes below. Every logo sits in a uniform **logo well** — a fixed-aspect `--color-surface` panel with consistent padding — so mismatched logo files still look ordered. Cream-tinted monochrome at rest, full colour on hover, blurb revealed on hover and focus. Tier labels in mono. Empty tiers hidden. Close with a gold "Partner with us" CTA using `siteSettings.contactEmail`.

## 4.4 Team
Portrait grid `auto-fit minmax(220px, 1fr)`. Duotone portraits (purple shadows, cream highlights) to unify inconsistent photos. Clash name, mono role, `CircuitNode` beside each. Socials revealed on hover **and** focus (keyboard parity). Ordered by `order`; incomplete final rows centred, not left-stranded. Thin copper traces connect adjacent portraits into a board layout.

## 4.5 About
Editorial, no cards. Large Clash manifesto paragraph using the existing founding copy. Then a **timeline**: a vertical copper trace drawing in on scroll (`stroke-dashoffset`) with mono year nodes as vias. Then values as asymmetric text blocks with `CircuitNode` markers. `CircuitField` at 0.08 alpha behind the whole page.

## 4.6 Blog and Academic Resources
- **Blog**: newest post featured large with duotone cover; the rest as changelog rows — mono date, mono category, Clash title, two-line clamped excerpt, copper hairline separators. Calm; one batch fade, no per-row animation.
- **Academics**: grouped by category. Each row leads with the `courseCode` as a mono "address" (`COMP1511`), then Switzer title, then an external-link glyph for `externalUrl` items (new tab). List semantics, generous row height, copper hairlines.
- **404**: a `CircuitHero` variant with its traces broken mid-run and the travelling light stalling at the break. Mono `// 404 — SIGNAL LOST`. Gold link home.

## 4.7 Dithering — minimal accents only
The director rejected pixel/dither effects as a dominant language. They survive only as small, deliberate accents, implemented in **CSS/SVG with zero JS** (the WebGL shader is deleted in Phase 1):
- **Duotone images** via SVG `feComponentTransfer` with `feFuncR/G/B type="table"` mapping shadows to `--color-brand-purple` and highlights to `--color-gold`. This is the primary use and applies to all Sanity-uploaded photography.
- **Halftone texture** via layered `radial-gradient` plus `background-blend-mode: multiply`, used on at most two section transitions site-wide.
- **`feTurbulence` grain** at 3% opacity as a single fixed overlay, `pointer-events: none`, to kill gradient banding on the purple substrate.
- Optionally: a small halftone treatment on card hover, and the favicon.
Nothing else. No full-viewport pixel fields, no animated dither backgrounds.

## 4.8 Motion spec
- Headline reveals: GSAP SplitText `type: "lines", mask: "lines"`, `yPercent: 110 → 0`, duration 0.9, stagger 0.08, ease `expo.out`, `start: "top 82%"`, `once: true`. Set `aria-label` before splitting, `split.revert()` on cleanup, gate on `document.fonts.ready`.
- Element entrances: 0.7s, `power3.out`, `y: 40` plus autoAlpha, batched via `ScrollTrigger.batch` (stagger 0.12).
- Micro-interactions: 0.25s `power2.out`; hover lift `translateY(-2px)`; press `scale(0.98)`.
- Scrubbed effects: `scrub: 1`, `ease: "none"`.
- All GSAP inside `useGSAP` with scoped cleanup. `gsap.matchMedia` strips parallax and heavy reveals below 768px. Every effect has a `prefers-reduced-motion` static branch. Animate transform and opacity only — never `filter`.

## 4.9 Verification
- Every route at 360 / 768 / 1024 / 1440px: no horizontal scroll, nothing overflowing its container, footer reachable.
- Each Sanity-backed list tested at 0, 1, 3, and 20 items, and with a 120-character title.
- Report the contrast ratio for every text/background pair.
- Reduced-motion on: fully usable, nothing animating.
- Screenshot every route at desktop and 375px and self-assess against §2.3's forbidden-container list.

---

# PHASE 5 — COMPONENT INTEGRATION AND FINAL POLISH

Read `21stdev.md` for each component's source. Every component gets: palette restyle (zero hardcoded hex), reduced-motion branch, and its listed fixes.

## 5.1 LimelightNav — desktop navigation
- Convert the dead `<a onClick>` items into real `<Link>` elements from `next-view-transitions` with proper `href`s: Home, About, Events, Sponsors, Blog, Team.
- **Text labels, not icons** — JetBrains Mono uppercase 12px, tracked. Icon-only navigation is ambiguous for these destinations. Remove the lucide icon defaults.
- Active index derives from `usePathname()`, not internal click state, so it survives back/forward and direct loads. Recompute the beam position on pathname change and on resize.
- Restyle: substrate bar, copper hairline bottom border, the limelight beam in **gold**. This beam is the one permitted glow on the entire site — nothing else glows.
- Preserve the existing hide-on-scroll-down behaviour, the mobile hamburger, and the full-screen overlay (Lenis `stop()`/`start()`, Escape to close, focus trap). Do not regress these.
- Gold focus ring on every item.

## 5.2 SpecialText — the machine voice
- **Replace `useInView` from `motion` with a plain `IntersectionObserver`** so the `motion` package can be uninstalled (Phase 1.4).
- Fix `NodeJS.Timeout` → `ReturnType<typeof setInterval>`.
- Remove the hardcoded `h-4.5 leading-5` classes — they break at any size above small labels.
- Default `speed: 35` (slower and more deliberate than the shipped 20).
- Use ONLY on short mono strings: the hero eyebrow, section eyebrows, stat labels, the 404 message. **Never on Clash Display headlines** — those use SplitText.
- Cap at four concurrent instances per viewport; it setStates every tick.
- Reduced-motion: render the final text immediately, no scramble.

## 5.3 Osmo ParallaxComponent — one cinematic moment
- **Two bugs must be fixed or it will break the site.** As shipped it (a) instantiates its own Lenis instance, which will fight the site's existing `SmoothScrollProvider`, and (b) calls `ScrollTrigger.getAll().forEach(st => st.kill())` on cleanup, which destroys **every** ScrollTrigger on the site. Remove both. Use the shared Lenis instance and `useGSAP({ scope })` so only its own triggers revert.
- Replace the Osmo CDN mountain images with in-house SVG layers: L1 deep purple field (yPercent 60), L2 copper circuit lattice (45), L3 the Clash Display title "From first principles to first silicon" (30), L4 sparse gold foreground traces (8).
- Parent section is `relative overflow-hidden` — parallax layers translate beyond their bounds and must be clipped.
- `gsap.matchMedia`: mobile collapses to the title plus one layer. Reduced-motion: static composition.
- Use exactly once, on the home page between sections 4 and 5.

## 5.4 DitheringShader — deleted
Removed in Phase 1.3. Its role is served by the CSS/SVG treatments in §4.7. Do not reinstate.

## 5.5 ContainerScroll — cut
It requires `motion`, which is being removed, and the 3D-tilt card effect does not serve the CIRCUIT direction. If a similar moment is wanted later, rebuild it on GSAP ScrollTrigger — but not in this pass.

## 5.6 Documentation
Update `docs/design-language.md` with the circuit variant system, the mouse-reactivity restraint rules, and the per-page circuit application. Update `docs/checklists.md` with: Worker under 3 MiB; zero hardcoded hex; every text pair AA on its actual background; one glow only (the nav beam); no full-viewport dither; circuit animations gated to in-view; single animation engine (GSAP). Update `CLAUDE.md`'s folder map for `src/components/circuit/`.

## 5.7 Final verification — report every item
1. `npm run check` clean.
2. `npx opennextjs-cloudflare build` — gzipped size under 3 MiB. Report it.
3. `npx wrangler deploy` succeeds; the live site loads on the custom domain.
4. Grep: zero hardcoded hex in `src/components/**`; zero references to `#931621`, `#508484`, `#0A0B0F`; zero imports of `three`, `motion`, `framer-motion`.
5. Every route at 360 / 768 / 1024 / 1440px — no overflow, nothing clipped.
6. DevTools Performance at 4× CPU throttle scrolling home and events: report FPS.
7. Reduced-motion: no animation anywhere, fully usable.
8. Keyboard-only pass: every interactive element reachable with a visible gold focus ring; mobile menu traps and restores focus.
9. Contrast table for every text/background pair used.
10. Confirm nothing on the site reads as black or grey — the substrate is visibly purple on every route.
11. Self-review against §2.3's forbidden-container list: state which patterns existed before and confirm each is gone.
12. Screenshot every route at desktop and 375px.