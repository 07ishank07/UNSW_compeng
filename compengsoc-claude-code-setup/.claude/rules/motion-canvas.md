---
paths:
  - "src/components/canvas/**"
  - "src/components/motion/**"
  - "src/shaders/**"
  - "src/components/cursor/**"
---

# Working in canvas / motion / shaders

Complete, adapt-ready code for the shader, the Trace, the R3F Scene wrapper, and the revalidate route is in `docs/reference-implementations.md` — read it before writing new canvas/motion code so you match the established patterns (uniform naming, cleanup pattern, reduced-motion branch) instead of inventing a new one.

Must hold:
- Every GSAP timeline is created inside `useGSAP()` (scope to a container ref) so it reverts on unmount. Bare `gsap.to`/`ScrollTrigger.create` outside that hook is a leak.
- Every animation/shader has a `prefers-reduced-motion` branch that is static or instant, not just "slower."
- `<Canvas>` caps `dpr={[1, 2]}`; never leave DPR uncapped.
- Handle `webglcontextlost` (preventDefault + fallback to the static poster) — a black canvas on context loss is a bug, not an edge case.
- Colours in shaders/canvas come from `src/lib/design-tokens.ts` (the TS mirror of the CSS `@theme` tokens) — never a hard-coded hex in a shader or `useMemo`. If you change a token, change it in both files in the same edit.
- `logoPurple` and `logoYellow` exist in `design-tokens.ts` for completeness but are **never passed as shader uniforms** — the logo lives in the HTML layer, not the WebGL layer. Do not add them to `useShaderUniforms`.
- These files hold **only** animation/3D/shader logic — no Sanity fetches, no copy strings, no business logic. Data arrives as props.
