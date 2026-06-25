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
| `--color-signal`       | Signal           | `#86E0D8`  | **The energized accent.** Live current, in-progress data, the traveling scroll pulse. The *only* cool-bright colour, used scarcely — it means "powered." |
| `--color-solder`       | Solder Mask      | `#103A33`  | Structural hairlines, dividers, inactive borders. A deep desaturated teal-green — a knowing nod, demoted to a minor structural role (never a glow, never a fill). |
| `--color-silk`         | Silkscreen       | `#ECECE4`  | Primary text. Warm off-white, like component silkscreen. Never pure `#FFF`. |
| `--color-ghost`        | Ghost            | `#8A8D98`  | Secondary text, muted labels, de-energized/past items. |
| `--color-logo-purple`  | Logo Purple      | `#551081`  | Reflective accent sampled from `assets/circle.png`. Use only for the logo's own drop-shadow/glow on the `/about` hero. Never as a fill, text colour, or background anywhere on the site. |
| `--color-logo-yellow`  | Logo Yellow      | `#FFDA03`  | Reflective accent sampled from `assets/circle.png` (UNSW yellow). Echoes `--color-gold`; may appear at low opacity as a delicate logo-adjacent highlight. Same restriction: no fills, no text. |

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

## 0.2.4 The hero thesis — "The Substrate"

The landing hero is a **live WebGL silicon die** (R3F): a procedural floorplan shader on a plane, lit as if powered. On first load it runs a brief **boot sequence** — power rails charge, the die illuminates, the `CompEngSoc` wordmark resolves from a silkscreen outline to filled copper — then settles into an idle state where slow autonomous **clock pulses** cross the die. The cursor is a **probe**: proximity raises local current/glow like a heat map. A prominent **"Learn more"** button links to `https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering`. Reference shader in §A.1; canvas wrapper in §A.3.

## 0.2.5 Motion grammar — the "energize" easing

Define one shared `CustomEase` named `energize` modelled on an RC charging curve: fast attack, slight overshoot, gentle settle (a capacitor charging and ringing). Use it for reveals and state changes so motion feels physical and consistent. Idle/ambient motion (clock pulses, breathing glow) is slow and looped. Reduced motion replaces all of it with instant opacity/visibility states.

## 0.2.6 Cursor — the probe

A custom cursor: a small ring with a centre dot styled as an oscilloscope probe tip; it **magnetically snaps** toward interactive nodes on proximity and leaves a faint phosphor trail. Disabled on touch devices and under reduced motion (native cursor restored). `pointer-events: none`; never intercepts clicks.

## 0.2.7 Voice & copy rules

Copy is design material (§6). Active voice; sentence case; plain verbs. Interface states speak in the interface's voice, optionally as machine comments: an empty events list reads `// signal idle — no upcoming events on the bus`; an error reads `// fetch failed — retrying`. Buttons say exactly what happens ("Open in Studio", "Get tickets", "Read the changelog"). Names describe what the user controls, never how the system is built.

## 0.2.8 The society logo — `circle.png` placement & usage

`assets/circle.png` is the **only image asset the society owns**. It is a circular lockup: deep purple (`#551081`) background, UNSW yellow (`#FFDA03`) artwork. Copy it to `public/images/circle.png` — never reference `assets/` from code.

**Permitted placements (these five, no others without an explicit decision):**

| Placement | Component | Size & treatment |
|-----------|-----------|------------------|
| Nav — far left | `Nav.tsx` | 32 px, `next/image`, links to `/`. No glow. |
| Footer — left column | `Footer.tsx` | 40 px, beside the copyright line. |
| `/about` hero | `app/about/page.tsx` | 80 px, centred above the primary heading. On hover/focus (pointer devices only, `prefers-reduced-motion: no-preference` only): `filter: drop-shadow(0 0 12px color-mix(in oklch, var(--color-logo-purple) 20%, transparent))` on the wrapper. |
| Browser tab / PWA icons | `public/favicon.ico`, `public/icon.svg` | Generated from `circle.png`. The circle is already maskable. |
| Open Graph image | `public/og/default-og.png` | Logo centred on a `--color-substrate`-filled 1200×630 canvas. Generate once, commit. |

**Hard rules:**
- Always `next/image` with `alt="CompEngSoc logo"`. Not `aria-hidden` — it is meaningful brand identity.
- Never place the logo inside the WebGL canvas, as a shader texture, or as a page-level background/watermark/repeat.
- Minimum rendered size: 28 px. Never scale below this.
- Never invert, recolour, or apply CSS filters beyond the single drop-shadow above.
- The `--color-logo-purple` drop-shadow is the only place either logo token appears as a visible effect. Do not use these tokens elsewhere.
- The Nav logo must remain in a stacking layer above TraceSpine and all decorative SVG (Nav already satisfies this per §2.5 — do not regress it).

---

