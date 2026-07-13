> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §2 — ARCHITECTURAL GOALS & SUCCESS / FAILURE CHECKLISTS

These define the **mandatory final state** of each subsystem. They are acceptance conditions, not build steps. A subsystem is "done" when every SUCCESS line is true and zero FAILURE lines are true. Treat FAILURE lines as automatic blockers.

## 2.1 Global performance & loading

**SUCCESS**
- First load JS for the public routes stays lean: the **GSAP suite** (core + ScrollTrigger + DrawSVG + SplitText) is **lazy-loaded** (`loadGsap`, after hydration) and the decorative layers — including the one WebGL surface (`DitherField`) — are `ssr:false` (`DecorLayer`), so neither gates first paint. The field adds **no runtime dependency** (GLSL is inline strings; noise runs on the GPU, no `simplex-noise` package). `playwright-core` is a devDependency (perf-probe only). Measured first-load target: **~194 KB gzip** on `/`, `/events`, `/sponsors`, `/team`.
- Largest Contentful Paint < 2.5s and Interaction-to-Next-Paint < 200ms on a mid-tier mobile (throttled) for `/`, `/events`, `/sponsors`.
- Fonts are self-hosted via `next/font/local` with `display: swap`; no layout shift on font load (CLS ≈ 0).
- Images from Sanity go through `@sanity/image-url` with explicit width/quality and `next/image` (or Sanity CDN params); no full-resolution originals shipped.
- Any adopted external component (e.g. from the 21st.dev list) passes the §0.2.5 guardrails **before** integration: no NEW WebGL surface (the ONE sanctioned WebGL is the `DitherField`; anything else is reimplemented in CSS/SVG or rejected), no NEW always-on rAF loop, no new animation library (GSAP/Lenis only), restyled to tokens with zero hardcoded hex — see the adaptations (CPU-schematic → `CircuitSchematic`, SpecialText → `ScrambleLabel`/`SplitHeadline`, Osmo-parallax → `ParallaxLayers`, dithering-shader → `DitherField`; container-scroll pin and cursor-grid were dropped/cut for fps).

**FAILURE**
- The GSAP suite or the decorative layers appear in the initial shared bundle or block first paint. (There is no longer any `three`/R3F.)
- Any route ships an un-optimised image or a non-`swap` font causing visible reflow.
- The page is unresponsive (main thread blocked) during the hero boot sequence.

## 2.2 Layered-2D depth (the Gate hero + DepthField)

> The depth system is layered-2D CSS/SVG **plus the one sanctioned WebGL colour field** (`DitherField`, §0.2.1/§0.2.4).

**SUCCESS**
- **Colour reads as one continuous composition, not stacked blocks:** every route is transparent over the flowing `DitherField`; any crop of any component carries several hues (leaning purple/gold), and there are no hard section-boundary colour seams. Verified visually against `node scripts/perf-probe.mjs` screenshots (every route, desktop + 360px).
- Maintains **~60 FPS scroll** on a mid-tier device; holds **≥50 at 1–2× CPU throttle** (4× is an extreme stress — degrades gracefully). Verified with `node scripts/perf-probe.mjs` (per-route fps under throttle + 360px overflow + reduced-motion). Only `transform`/`opacity` animate (**never `filter`**; prefer `box-shadow` over `filter: drop-shadow`, and **no `mask-image`/3D/`pin` on scrolling elements** — all recomposite per scroll frame). Cut order if frames drop: cursor-grid (already cut) → parallax drift/settle → schematic stagger.
- Heavy effects are reduced/disabled at mobile widths where needed (`gsap.matchMedia()`), and the pointer channel is already gated off on touch/weak devices.
- **No glow-as-elevation anywhere**: depth reads from colour-field steps (`base → base-2 → surface`) + hairline borders + layered ambient shadows. The blueprint grid stays ≤10% opacity, and the grain veil (2–4%) is present over the colour fields — it is what stops the large fields from banding.
- The pointer-parallax channel (`usePointerParallax`) is **rAF-throttled** (≤ one CSS-var write per frame, never per raw event), **disabled on touch and under reduced motion**, and degrades to static on weak devices (`navigator.hardwareConcurrency < 4` → `data-perf="lite"`).
- **No stray loops:** exactly two sanctioned `requestAnimationFrame` loops — the pointer channel and the `DitherField` redraw. Both cancel on `visibilitychange`; the field also **freezes during active scroll** (a scroll listener skips the redraw). Scroll-driven motion is GSAP ScrollTrigger, which only updates in range. Nothing animates off-screen or in a background tab.
- The one WebGL surface (`DitherField`) caps its cost: backing store at a **capped internal resolution** (long side ≤ ~480px) upscaled with `image-rendering: pixelated` (so DPR is effectively capped — the chunky dither IS the aesthetic), redraw fps-capped, static single frame under reduced-motion / coarse-pointer / `hardwareConcurrency < 4`, and a CSS `.dither-fallback` gradient when WebGL2 is unavailable or the context is lost.
- Every decorative/background layer extends the **full document height** (`useDocumentHeight` → `scrollHeight`) and stays consistent to the footer; nothing reverts or blanks partway down a long page.
- GSAP (core + ScrollTrigger + DrawSVG + SplitText) is **lazy-loaded** (`loadGsap`, after hydration) and decorative layers are `ssr:false` (`DecorLayer`), so neither is in first-load JS.
- Under `prefers-reduced-motion`, all motion is replaced by a static/instant state (parallax off, breathing off, glitch off, reveals instant, the Trace already fully drawn).

**FAILURE**
- Any animation loop runs while its element is off-screen or the tab is hidden.
- Pointer parallax updates on every raw `pointermove` instead of rAF-throttled, or runs on touch devices.
- A decorative layer is viewport-fixed (collapsing the coordinate space) or stops partway down a long page.
- Any motion ignores `prefers-reduced-motion`.
- The GSAP suite or the decorative layers land in the eager first-load bundle / block first paint.

