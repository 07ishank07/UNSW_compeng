---
paths:
  - "src/components/depth/**"
  - "src/components/motion/**"
  - "src/hooks/**"
---

# Working in depth / motion

The hero and site-wide depth are **layered 2D (CSS/SVG)** — no WebGL/Three.js/shaders (those were removed; old code is in `docs/reference-implementations.md` for history only). Match the patterns already in `components/depth/*` and `components/motion/*` instead of inventing new ones.

Must hold:
- **GSAP is lazy-loaded.** Never `import { gsap } from "gsap"` (or a plugin) at module top in a component — that puts ~70 KB in first-load JS. Call `loadGsap()` (`src/components/motion/loadGsap.ts`) inside the effect, then create timelines/ScrollTriggers inside `gsap.context(fn, ref)` and call `ctx.revert()` in the effect cleanup so everything reverts on unmount. (This replaced the eager `useGSAP`/`registerGsap` pattern.)
- Every animation has a `prefers-reduced-motion` branch that is **static/instant**, not just "slower." Read it via `usePrefersReducedMotion()`.
- Depth/"pop" is CSS only: animate `transform`/`opacity` (compositor-friendly). Pointer parallax goes through the global `--mx`/`--my` channel written by `usePointerParallax` (rAF-throttled, gated off on touch / reduced-motion / `hardwareConcurrency < 4`). The **only** `requestAnimationFrame` in the app is that hook; it cancels on `visibilitychange`. Don't add idle loops.
- Decorative full-page layers size to `useDocumentHeight()` (document `scrollHeight`), `position: absolute; top: 0` — **never `fixed`/viewport** (that collapses the coordinate space; it was a real bug). They are `aria-hidden`, `pointer-events: none`, sit behind content (`-z-*`), and are deferred `ssr:false` via `DecorLayer`.
- Colours come from CSS tokens (`var(--color-*)`) or `src/lib/design-tokens.ts` — never a hard-coded hex. Motion timings come from `src/lib/easing.ts` and its CSS mirrors in `globals.css` (`--ease-energize`, `--dur-fast/base/slow`) — keep the two in sync.
- These files hold **only** animation / markup / scoped component CSS — no Sanity fetches, no copy strings, no business logic. Data arrives as props.
