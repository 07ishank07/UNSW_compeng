export const DURATION = {
  fast: 0.4,
  base: 0.7,
  slow: 1.1,
  boot: 1.2,
} as const;

// CSS-compatible form — use for transitions that can't use GSAP.
export const ENERGIZE_BEZIER = "0.16, 1, 0.3, 1";

// SVG path fed to CustomEase.create("energize", …) in registerGsap.ts.
export const ENERGIZE_CUSTOM = "M0,0 C0.16,1 0.3,1 1,1";
