# SIGNAL — Complete Redesign Master Prompt (CompEngSoc)

You are executing a full visual redesign of this site. The current design is rejected: it is ugly, the background animation freezes during scroll, components overflow their containers on every page, and sizing is uneven. This document replaces all prior design direction. Functional requirements (Sanity data, routes, the mandatory UNSW CTA link, Instagram/Discord links, mobile nav, accessibility) are preserved; the visual language is rebuilt from zero.

Design concept: **SIGNAL.** CompEngSoc is the origin point of a pulse — silicon to software. The site's living background is a slow, hypnotic, pixelated ripple radiating outward. Machine-voice text decodes into meaning. Colour is semantic, not decorative.

Work through this file in order. §1 fixes root causes before any styling. Show a full plan (including the §1 audit results) before changing code.

---

## §1 — ROOT-CAUSE FIXES FIRST (do these before any visual work)

### 1.1 The shader freeze bug (why the background stops when scrolling)
The current background uses the DitheringShader component (WebGL2). Its `useEffect` dependency array includes `colorBack, colorFront, speed, width, height`. If ANY of these arrive as props that change on scroll (they do — scroll-driven colour was requested previously), every change **tears down and rebuilds the entire WebGL program: deleteProgram → createProgram → shader recompile**. That is why the animation freezes during scroll. Confirm this in the audit, then fix it per §3's refactor spec. This is the single most important fix in this document.

### 1.2 Overflow / container-leak audit
Components leak outside containers on every page. Audit and fix root causes, in this order:
1. Grep for `w-screen` and `100vw` — on Windows, 100vw includes the scrollbar width and causes horizontal overflow. Replace with `w-full`.
2. Every absolutely-positioned decorative layer (canvases, SVG traces, parallax layers, aura blobs) must sit inside a `relative` parent with `overflow-hidden` (or `overflow-clip`). Parallax layers that translate via yPercent WILL extend beyond their section — the section wrapper clips them.
3. Add `overflow-x: clip` to `html, body` in globals.css as a safety net — but still fix the causes above; the net is not the fix.
4. Any element with negative margins or transforms extending past the viewport: justify or fix.
5. All images/media: enforce `aspect-ratio` containers + `object-cover`. No unconstrained intrinsic-size images.
6. Test every route at 360px, 768px, 1024px, 1440px: zero horizontal scrollbars, nothing clipped mid-element, footer reachable.

### 1.3 Sizing system reset (why everything looks uneven)
There is currently no consistent sizing rhythm. Impose the Layout Constitution (§7) globally: one container component, one spacing scale, three radius tokens, one type scale. Every page consumes these; no per-page ad-hoc values.

---

## §2 — THE SIGNAL DESIGN SYSTEM

### 2.1 Colour — semantic roles (this is binding)
Colour means something. Never use a colour outside its role.

| Token | Hex | Role |
|---|---|---|
| `--color-shell` | `#120A18` | The page shell: very dark purple-black (near-black with purple bias — NOT pure black, NOT neutral graphite). Base of everything. |
| `--color-surface` | `#1B1024` | Elevated panels/cards: one lightness step up from shell. |
| `--color-surface-2` | `#241531` | Second elevation step (hover states of panels, the container-scroll card). |
| `--color-ink` | `#F2EFE6` | Body text, most headlines. Warm cream. |
| `--color-ink-muted` | `#B9B3C4` | Secondary text, captions. |
| `--color-purple` | `#551081` | IDENTITY. Large fills, aura fields, logo backdrop, section-marker bands. **NEVER text** (1.7:1 on shell — fails everything). |
| `--color-purple-text` | `#B78BD4` | The only purple allowed at text/icon size (~7:1). Eyebrows, tags, links. |
| `--color-gold` | `#D9B368` | ENERGY. The one interactive accent: primary CTA fill (with dark ink text on it), active nav, link hover, key highlights, the signal itself. 9.9:1 on shell — safe everywhere. |
| `--color-teal` | `#508484` | STRUCTURE. Hairline borders, secondary UI, mono-label tint, dividers, chart secondary. ~4.7:1 — large text/UI only, never long body copy. |
| `--color-crimson` | `#931621` | LIVE. Fills/badges/aura accents meaning "happening / upcoming / hot". **NEVER text** (2.2:1). |
| `--color-crimson-text` | `#E57B85` | Crimson at text size (~7:1). "UPCOMING" tags, live markers. |
| `--color-hairline` | `color-mix(in oklch, var(--color-ink) 12%, transparent)` | All 1px borders. |

