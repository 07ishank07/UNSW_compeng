> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §6 — MAINTENANCE & CLEAN-CODE DIRECTIVES

The people maintaining this site are volunteer students who rotate yearly and did not write the original code. Optimise every line for the stranger who inherits it. The goal is that someone competent but unfamiliar can open any file and not get lost.

## 6.1 The comment law

**Comment the *why*, never the *what*.** Code already says what it does. Comments exist to explain intent, trade-offs, and traps.

- ❌ `// loop over events` — adds nothing.
- ✅ `// Status is derived from startDateTime at render, not stored, so a past event can never be mislabelled "upcoming" if an editor forgets to update a flag.`

**Every non-trivial file opens with a header comment** stating: its one responsibility, what it may and may not import (per §4.3), and which CLAUDE.md section governs it. Example:
```ts
/**
 * TraceSpine — the signature "copper bus" (CLAUDE.md §0.2.3, §A.2).
 * Responsibility: draw the scroll-bound SVG trace + signal pulse. Animation ONLY.
 * May import: gsap, @gsap/react, lib/easing, hooks/usePrefersReducedMotion.
 * MUST NOT import: Sanity data, content modules, or define shaders.
 */
```

**Mark fragile code loudly.** Anywhere a change will silently break something, leave a `// DO NOT` with the reason:
```ts
// DO NOT remove this useGSAP cleanup — without it, ScrollTriggers leak on every
// navigation and scroll becomes janky after a few page changes (§2.3 FAILURE).
```

**Cross-reference the two places that must change together.** The CSS tokens and their TS mirror are the classic trap:
```css
/* globals.css — @theme tokens. If you change a colour here, change lib/design-tokens.ts in the SAME commit (shaders can't read CSS vars). See CLAUDE.md §4.3. */
```
```ts
// design-tokens.ts — TS MIRROR of globals.css @theme colours, for the WebGL layer.
// These hex values MUST match globals.css. Changing one without the other splits the palette.
```

**TODO / FIXME discipline.** `// TODO(name, YYYY-MM): …` with an owner and date, or it never gets done. `// FIXME:` only for known bugs, with a one-line repro. Never leave a bare `// TODO`.

**Schema ↔ query ↔ type are a triangle.** A comment at the top of `queries.ts` and each schema file reminds the editor: changing a field name means updating the schema, every GROQ query that selects it, and the TS type. Prefer running `sanity typegen` / `next typegen` so a drift becomes a *compile error* rather than a silent blank on the live site (§2.4 FAILURE).

**Commit messages are documentation too.** Conventional prefixes (`feat:`, `fix:`, `perf:`, `refactor:`, `chore:`, `docs:`) + a body explaining *why* when it isn't obvious. The git log is the only narrative a future lead gets.

**Comment the shader maths.** GLSL is the least-readable code in the repo. Every block in the fragment shader gets a plain-English line: "this builds the floorplan grid," "this is the scrolling current," "this is the cursor heat." A maintainer should be able to tune a constant without reverse-engineering the noise.

## 6.2 Separation of concerns — the styling & code-organisation law

The rule is one concern per file, enforced *physically* by the folder structure (§4.3). Five kinds of code never mix:

1. **Data logic** — fetching, GROQ, shaping, validation. Lives in `src/sanity/**` and `src/lib/content.ts`. Server-only. No JSX. No animation. No colours.
2. **Markup / layout** — component structure and composition. Lives in `src/components/**`. A component receives typed data via props; it does not fetch. Keep components small; if one passes ~150 lines, it is probably doing two jobs — split it.
3. **Styling** — **Tailwind utility classes in the markup for layout/spacing/responsive**, and **design tokens in `globals.css` `@theme`** for the palette/type vocabulary. Rules:
   - Never hard-code a hex value or font name in a component. Reference a token utility (`text-silk`, `bg-substrate`, `border-solder`) generated from `@theme`.
   - Reach for a CSS Module (`*.module.css`) only for genuinely complex, stateful, or keyframe-driven styling that utilities express poorly; at the top of any such module add `@reference "../app/globals.css";` so it can see the theme (Tailwind v4 requirement).
   - No inline `style={{}}` except for *dynamic, computed* values that cannot be a class (e.g. a CSS variable set from scroll progress).
4. **Animation** — all GSAP/Lenis lives in `src/components/motion/**`. Animation files **hold no copy and fetch no data**; they animate DOM that markup components render, and they read motion vocabulary from `src/lib/easing.ts`. Every timeline is created inside `useGSAP()` (auto-cleanup) and has a `prefers-reduced-motion` branch.
5. **Shaders** — pure GLSL in `src/shaders/**` (or exported template strings). No JS logic, no React. Colours come in as **uniforms** sourced from `lib/design-tokens.ts`.

**Import-direction rules (one-way, to prevent tangle):**
- `canvas/` and `shaders/` may depend on `lib/` (tokens, easing) — **never** on `modules/`, `sanity/`, or page data. Data arrives as props.
- `modules/` may use `ui/` primitives and `motion/` wrappers — **never** the reverse (`ui/` and `motion/` know nothing about specific content modules).
- `ui/` is the lowest UI layer: depends only on `lib/`, `hooks/`, and tokens.
- Pages (`app/**`) are the *only* place that fetches (via `lib/content.ts`) and the *only* place that wires data into modules. Pages stay thin: fetch → pass props → compose. No business logic in a page body beyond that.

**Client/Server boundary discipline.** Default to Server Components. Add `'use client'` only to files that need interactivity/state/effs/WebGL (everything in `canvas/`, `motion/`, `cursor/`, and interactive bits of `modules/`/`ui/`). Keep `'use client'` as low in the tree as possible so the server-rendered, fast, SEO-friendly shell stays large. **Never** import a server-only module (anything importing `server-only`, or holding a token) into a client component — the build will (and should) fail.

**Naming.** Components `PascalCase.tsx`; hooks `useThing.ts`; pure utils `kebab-or-camel.ts`; GLSL `name.stage.glsl`. Files are named for the *concept the user recognises* (`SignalTimeline`, `PowerDeliveryNetwork`), not the mechanism — same principle as the copy in §0.2.7.

**The Chanel rule, in code.** Before opening a PR, remove one thing: a redundant animation, an over-clever abstraction, a colour that isn't a token, a component that's really two. Restraint is what separates this from a "vibecoded" site (§0.2.3). If an effect doesn't serve the fusion thesis (§0.3), it doesn't ship.

---

