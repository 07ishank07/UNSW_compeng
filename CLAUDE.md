# CompEngSoc — project memory

This file loads on every turn. Keep it lean. Deep reference material lives in `docs/*.md` (read on demand — see table below) and `.claude/rules/*.md` (auto-loads only when you touch matching paths).

## What this is

A masterpiece-grade site for UNSW's newly founded **Computer Engineering Society**. Thesis: software logic rendered as hardware — a copper "Trace" bus threads the page; the hero is the society's logic-gate mark rendered as layered, shaded 2D ("the Gate"). Content (events, sponsors, exec, academics, blog) is headless via **Sanity.io**, edited at `/studio`. **No custom auth/DB/booking.**

> **Visual-revision note (current direction):** the hero and site-wide depth are **layered 2D (CSS/SVG + transforms/blur/shadow)** — the WebGL/Three.js/R3F approach was removed. See `docs/design-language.md` §0.2.4 and `.claude/rules/motion-canvas.md`.

Stack: Next.js 16 (App Router, Turbopack default, `params`/`searchParams` are Promises — `await` them) · React 19 · Tailwind v4 (`@theme` in `globals.css`, no `tailwind.config.js`) · GSAP 3.13+ (free, incl. ScrollTrigger/DrawSVG/SplitText; **lazy-loaded via `components/motion/loadGsap.ts`, never eager**) · Lenis · `next-sanity`. The hero/depth system is **layered 2D (CSS/SVG)** — no WebGL/Three.js. Re-verify majors with `npm show <pkg> version` before assuming.

## Build order (do not skip ahead)

scaffold → design tokens (`globals.css`) → Sanity schemas/client/queries → pages wired to **mock data** (`NEXT_PUBLIC_USE_MOCKS=true`) → swap to live Sanity → GSAP/Lenis scroll system → layered-2D hero (the Gate + DepthField) → page transitions → a11y/perf pass.

The masterpiece layer (the depth layers, the Gate, the Trace) goes on **last**, over a site that already works without it.

## Non-negotiables

- **Mandatory CTA:** home hero "Learn more" button links to exactly `https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering` (new tab, `rel="noopener noreferrer"`).
- `prefers-reduced-motion` respected everywhere — every GSAP timeline and shader animation has a static/instant branch.
- Decorative canvas/SVG layers are `pointer-events: none` and never sit above a click target.
- No secrets in client bundles — only `NEXT_PUBLIC_*` is public. Write token and revalidate secret are server-only (`import "server-only"`).
- Restraint: the Trace + hero carry the artistry. Utility modules (events/sponsors/academics) stay calm and legible — don't animate every module.
- One concern per file: data logic / markup / Tailwind styling / GSAP animation never share a file (decorative leaf components may hold their own scoped `<style>`, as DepthField/HeroGate do). Folder = concern (`components/depth`, `components/motion`, `components/modules`, `components/ui`).

## Folder map

```
src/app/            routes (Server Components by default; 'use client' only where needed)
src/sanity/         schemas, client, queries, GROQ — never import into client components
src/components/depth/    layered-2D depth: DepthField, HeroGate, DecorLayer — 'use client', decorative, deferred via DecorLayer (ssr:false)
src/components/motion/   GSAP/Lenis only (GSAP lazy-loaded via loadGsap.ts) — no content, no data fetching
src/components/modules/  the data-shaped utility views (events, sponsors, academics...)
src/components/ui/       structural primitives — always real, accessible, interactive
src/lib/             framework-agnostic utils incl. design-tokens.ts (TS mirror of CSS @theme), easing.ts
src/data/mocks/      offline dev payloads, shape-matched to GROQ results
```

## Where to look for detail (read on demand, don't pre-load)

| Working on... | Read |
|---|---|
| Colours, type, the Trace/Substrate concept, copy/voice | `docs/design-language.md` |
| Route map, About copy, what each module should render | `docs/content-map.md` |
| "Is this done?" — perf/a11y/build acceptance criteria | `docs/checklists.md` |
| Sanity schemas, GROQ queries, roles | `docs/sanity-schema.md` (also auto-loaded as a rule, see below) |
| Full directory tree + per-file purpose | `docs/directory-guide.md` |
| Env vars, local runbook, Cloudflare (OpenNext) + DNS + handover | `docs/deployment.md` |
| Comment style, separation-of-concerns law | `docs/clean-code.md` |
| Complete shader/GSAP/R3F/webhook code to adapt | `docs/reference-implementations.md` |

## Workflow

- Plan Mode (`Shift+Tab` twice) before anything touching 3+ files or a schema. Review the file list before approving.
- `/clear` between unrelated phases (e.g. finish Sanity schemas → clear → start the GSAP scroll system). `/compact` mid-phase if context fills.
- Default model is fine for most of this build (see chat for the per-phase model plan). Use `/model opusplan` for the planning step on architecturally ambiguous phases (the hero shader, the Trace path geometry).