Rules: define ALL of these in globals.css `@theme`, mirror in `src/lib/design-tokens.ts`, document in `docs/design-language.md` — three files, one commit, never drift. Zero hardcoded hex anywhere in `src/components/**` after this pass (grep-verify). Hover/pressed tints via `color-mix(in oklch, …)` only. Per viewport: shell+ink dominate (~85%), one accent does the work; gold is the only glow-adjacent colour and even it glows in exactly one place (the nav limelight, §4.1).

### 2.2 Typography (fonts locked; usage rebuilt)
- **Clash Display** — headlines only. Sentence case ("Where silicon meets software." — never Title Case, never ALL CAPS). Tight tracking `-0.02em` at ≥48px. Hero `clamp(2.75rem, 6vw, 5.5rem)`; section H2 `clamp(1.9rem, 3.2vw, 3rem)`. Weight 500–600, never 700+ everywhere.
- **Switzer** — all body/UI. 16–17px, line-height 1.6, max measure 70ch, weights 400/500.
- **JetBrains Mono** — the machine voice: eyebrows, labels, tags, dates, stats, nav items. UPPERCASE, `letter-spacing: 0.08em`, 12–13px. Short strings only, never paragraphs.
- Define the scale as tokens/utilities. No inline font-size magic numbers.

### 2.3 Shape, borders, elevation
- Radius tokens, exactly three: `--r-sm: 6px` (buttons/inputs/tags), `--r-md: 12px` (cards/panels), `--r-lg: 24px` (the container-scroll frame, imagery). Nothing else.
- Borders: 1px `--color-hairline`. Hairline OR soft shadow — never both on one element.
- Elevation = a surface step (`shell → surface → surface-2`) + hairline. NEVER a coloured glow. NEVER `backdrop-blur` as decoration (mobile menu overlay is the sole permitted blur).
- Spacing scale: 4/8/12/16/24/32/48/64/96/128. Section vertical padding: `py-24 md:py-32`. Section separation is whitespace, not divider lines (thin SVG circuit traces are the only permitted "divider", used sparingly).

### 2.4 Texture stack (background layering, bottom → top)
1. `--color-shell` base.
2. Aura layer (fixed, `-z-30`): 2–3 huge soft radial-gradients — dominant purple aura centre-left, faint teal lower-right corner, whisper of crimson upper-right — each `radial-gradient(ellipse at …, color 0%, transparent 60%)` at low alpha. Static, no animation.
3. **The SIGNAL shader canvas** (fixed, `-z-20`, CSS `opacity: 0.55–0.65`): §3.
4. Grain overlay (fixed, `-z-10`, `pointer-events-none`): SVG `feTurbulence` tile at 3% opacity, `mix-blend-mode: overlay`. Kills banding, binds the layers.
5. Content.
- Where long body text sits over the animated background, wrap it in a "signal panel": `bg-[--color-surface]/80` + hairline + `--r-md`. Guarantees AA contrast regardless of what the shader is doing underneath.

### 2.5 Anti-slop hard-fails (audit old code for these; introduce none)
No purple→blue/indigo gradients (gradients only within the four brand colours). No gradient text. No aurora/bloom behind the hero. No uniform border-radius outside the three tokens. No card-for-every-block, no nested cards. No identical centered 3-card grids — editorial asymmetry. No emoji as icons. No coloured left-border strips on cards. No tracked-uppercase eyebrow on EVERY heading (mono eyebrows only where structural). No `p-4/gap-6` uniform rhythm. No fade-in-only animation everywhere.

---

## §3 — THE SIGNAL SHADER (persistent background, refactored)

Rebuild the DitheringShader integration as **one single, persistent, full-viewport canvas** mounted once in the root layout (client component, `fixed inset-0 -z-20 pointer-events-none aria-hidden`). ONE WebGL context for the entire site — never mount a second DitheringShader anywhere.

