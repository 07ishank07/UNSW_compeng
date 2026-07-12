---
paths:
  - "src/components/depth/**"
  - "src/components/motion/**"
  - "src/hooks/**"
---

# Working in depth / motion

Depth is **layered 2D (CSS/SVG)** plus **section-scoped WebGL2 pixel-dither fields — only via `components/depth/SectionField.tsx`** (shared GLSL in `components/depth/ditherShader.ts`; colour recipes in `src/lib/fieldRecipes.ts`). This is the SIGNAL "sectioned stations" model: each section owns ONE field with ONE shape and ONE tonal two-brand-colour recipe, running edge-to-edge; text sits on content-fitted `ScrimPool`s; `CopperSeam` bars separate stations. The hero logo's cursor effect (`components/depth/HeroLogo.tsx`) is the one other sanctioned canvas. Ad-hoc WebGL/Three.js/R3F elsewhere stays banned. (This DELIBERATELY replaced the earlier "exactly ONE global field" + "never fixed / freeze-during-scroll" doctrine — do not restore either.)

The SectionField contract (replicate exactly if you touch it):
- `absolute inset-0 -z-20` inside a `relative isolate overflow-hidden` section — never `fixed`, never document-height.
- Fixed dither cell (`DOWNSCALE`, ~3 CSS px) + `image-rendering: pixelated`; fragment cost is set by the backing store, capped by `MAX_AREA`.
- Context created lazily on approach (IntersectionObserver rootMargin); **the rAF loop runs only while intersecting AND the page is visible** — off-screen sections cost zero.
- `fieldPool` bounds active GPU programs (LRU). **Eviction is SOFT** — it frees the program/buffers but KEEPS the context (a deliberately-lost canvas can never `getContext` again; hard eviction bricked fields). Full teardown + `loseContext()` happens ONLY on unmount, so navigation still frees every context. `webglcontextlost/restored` are handled.
- The 4π phase-wrap contract in the shader: every GLSL time coefficient is an integer multiple of `t` so mediump `sin` never degrades and nothing pops at the wrap.
- reduced-motion / `hardwareConcurrency < 4` / Save-Data → NO canvas; the static CSS accent tint is the ground. Coarse pointers animate behind the `MOBILE_ANIMATE` knob.
- Field colours come ONLY from `FIELD.*` recipes (tokens; both colours ≤ accent-gold luminance so the scrim gate's worst case holds at any opacity). Never ink/white in a field.

Hard-won invariants — do not regress:
- **An idle overlay canvas must be invisible.** A WebGL buffer is not preserved between composites; an always-visible canvas whose rAF has stopped can flush garbage/white (the "logo disappears on nav-back" bug). HeroLogo keeps its canvas at `opacity: 0` except while the effect is live, and never uses `mix-blend-mode` over content.
- **`useDocumentHeight` measures `document.body.scrollHeight`, never `documentElement.scrollHeight`.** The document-anchored layers it sizes (DepthField/TraceWire) inflate the documentElement's scroll area themselves — measuring it created a ratchet that pinned every page to the tallest route visited (giant void below the footer).
- **The reduced-motion hook returns `true` on the SSR snapshot** and flips after hydration — effects keyed `[reduced]` run twice on a hard load, so the animate re-run must RESET anything the static run changed (a stale `display:none` here caused the first-load no-animation bug).

Must hold:
- **GSAP is lazy-loaded.** Never `import { gsap } from "gsap"` at module top — call `loadGsap()` (`src/components/motion/loadGsap.ts`) inside the effect, create everything inside `gsap.context(fn, ref)`, and `ctx.revert()` on cleanup. Never `ScrollTrigger.getAll().kill()`.
- Every animation has a `prefers-reduced-motion` branch that is **static/instant** (via `usePrefersReducedMotion()`).
- Sanctioned rAF loops: SectionField instances (self-pausing off-screen — in practice 1–2 run at once) and the HeroLogo hover loop (runs only while hovering/fading). No other bespoke rAF; scroll-linked motion goes through GSAP ScrollTrigger. SMIL is fine for small decorative SVGs gated by IntersectionObserver (CpuArchitecture).
- Scroll parallax uses cheap 2D transforms only (`yPercent`, `scale`) via `ParallaxLayers` — no 3D rotate/perspective, no ScrollTrigger `pin`. Pointer-follow parallax was REMOVED (users found it off-putting) — the HeroLogo masked cursor ripple is the only pointer-driven motion; do not reintroduce `--mx/--my`/`.depth-layer`.
- Colours from CSS tokens or `src/lib/design-tokens.ts` — never hard-coded hex. Timings from `src/lib/easing.ts` + its CSS mirrors. No glow/bloom/scanlines/glitch; never animate `filter`; prefer `box-shadow` over `filter: drop-shadow` on scrolling elements.
- Decorative layers are `aria-hidden`, `pointer-events: none`, behind content; document-height ones (DepthField grid/grain, TraceWire) size to `useDocumentHeight()` and stay `absolute`.
- These files hold only animation / markup / scoped CSS — no Sanity fetches, no copy, no business logic.
