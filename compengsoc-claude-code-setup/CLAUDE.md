# CompEngSoc — project memory

This file loads on every turn. Keep it lean. Deep reference material lives in `docs/*.md` (read on demand — see table below) and `.claude/rules/*.md` (auto-loads only when you touch matching paths).

## What this is

A masterpiece-grade site for UNSW's newly founded **Computer Engineering Society**. Thesis: software logic rendered as hardware — a copper "Trace" bus threads the page; the hero is a live WebGL silicon die ("the Substrate"). Content (events, sponsors, exec, academics, blog) is headless via **Sanity.io**, edited at `/studio`. **No custom auth/DB/booking.**

Stack: Next.js 16 (App Router, Turbopack default, `params`/`searchParams` are Promises — `await` them) · React 19 · Tailwind v4 (`@theme` in `globals.css`, no `tailwind.config.js`) · GSAP 3.13+ (free, incl. ScrollTrigger/DrawSVG/SplitText) + `@gsap/react` · Lenis · Three.js + R3F · `next-sanity`. Re-verify majors with `npm show <pkg> version` before assuming.

## Build order (do not skip ahead)

scaffold → design tokens (`globals.css`) → Sanity schemas/client/queries → pages wired to **mock data** (`NEXT_PUBLIC_USE_MOCKS=true`) → swap to live Sanity → GSAP/Lenis scroll system → R3F hero → page transitions → a11y/perf pass.

The masterpiece layer (canvas, shaders, Trace) goes on **last**, over a site that already works without it.

## Non-negotiables

- **Mandatory CTA:** home hero "Learn more" button links to exactly `https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering` (new tab, `rel="noopener noreferrer"`).
- **Logo:** `assets/circle.png` is the only society image. Copy it to `public/images/circle.png`. Use it in exactly five places (Nav 32 px, Footer 40 px, `/about` hero 80 px, favicon, OG image) — see `docs/design-language.md` §0.2.8 for the full placement spec and what is forbidden.
- `prefers-reduced-motion` respected everywhere — every GSAP timeline and shader animation has a static/instant branch.
- Decorative canvas/SVG layers are `pointer-events: none` and never sit above a click target.
- No secrets in client bundles — only `NEXT_PUBLIC_*` is public. Write token and revalidate secret are server-only (`import "server-only"`).
- Restraint: the Trace + hero carry the artistry. Utility modules (events/sponsors/academics) stay calm and legible — don't animate every module.
- One concern per file: data logic / markup / Tailwind styling / GSAP animation / GLSL shaders never share a file. Folder = concern (`components/canvas`, `components/motion`, `components/modules`, `components/ui`).

## Folder map

```
src/app/            routes (Server Components by default; 'use client' only where needed)
src/sanity/         schemas, client, queries, GROQ — never import into client components
src/components/canvas/   R3F + shaders, 'use client', lazy-loaded (ssr:false)
src/components/motion/   GSAP/Lenis only — no content, no data fetching
src/components/modules/  the data-shaped utility views (events, sponsors, academics...)
src/components/ui/       structural primitives — always real, accessible, interactive
src/shaders/         pure GLSL, no JS
src/lib/             framework-agnostic utils incl. design-tokens.ts (TS mirror of CSS @theme)
src/data/mocks/      offline dev payloads, shape-matched to GROQ results
```

## Where to look for detail (read on demand, don't pre-load)

| Working on... | Read |
|---|---|
| Colours, type, the Trace/Substrate concept, logo placement, copy/voice | `docs/design-language.md` |
| Route map, About copy, what each module should render | `docs/content-map.md` |
| "Is this done?" — perf/a11y/build acceptance criteria | `docs/checklists.md` |
| Sanity schemas, GROQ queries, roles | `docs/sanity-schema.md` (also auto-loaded as a rule, see below) |
| Full directory tree + per-file purpose | `docs/directory-guide.md` |
| Env vars, local runbook, Vercel + DNS + handover | `docs/deployment.md` |
| Comment style, separation-of-concerns law | `docs/clean-code.md` |
| Complete shader/GSAP/R3F/webhook code to adapt | `docs/reference-implementations.md` |

## Workflow

- Plan Mode (`Shift+Tab` twice) before anything touching 3+ files or a schema. Review the file list before approving.
- `/clear` between unrelated phases (e.g. finish Sanity schemas → clear → start the GSAP scroll system). `/compact` mid-phase if context fills.
- Default model is fine for most of this build (see chat for the per-phase model plan). Use `/model opusplan` for the planning step on architecturally ambiguous phases (the hero shader, the Trace path geometry).