### 3.1 The refactor (fixes §1.1)
- The `useEffect` that creates the GL context, compiles the program, and sets up buffers runs ONCE (empty dependency array + a ResizeObserver that resizes the canvas/viewport without recreating the program).
- ALL dynamic values — `u_colorBack`, `u_colorFront`, `u_shape`, `u_pxSize`, speed — live in **refs**. The render loop reads refs every frame and sets uniforms. Changing colour/shape/speed NEVER re-runs the effect, NEVER recompiles anything.
- Expose an imperative API (context or a tiny module store): `setSignalColors(back, front)`, `setSignalShape(shape)`, `setSignalSpeed(n)`. The render loop **lerps** current colour toward target colour each frame (~0.04 lerp factor) so all colour changes glide.
- RAF throttled to **30fps** (delta accumulator) — the pulse is slow; 30fps halves GPU cost and reads identically.
- `document.visibilitychange` → pause/resume. `prefers-reduced-motion` → render exactly one frame, stop the loop (the component's own `speed=0` path gives a static dithered frame — use it).
- Canvas sizes to CSS pixels (the component already ignores devicePixelRatio — keep that; it's cheaper and the pixel aesthetic hides it).
- The animation keeps running during scroll. That is the point of this refactor. Verify it explicitly.

### 3.2 The look (matches the approved reference image)
- Shape: **`ripple`** — concentric rings pulsating outward from centre. `pxSize: 2` (small pixels — the current large blocky look is rejected). Dither `type: "8x8"` (finest pattern). Speed: **0.18** (slow, hypnotic — the current pace is too fast).
- Colours: `colorBack` = `--color-shell`, `colorFront` = per-route accent (below), whole canvas at CSS opacity ~0.6 so the auras beneath breathe through.

### 3.3 Per-route signal identity (uniform changes via the imperative API on route change — instant, no remount)
| Route | shape | front colour | note |
|---|---|---|---|
| `/` | ripple | gold, and **scroll-lerped**: a ScrollTrigger on the home page writes target colours per section (gold → teal → crimson → gold) via `setSignalColors`; the loop's lerp makes colour flow continuously as you scroll |
| `/events` | **wave** | crimson-text tint `#E57B85` at the shader level (fills read fine) — a waveform for a timeline page |
| `/sponsors` | ripple | gold |
| `/team` | ripple | teal |
| `/blog` | ripple | teal |
| `/about` | ripple | purple-text `#B78BD4` |
| `/academics` | ripple | teal |
| 404 | **swirl** | crimson tint |

---

## §4 — 21ST.DEV COMPONENT INTEGRATIONS (all six, each with required adaptations)

Install: `npm i motion` (needed by §4.5 and §4.2 — import from `"motion/react"`; change the container-scroll component's `"framer-motion"` import to `"motion/react"`, do NOT install framer-motion separately). `cn` already exists in `src/lib/utils.ts`. Components live in `src/components/ui/` per the existing structure. Every component below gets: brand-token restyle (zero hardcoded hex), reduced-motion branch, and its listed fixes.

### 4.1 LimelightNav → desktop navigation
- Convert the dead `<a onClick>` items to **real links** using `next-view-transitions`'s `<Link>` with proper `href`s: Home, About, Events, Sponsors, Blog, Team.
- **Text labels, not icons**: JetBrains Mono uppercase 12px tracked labels (icon-only nav is ambiguous for these destinations). Remove lucide icon usage.
- Active index derives from `usePathname()` (not internal click state) so it survives back/forward navigation and direct loads. Recompute the limelight position on pathname change AND window resize.
- Restyle: transparent/`shell` bar, hairline bottom border; the limelight beam = `--color-gold` with its cone gradient in gold at low alpha. **This is the single permitted glow on the site.** Transition `left` 400ms with the existing ease.
- Keep the existing hide-on-scroll-down / reveal-on-scroll-up behaviour and the existing mobile hamburger + full-screen overlay (restyle overlay to shell + grain; Lenis stop/start on open/close; Escape closes; focus trap — all already built, don't regress).
- Focus-visible: gold ring on every item.

### 4.2 SpecialText (decode/scramble) → the machine voice, site-wide
- This is the signature text effect for MONO-layer text only (it forces font-mono — on-brand): section eyebrows (`// WHAT WE DO`), the hero eyebrow (`// UNSW COMPUTER ENGINEERING · EST 2026`), stat labels, event tags, the 404 message. NEVER for Clash Display headlines (those use GSAP SplitText, §6).
- Adaptations: remove the hardcoded `h-4.5 leading-5` classes (they break at any size other than small labels — let it inherit line-height). Fix the `NodeJS.Timeout` type to `ReturnType<typeof setInterval>`. Add reduced-motion: render `children` immediately, no animation. Default `speed: 35` (slower, more deliberate than the shipped 20) and use `inView` + `once` so it plays when scrolled to. Stagger `delay` when multiple appear together (0 / 0.15 / 0.3).
- Perf guard: it setStates every tick — cap concurrent animating instances to ~4 per viewport; keep strings short (<40 chars).

### 4.3 CpuArchitecture → the "every layer of the stack" centerpiece (home §5.1-4)
- **The shipped snippet is missing the CSS that moves the lights** (`.cpu-line-1..8` circles sit at 0,0 without it). Write it: each light gets `offset-path: path("<the same d as its mask>")`, `offset-distance` keyframed 0%→100%, `animation: linear infinite`, durations staggered 6–10s with varied delays.
- **Remap ALL eight gradient colours to brand**: gold, teal, `#E57B85`, `#B78BD4`, cream, gold, teal, `#E57B85`. Delete the blue/green/orange/cyan/rose — off-palette neon is the exact gaming look we're killing. CPU rect `#181818` → `--color-surface`; marker/connection greys → surface/hairline tokens.
- Text: replace `"CPU"` with `"CESoc"` — widen the rect slightly and set fontSize ≈5.5 / adjust x so it fits the 200×100 viewBox cleanly. Keep the shimmer gradient but in gold/cream stops.
- **In-view only**: IntersectionObserver — the draw-in (`stroke-dashoffset` animate) fires on first intersection; travelling lights get `animation-play-state: paused` whenever off-screen. Reduced-motion: paths fully drawn, no lights, static text fill.

### 4.4 Osmo ParallaxComponent → the cinematic mid-home band (home §5.1-5)
- **Strip the component's own Lenis instance and ticker wiring** (the site already has one SmoothScrollProvider — a second Lenis will fight it), and **delete the `ScrollTrigger.getAll().forEach(st => st.kill())` cleanup** — as shipped it kills EVERY ScrollTrigger on the site on unmount. Replace all lifecycle with the project-standard `useGSAP({ scope })` so only its own triggers revert.
- Replace the Osmo CDN mountain images with in-house layers (SVG/optimised PNG): L1 deep purple aura blob (yPercent 60), L2 slate circuit-trace lattice (45), L3 the title — Clash Display "From first principles to first silicon" (30), L4 sparse gold foreground traces (8). Parent section `relative overflow-hidden` (§1.2).
- `gsap.matchMedia`: mobile collapses to title + one layer, gentle. Reduced-motion: static composition.

### 4.5 ContainerScroll → the "find your people" showcase (home §5.1-7)
- Import from `"motion/react"`. Restyle the card: `bg-[--color-surface-2]`, hairline border (kill `#6C6C6C` + `#222222`), `rounded-[--r-lg]`, replace the six-stack hardcoded black shadow with one soft ambient shadow. Drop the demo's `pt-[1000px] pb-[500px]` padding entirely.
- Trim runway height to `h-[42rem] md:h-[56rem]` so the moment doesn't consume three viewports.
- Content inside the tilting card: a duotone-graded community collage (event photos from Sanity if available, else a styled placeholder grid) + a gold "Join the Discord" CTA overlaying the lower edge.
- Its mobile scale branch already exists — verify; reduced-motion: static flat card (rotateX 0, scale 1).

### 4.6 DitheringShader (wave/simplex prompts) → consumed by §3
Both "Pixelated Wave" and "Simplex" prompts are the same component; it is the §3 persistent background. `wave` shape serves `/events`; `ripple` is the default; no standalone second mounts. This satisfies both prompts with one context.

---

## §5 — PAGE BLUEPRINTS

### 5.1 Home (the cinematic spine — sections in order)
1. **Hero** (full viewport): left-aligned editorial. SpecialText eyebrow `// UNSW COMPUTER ENGINEERING · EST 2026` (purple-text). H1 Clash Display "Where silicon meets software." via SplitText masked-lines (§6). One Switzer sub-line. CTA row: gold primary **"Join us"** (→ Discord) + ghost hairline **"Learn more"** → `https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering` (new tab, `rel="noopener noreferrer"`) — this exact link is a preserved hard requirement. Mono scroll cue bottom-left. The ripple shader radiates behind it all — the hero IS the signal source; no extra decoration needed.
2. **Stats strip**: hairline-topped row — `EST 2026 · MEMBERS n · EVENTS n` — mono, SpecialText decode on scroll-in, GSAP count-ups for the numbers.
3. **What we do**: three asymmetric blocks (Workshops / Projects / Industry) — varied spans (7/5 then 5/7 rhythm), not identical cards; each = mono eyebrow + Clash H3 + two Switzer lines + gold arrow-link. `ScrollTrigger.batch` reveal.
4. **The stack** (CpuArchitecture centerpiece): H2 "One society, every layer of the stack" + the §4.3 SVG large on the right, copy left linking to `/academics`.
5. **Cinematic band**: the §4.4 Osmo parallax moment. Full-bleed within an overflow-hidden section.
6. **Upcoming events preview**: the 3 soonest from Sanity — poster-card treatment (per 5.2), crimson-text `● UPCOMING` mono tags — link to `/events`. Empty state: `// signal idle — no upcoming events` in mono.
7. **Showcase**: the §4.5 ContainerScroll moment ("Find your people").
8. **Follow band**: Instagram + Discord transparent logos LARGE (96–128px), equal optical size, shared centerline; mono labels below, same size, centered under each (`INSTAGRAM` / `DISCORD`); links `https://www.instagram.com/unswcompengsoc/` and `https://discord.gg/DHFDcaNgSH`, new tab, aria-labels; rest = cream-tinted monochrome, hover = lift 2px + colour. Mobile: stacked, ≥44px targets.
9. **Footer**: shell, hairline top, mono machine voice — sitemap links, `© CompEngSoc 2026`, discreet `/studio` link, build stamp.

### 5.2 Events
- Header: SpecialText eyebrow + Clash H1. Shader = wave/crimson (§3.3).
- **Upcoming** (startDateTime ≥ now, existing logic): poster cards — larger, duotone-graded hero image (grayscale + purple/gold blend so any editor upload joins the palette), crimson-text `● UPCOMING` tag, gold date in mono, title Clash clamped to 2 lines, location mono. Grid `auto-fit minmax(320px,1fr)`, feature the soonest at 2× span.
- **Past**: receding — smaller, image desaturated toward shell, ink-muted, no motion, no tags.
- Detail page: full-width duotone poster hero, mono metadata rail (date/time/location/type), Switzer body in a signal panel, gold RSVP/tickets CTA when `ticketUrl` exists.
- Must look designed at 0, 1, 3, and 20 events; long titles clamp; empty state in machine voice.

### 5.3 Sponsors
Tier bands top-down (existing tier logic): platinum = largest logo wells, gold hairline frames; descending sizes below. Every logo in a uniform **logo well** (fixed-aspect padded surface panel) — greyscale/cream-tinted at rest, full colour on hover — so mismatched logo files still look ordered. Tier labels mono (`PLATINUM`). Empty tiers hidden. Close with a "Partner with us" gold CTA (contact from siteSettings).

### 5.4 Team
Portrait grid `auto-fit minmax(220px,1fr)`. Duotone portraits (purple shadows / cream highlights) so inconsistent photos unify. Name Clash small, role mono uppercase, socials revealed on hover AND focus (keyboard parity). Ordered by `order`; incomplete last rows centered.

### 5.5 About
Editorial: large Clash manifesto paragraph (the existing founding copy, sentence case), then a **timeline** — vertical DrawSVG line drawing on scroll with mono year nodes (2026 → planned milestones), then values as asymmetric text blocks. No cards. Purple-text shader tint.

### 5.6 Blog
Feature-first: newest post large (duotone cover, Clash title, excerpt), remainder as **changelog rows** — mono date + category + title + 2-line clamped excerpt, hairline-separated. Calm; no per-row animation beyond a batch fade.

### 5.7 Academics
Grouped by category; rows with mono course-code "addresses" (`COMP1511`) leading, title Switzer, external-link glyph for `externalUrl` items (new tab). List semantics, generous row height, hairlines.

### 5.8 404
Swirl shader (crimson tint) + SpecialText `// 404 — SIGNAL LOST` + mono link home. Cheap, memorable.

---

## §6 — MOTION SPEC (exact values)
- Headline reveals (Clash): GSAP SplitText `type:"lines", mask:"lines"`, `yPercent 110→0`, duration 0.9, stagger 0.08, ease `expo.out`, `start:"top 82%", once:true`. Set aria-label before splitting; revert on cleanup; wait for `document.fonts.ready`.
- Element entrances: 0.7s, `power3.out`, y:40 + autoAlpha, `ScrollTrigger.batch` (stagger 0.12) for lists/grids.
- Micro-interactions: 0.25s `power2.out`; hover lift `translateY(-2px)`; press `scale(0.98)`.
- Scrubbed (parallax, colour-lerp triggers): `scrub: 1`, `ease: "none"`.
- Everything inside `useGSAP` scoped + reverted; `gsap.matchMedia` strips parallax and heavy reveals on mobile; every effect has a reduced-motion static branch. Animate transform/opacity ONLY; never `filter`.
- Per-viewport effect budget: the persistent shader + at most ONE other heavyweight (parallax band OR ContainerScroll OR CPU lights) active in any viewport. Sections are ordered in §5.1 so these never coincide.

## §7 — LAYOUT CONSTITUTION
One `<Container>` component: `max-w-[1200px] mx-auto px-6 md:px-10`. All page content inside it (full-bleed sections wrap an inner Container). 12-col grid where columns are needed; asymmetric spans (7/5, 5/7, 8/4) over equal thirds. Section rhythm `py-24 md:py-32`. Spacing scale only (§2.3). Media: aspect-ratio + object-cover always. Touch targets ≥44px. Focus-visible gold ring on every interactive element. `overflow-x: clip` on html/body + §1.2 fixes.

## §8 — PRESERVED FUNCTIONAL REQUIREMENTS (do not regress)
All Sanity fetching/queries/status logic; the revalidation flow; `/studio`; the UNSW learn-more URL exactly as in §5.1-1; Instagram/Discord URLs; next-view-transitions page transitions; mobile hamburger overlay behaviour (Lenis stop/start, Escape, focus trap); keyboard operability; empty states for every CMS list; `npm run check` clean.

## §9 — DOCS TO REWRITE (same pass)
- `docs/design-language.md`: replace entirely with the SIGNAL system — §2 tokens (with the contrast table and fills-vs-text law), texture stack, per-route shader table, §6 motion spec, §7 constitution, the anti-slop list as binding calibration.
- `docs/checklists.md`: add — single WebGL context site-wide; shader program is NEVER recreated on colour/shape/speed change; shader animates during scroll; no `w-screen`/`100vw`; overflow audit passes at 360/768/1024/1440; zero hardcoded hex; every text/background pair AA on its actual local background; effect budget respected; `motion` is the only animation lib added.
- `docs/clean-code.md`: three-radius law, semantic-colour law (a colour never appears outside its §2.1 role), one-glow law (nav limelight only).
- Update CLAUDE.md folder map if files move; note `src/components/ui/` now hosts adapted 21st.dev components.

## §10 — VERIFICATION (execute and report each)
1. `npm run check` — zero errors.
2. Grep: zero hardcoded hex in `src/components/**`; zero `w-screen`; zero `100vw`.
3. **Scroll test**: on `/`, scroll continuously top→bottom — the ripple keeps animating the entire time (the §1.1 fix). Record that it does.
4. DevTools Performance, 4× CPU throttle, scrolling `/` through the parallax band and `/events`: report FPS; ≥50 required; name what you'd cut if not.
5. Exactly ONE WebGL context exists (check `document.querySelectorAll('canvas')` and confirm one shader canvas site-wide).
6. Overflow audit at 360/768/1024/1440 on every route: no horizontal scroll, nothing leaking its container, footer reachable.
7. Reduced-motion ON: static single shader frame, no decode animations, no reveals, no lights, no parallax — site fully usable.
8. Contrast: report the computed ratio for every text colour used, against its actual local background (including text over the shader at 0.6 opacity — use the effective composite; anything under AA gets a signal panel behind it).
9. Route-change test: navigate all routes — shader colour glides (no snap, no remount), limelight tracks the active item, back/forward keeps nav state correct.
10. Anti-slop self-review: list which §2.5 tells existed before and confirm each is gone.
11. Screenshot every page at desktop + 375px and self-assess against §5: does each read as designed, even, and intentional?

Begin with the §0-equivalent: run the §1 audits, read the current shader implementation to confirm the §1.1 diagnosis, then present the full plan before changing code.