## 2.3 Scroll & motion (Trace spine, reveals, transitions)

**SUCCESS**
- A single shared **Lenis** instance drives smooth scroll and is wired to GSAP **ScrollTrigger** (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`), with `lerp`/duration tuned for "weight," not nausea.
- All GSAP work is created inside **`gsap.context(fn, ref)`** within effects (GSAP arrives via `loadGsap()`), with `ctx.revert()` in the effect cleanup, so timelines and ScrollTriggers are **reverted on unmount**.
- The Trace draws in sync with scroll progress; the signal pulse and via lights track section entry; reduced motion shows the trace already fully drawn, statically.
- Page transitions read as a quick "context switch" (board de-energize → re-energize) **without** a full white flash or layout jump, and never delay content interactivity by more than a frame or two.
- Motion vocabulary comes from `src/lib/easing.ts` + the §0.2.5 timing table (built-in `power2.out`/`power3.out` eases; micro 0.25s, entrances 0.7s).

**FAILURE**
- ScrollTriggers or timelines persist after navigation (duplicated triggers, jittery scroll, growing listener count).
- Lenis fights native anchor/keyboard scrolling or traps focus; tab/`Space`/`PageDown` navigation breaks.
- Any motion ignores `prefers-reduced-motion`.
- Scroll-jacking so aggressive that users cannot reach the footer or skip ahead.

## 2.4 Headless data (Sanity)

**SUCCESS**
- All content is fetched server-side in Server Components via a single typed `sanityFetch` wrapper that sets **cache tags** per content type; `useCdn: true` for published reads.
- Publishing in Studio updates the live site **without manual intervention**: the shipped architecture (docs/deployment.md §5.5 option 1) has the Sanity webhook fire a `repository_dispatch` → GitHub Actions rebuild + redeploy (~1–2 min), plus a daily scheduled rebuild that re-derives date-dependent state (the upcoming/past split freezes at build on a static site). Fetch cache **tags are retained** on every `sanityFetch` call so a future on-demand ISR path (§5.5 option 3) can revive `/api/revalidate` without touching call sites.
- GROQ queries are centralised in one `queries.ts`, parameterised (no string interpolation of user input), and request only the fields a view needs.
- Fetched data is validated/narrowed at the boundary (Zod or generated Sanity types) so a malformed/empty document can never crash a render — empty/partial states render the machine-voice empty/error copy from §0.2.7.
- Draft/preview is gated behind a server-only token and never exposes the write token to the client.

**FAILURE**
- The Sanity **write token** or **revalidate secret** is referenced in any client component or shipped in `NEXT_PUBLIC_*`.
- A missing field, empty result, or fetch error throws and white-screens a route instead of showing the designed empty/error state.
- Schema field names in code drift from the schema definitions (a query asks for a field that no longer exists) — this is a hard mismatch and must fail loudly in dev, not silently render blanks.
- The publish→deploy pipeline can be triggered by an unauthenticated caller (the `repository_dispatch` endpoint requires the fine-grained PAT held only in the Sanity webhook config; deploy credentials live only in GitHub repo secrets).

## 2.5 Responsiveness & accessibility (the quality floor)

**SUCCESS**
- Layout is correct and comfortable from 360px to ultrawide; the Signal Timeline becomes a vertical stack on mobile; no horizontal overflow anywhere.
- Full keyboard operability with **visible focus rings** (copper/gold outline) on every interactive element; the custom cursor never removes focus visibility.
- Semantic HTML (landmarks, headings in order, `nav`/`main`/`footer`); all sponsor/exec images have meaningful `alt`; decorative canvas/SVG are `aria-hidden`.
- Colour contrast clears WCAG AA for all text **on its actual coloured field, not assumed against a dark neutral** — every sanctioned text/field pairing is enumerated and gated by `npm run check:contrast` (scripts/contrast.mjs), which must pass. The gold field takes `ink-inverse` only (light inks fail on gold), `purple-soft` never sits on `surface`, gold text on `fill-crimson` is large-only. "Energized" states are not the *only* signal of meaning (don't rely on colour alone — pair with motion/label).
- **Zero hardcoded hex in `src/components/**` / `src/app/**` markup** — colours are tokens (`globals.css @theme` + the `design-tokens.ts` mirror) only. Radii use only the three radius tokens.
- Touch devices get the native cursor and tap-friendly targets (≥ 44px).

**FAILURE**
- Any interactive control is keyboard-unreachable or has no visible focus state.
- Decorative layers are exposed to the accessibility tree or steal focus.
- Hover-only information with no focus/detail-page equivalent.
- Text fails AA contrast on substrate.

## 2.6 Build, types & deploy hygiene

**SUCCESS**
- `next build` (Turbopack default) passes with **zero type errors** and zero ESLint errors; `tsc --noEmit` is clean; `npm run check:contrast` passes (palette mirror + WCAG gate).
- `.env.local` is git-ignored; `.env.example` documents every variable; secrets are set via `wrangler secret put` and public values via `wrangler.jsonc` `vars` (see `docs/deployment.md` §5.4.2) — not a dashboard env-var UI.
- The embedded `/studio` route builds and loads in production at `https://<domain>/studio`.
- Lighthouse (mobile) ≥ 90 Performance / ≥ 95 Accessibility / ≥ 95 Best-Practices / ≥ 95 SEO on `/` and `/events`.

**FAILURE**
- Type errors suppressed with `// @ts-ignore` or `next.config` `ignoreBuildErrors`/`ignoreDuringBuilds` set to true.
- A committed secret in git history.
- A broken `/studio` route in production.

---

