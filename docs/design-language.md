> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §0.2 — DESIGN LANGUAGE

This section is binding. Every colour and type decision in code derives from here. Do not introduce ad-hoc hex values or fonts in components.

## 0.2.0 Calibration — what to *avoid*

Generic AI-generated design clusters around three looks: (a) cream background + high-contrast serif + terracotta accent; (b) **near-black background + one acid-green or vermilion neon accent**; (c) broadsheet hairline-rule columns with zero radius. A "hardware" brief falls into trap (b) by reflex — black with neon green. **We deliberately refuse it.** Our accent is **copper and immersion-gold on graphite** — the actual materials of a fabricated board — not gamer RGB. This is the first and most important anti-templated decision; preserve it.

## 0.2.1 Colour tokens — "Tape-out" palette (6 named values + support)

Named for real PCB/fab materials. Defined once in `globals.css` `@theme` as `--color-*`. Use OKLCH or hex; hex given for clarity.

| Token (CSS var)        | Name             | Hex        | Role |
|------------------------|------------------|------------|------|
| `--color-substrate`    | Substrate        | `#0A0B0F`  | Page background. Near-black with a cool graphite bias — the FR-4/wafer base. Never pure `#000`. |
| `--color-copper`       | Copper Trace     | `#C77B45`  | **Primary accent.** Traces, the bus spine, default "conductive" elements. The signature colour. |
| `--color-copper-bright`| Copper Highlight | `#E8A877`  | Lit copper — hover/active edges, specular glints. |
| `--color-gold`         | ENIG Gold        | `#D9B36A`  | Pads, primary CTAs, "finished/active" states. The immersion-gold finish. Use sparingly; it signals importance. |
| `--color-gold-bright`  | Gold (lit)       | `#FFDA03`  | Lit ENIG gold — the energized "output‑high" state on the gate and Trace, LIVE badges. The brightest hot point; reserve for the single most‑energized element in view. |
| `--color-signal`       | Signal           | `#86E0D8`  | **The energized accent.** Live current, in-progress data, the traveling scroll pulse. The *only* cool-bright colour, used scarcely — it means "powered." |
| `--color-purple`       | Logo Purple      | `#551081`  | **Tertiary brand accent**, sampled from the society logo (`public/brand/logo.png`). Energized halos/glows behind the gate and vias, focus glows — used *sparingly*. Graphite/copper stay dominant; purple is never a base, body text, or large fill. |
| `--color-purple-bright`| Logo Purple (lit)| `#7B3FB0`  | Lit pair of Logo Purple — hover/active glow tints. Same sparing rule. |
| `--color-solder`       | Solder Mask      | `#103A33`  | Structural hairlines, dividers, inactive borders. A deep desaturated teal-green — a knowing nod, demoted to a minor structural role (never a glow, never a fill). |
| `--color-silk`         | Silkscreen       | `#ECECE4`  | Primary text. Warm off-white, like component silkscreen. Never pure `#FFF`. |
| `--color-ghost`        | Ghost            | `#8A8D98`  | Secondary text, muted labels, de-energized/past items. |

Derive tints with `color-mix(in oklch, …)` in CSS rather than adding new tokens. Contrast floor: body text on substrate must clear WCAG AA (silk/ghost both pass; verify any tint).

## 0.2.2 Typography — human voice vs machine voice

The type system *is* the thesis. Two registers, three faces. All free, all self-hosted via `next/font/local` from Fontshare/Google.

- **Display — `Clash Display`** (Fontshare, variable). Confident, faintly architectural; carries section titles and the hero wordmark. Animate its variable weight on reveal ("energizing" text). Use with restraint — large, infrequent, never for paragraphs.
- **Body — `Switzer`** (Fontshare, variable). Neutral, highly legible grotesk for all human prose: About copy, event descriptions, blog body.
- **Mono / Utility — `JetBrains Mono`** (free). **The machine voice.** Every machine-generated datum is set in mono: timestamps, coordinates, course "addresses," sponsor rail voltages, status flags, the `// comment`-styled empty states, and any literal code/HDL snippet shown on the page. This human/machine dichotomy across faces is the single most legible expression of the hardware/software fusion — protect it; do not set timestamps in the body face or prose in mono.

Type scale (fluid, `clamp()`): display `clamp(2.5rem, 6vw, 5.5rem)`; h2 `clamp(1.75rem, 3vw, 2.75rem)`; body `1.0625rem / 1.6`; mono-label `0.8125rem`, `letter-spacing: 0.04em`, uppercase for labels. Set these as utility classes or `@theme` font-size tokens — never inline magic numbers.

## 0.2.3 The signature element — "The Trace" (spend boldness here)

There is exactly **one** thing this site is remembered by: **a living copper bus that threads the entire page**, drawn as the reader scrolls, with a **signal pulse** that travels along it synchronised to scroll progress, and **vias** (junction points) that light up — copper → gold → signal — as each section enters the viewport. It is the navigational spine and the narrative device: scrolling literally powers the board from top to bottom.

Everything else stays quiet and disciplined. The hero "Substrate" (below) is the thesis statement; the Trace is the through-line; transitions are "context switches." The utility modules are themed but calm. **Do not give every module its own competing animation** — that is the failure mode that reads as AI-generated. Restraint is the brief.

