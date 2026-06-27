> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §2 — ARCHITECTURAL GOALS & SUCCESS / FAILURE CHECKLISTS

These define the **mandatory final state** of each subsystem. They are acceptance conditions, not build steps. A subsystem is "done" when every SUCCESS line is true and zero FAILURE lines are true. Treat FAILURE lines as automatic blockers.

## 2.1 Global performance & loading

**SUCCESS**
- First load JS for the public routes stays lean: the **GSAP suite** (core + ScrollTrigger + DrawSVG + SplitText) is **lazy-loaded** (`loadGsap`, after hydration) and the decorative layers are `ssr:false` (`DecorLayer`), so neither gates first paint. Measured first-load (this build): **~194 KB gzip** on `/`, `/events`, `/sponsors`, `/team` (summed from each prerendered route's script set). There is no WebGL bundle anymore.
- Largest Contentful Paint < 2.5s and Interaction-to-Next-Paint < 200ms on a mid-tier mobile (throttled) for `/`, `/events`, `/sponsors`.
- The canvas/asset bundle (shaders, glTF, textures) finishes loading in **under ~1.5s** on a good connection, and shows a lightweight boot/skeleton until ready.
- Fonts are self-hosted via `next/font/local` with `display: swap`; no layout shift on font load (CLS ≈ 0).
- Images from Sanity go through `@sanity/image-url` with explicit width/quality and `next/image` (or Sanity CDN params); no full-resolution originals shipped.

**FAILURE**
- The GSAP suite or the decorative layers appear in the initial shared bundle or block first paint. (There is no longer any `three`/R3F.)
- Any route ships an un-optimised image or a non-`swap` font causing visible reflow.
- The page is unresponsive (main thread blocked) during the hero boot sequence.

## 2.2 Layered-2D depth (the Gate hero + DepthField)

> The hero/depth system is CSS/SVG, not WebGL (§0.2.4). These criteria replace the retired WebGL ones.

**SUCCESS**
- Maintains **~60 FPS** during parallax / reveal / scroll on a mid-tier device: only `transform`/`opacity` (plus cheap `background`/`filter`) animate, staying on the compositor — no layout/paint thrash.
- The pointer-parallax channel (`usePointerParallax`) is **rAF-throttled** (≤ one CSS-var write per frame, never per raw event), **disabled on touch and under reduced motion**, and degrades to static on weak devices (`navigator.hardwareConcurrency < 4` → `data-perf="lite"`).
- **No idle loops:** the only `requestAnimationFrame` in the codebase is the pointer channel; it is scheduled solely on movement and cancelled on `visibilitychange` (hidden tab). Scroll-driven motion is GSAP ScrollTrigger, which only updates in range. Nothing animates off-screen or in a background tab.
- No raw pixel-buffer rendering exists (no `<canvas>`/WebGL), so there is **no device-pixel-ratio surface to cap** — the compositor renders at native resolution. (The old `dpr={[1,2]}` cap is N/A.)
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
- All GSAP work lives inside the **`useGSAP()`** hook (`@gsap/react`) scoped to a container ref, so timelines and ScrollTriggers are **reverted on unmount** automatically.
- The Trace draws in sync with scroll progress; the signal pulse and via lights track section entry; reduced motion shows the trace already fully drawn, statically.
- Page transitions read as a quick "context switch" (board de-energize → re-energize) **without** a full white flash or layout jump, and never delay content interactivity by more than a frame or two.
- `CustomEase` `energize` is registered once and reused.

**FAILURE**
- ScrollTriggers or timelines persist after navigation (duplicated triggers, jittery scroll, growing listener count).
- Lenis fights native anchor/keyboard scrolling or traps focus; tab/`Space`/`PageDown` navigation breaks.
- Any motion ignores `prefers-reduced-motion`.
- Scroll-jacking so aggressive that users cannot reach the footer or skip ahead.

## 2.4 Headless data (Sanity)

**SUCCESS**
- All content is fetched server-side in Server Components via a single typed `sanityFetch` wrapper that sets **cache tags** per content type; `useCdn: true` for published reads.
- A **webhook → `/api/revalidate`** route validates the Sanity signature and revalidates the affected tag/path, so publishing in Studio updates the live site **without a redeploy** (on-demand ISR). A sane time-based `revalidate` fallback exists.
- GROQ queries are centralised in one `queries.ts`, parameterised (no string interpolation of user input), and request only the fields a view needs.
- Fetched data is validated/narrowed at the boundary (Zod or generated Sanity types) so a malformed/empty document can never crash a render — empty/partial states render the machine-voice empty/error copy from §0.2.7.
- Draft/preview is gated behind a server-only token and never exposes the write token to the client.

**FAILURE**
- The Sanity **write token** or **revalidate secret** is referenced in any client component or shipped in `NEXT_PUBLIC_*`.
- A missing field, empty result, or fetch error throws and white-screens a route instead of showing the designed empty/error state.
- Schema field names in code drift from the schema definitions (a query asks for a field that no longer exists) — this is a hard mismatch and must fail loudly in dev, not silently render blanks.
- The revalidate route accepts unsigned requests.

## 2.5 Responsiveness & accessibility (the quality floor)

**SUCCESS**
- Layout is correct and comfortable from 360px to ultrawide; the Signal Timeline becomes a vertical stack on mobile; no horizontal overflow anywhere.
- Full keyboard operability with **visible focus rings** (copper/gold outline) on every interactive element; the custom cursor never removes focus visibility.
- Semantic HTML (landmarks, headings in order, `nav`/`main`/`footer`); all sponsor/exec images have meaningful `alt`; decorative canvas/SVG are `aria-hidden`.
- Colour contrast clears WCAG AA for all text; "energized" states are not the *only* signal of meaning (don't rely on colour alone — pair with motion/label).
- Touch devices get the native cursor and tap-friendly targets (≥ 44px).

**FAILURE**
- Any interactive control is keyboard-unreachable or has no visible focus state.
- Decorative layers are exposed to the accessibility tree or steal focus.
- Hover-only information with no focus/detail-page equivalent.
- Text fails AA contrast on substrate.

## 2.6 Build, types & deploy hygiene

**SUCCESS**
- `next build` (Turbopack default) passes with **zero type errors** and zero ESLint errors; `tsc --noEmit` is clean.
- `.env.local` is git-ignored; `.env.example` documents every variable; secrets are set via `wrangler secret put` and public values via `wrangler.jsonc` `vars` (see `docs/deployment.md` §5.4.2) — not a dashboard env-var UI.
- The embedded `/studio` route builds and loads in production at `https://<domain>/studio`.
- Lighthouse (mobile) ≥ 90 Performance / ≥ 95 Accessibility / ≥ 95 Best-Practices / ≥ 95 SEO on `/` and `/events`.

**FAILURE**
- Type errors suppressed with `// @ts-ignore` or `next.config` `ignoreBuildErrors`/`ignoreDuringBuilds` set to true.
- A committed secret in git history.
- A broken `/studio` route in production.

---

