"use client";
/**
 * loadGsap — lazily import GSAP core + the plugins we use, register them once,
 * and resolve to the handful of objects callers need. Memoised so the dynamic
 * import + registration happen a single time across the whole app.
 *
 * Why: GSAP + ScrollTrigger + DrawSVG + SplitText + ScrambleText is ~75 KB gzip.
 * Importing it statically put it in the eager first-load bundle on every route.
 * Loading it here, inside motion components' effects (after hydration), keeps it
 * off the critical path so initial route JS stays lean (docs/checklists.md §2.1)
 * while all content remains server-rendered.
 *
 * Eases are GSAP's built-in "power2.out"/"power3.out" (docs/design-language.md
 * §0.2.5) — no CustomEase plugin needed.
 */

interface GsapBundle {
  gsap: (typeof import("gsap"))["gsap"];
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
  SplitText: (typeof import("gsap/SplitText"))["SplitText"];
}

let bundle: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (!bundle) {
    bundle = (async () => {
      const [core, st, draw, split, scramble] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/DrawSVGPlugin"),
        import("gsap/SplitText"),
        import("gsap/ScrambleTextPlugin"),
      ]);
      core.gsap.registerPlugin(
        st.ScrollTrigger,
        draw.DrawSVGPlugin,
        split.SplitText,
        scramble.ScrambleTextPlugin,
      );
      return { gsap: core.gsap, ScrollTrigger: st.ScrollTrigger, SplitText: split.SplitText };
    })();
  }
  return bundle;
}