Implementation: an inline SVG `<path>` per section segment, animated with **GSAP DrawSVG** (`strokeDashoffset`) bound to **ScrollTrigger**; the pulse is a second short, bright dash with a `signal`-coloured `feGaussianBlur` glow, its `start`/`end` offset driven by scroll progress. Reference code in §A.2.

**SVG container positioning (do not repeat this mistake):** The container `<svg>` must be `position: absolute` and sized to the full *document* height — not `position: fixed` / viewport-pinned. A fixed container collapses the coordinate space to the viewport height, so any path taller than one screen is clipped and the scroll-draw illusion breaks entirely. The correct pattern: `position: absolute; top: 0; left: 0; width: 100%; height: <document-height>px` (set via JS), with `overflow: visible` on any ancestor that might clip it. This is implemented in `src/components/motion/TraceWire.tsx`: a document-height SVG whose path is authored in **real px** (viewBox = measured width × document height via `useDocumentHeight`, so nothing is stretched and vias stay circular) and routed in the side gutter so it never overlaps content. The earlier `TraceSpine.tsx` scaffold — which decoupled a fixed 0–400 viewBox from the real height and let `preserveAspectRatio="none"` stretch x across the content column — was exactly that bug, and has been removed.

## 0.2.4 The hero thesis — "The Gate" (layered 2D)

The landing hero is the society's **logic-gate logo mark** as the subject, composed from **stacked, shaded 2D layers — no WebGL/3D engine.** Depth and "pop" come from the classic 2.5D toolkit: per-layer blur, drop-shadow, glow, opacity, blend-modes, and differential pointer parallax. Built in `src/components/depth/HeroGate.tsx`.

> **Why 2D, not WebGL:** this hero must run consistently on every page and device without shipping a 3D engine. The earlier WebGL/R3F "Substrate/AND-gate" was removed in the visual-revision pass; the audit found it isolated to `components/canvas/*` + `shaders/*`, and dropping it removed `three`/`@react-three/*`/`postprocessing` entirely. The layered-2D system below is the current direction. The old WebGL code is preserved for history only in `docs/reference-implementations.md`.

**Layers (back → front):** purple back-glow (blurred, gently breathing) → board-grid card → drop-shadow plate → the sharp logo mark (lifted, tilts toward the pointer) → a pointer-tracked specular sheen → a static scanline veil. Each is a `.depth-layer` that parallaxes against the global `--mx`/`--my` pointer channel by its own `--depth`.

**Depth (site-wide):** `DepthField.tsx` provides the always-present backdrop — a graphite wash, a faint Manhattan grid, copper/purple glow nodes that **recur down the full document height** (so coverage stays consistent to the footer), and a scanline veil. Intentionally static and cheap; the hero + Trace carry the motion.

**Pointer reactivity ("probe heat"):** the mark tilts and the sheen tracks the cursor via `--mx`/`--my`, written **rAF-throttled** by `usePointerParallax`. Disabled on touch (`pointer: coarse`), under reduced motion, and on weak devices (`hardwareConcurrency < 4` → `data-perf="lite"`); the channel then stays 0 and the composition is simply static.

**Energize + glitch as punctuation:** when scroll crosses the "output goes high" threshold (`scrollSignal.hero`), the gate warms copper → gold and fires ONE brief CSS glitch (chromatic aberration + jitter, `src/components/motion/glitch.ts`), then settles. Never a constant effect; under reduced motion `scrollSignal.hero` stays 0 so it never fires.

**The wire:** the copper output continues down the page as the Trace (`TraceWire.tsx`, §0.2.3) — a px-accurate SVG spine, not WebGL tubes.

**Mobile / reduced motion:** the same layered composition runs on every device (it is cheap CSS). Under `prefers-reduced-motion` all motion (breathing, parallax, glitch, headline reveal) is off and the hero is static.

**"Learn more" CTA:** always present above the hero at `z-10`, linking to `https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering` (`target="_blank"`, `rel="noopener noreferrer"`).

Implementation: `src/components/depth/HeroGate.tsx`, `DepthField.tsx`, `DecorLayer.tsx` (defers the decorative layers `ssr:false`); glitch in `src/components/motion/glitch.ts`; headline reveal in `src/components/motion/SplitHeadline.tsx`.

## 0.2.5 Motion grammar — the "energize" easing

Define one shared `CustomEase` named `energize` modelled on an RC charging curve: fast attack, slight overshoot, gentle settle (a capacitor charging and ringing). Use it for reveals and state changes so motion feels physical and consistent. Idle/ambient motion (clock pulses, breathing glow) is slow and looped. Reduced motion replaces all of it with instant opacity/visibility states.

## 0.2.6 Cursor — the probe

A custom cursor: a small ring with a centre dot styled as an oscilloscope probe tip; it **magnetically snaps** toward interactive nodes on proximity and leaves a faint phosphor trail. Disabled on touch devices and under reduced motion (native cursor restored). `pointer-events: none`; never intercepts clicks.

## 0.2.7 Voice & copy rules

Copy is design material (§6). Active voice; sentence case; plain verbs. Interface states speak in the interface's voice, optionally as machine comments: an empty events list reads `// signal idle — no upcoming events on the bus`; an error reads `// fetch failed — retrying`. Buttons say exactly what happens ("Open in Studio", "Get tickets", "Read the changelog"). Names describe what the user controls, never how the system is built.

---

