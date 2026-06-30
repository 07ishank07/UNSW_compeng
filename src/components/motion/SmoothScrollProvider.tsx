"use client";
import { useEffect, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { lenisStore } from "@/lib/lenisStore";
import { loadGsap } from "./loadGsap";

/**
 * Boots one Lenis instance and drives GSAP ScrollTrigger from it. Both Lenis and
 * GSAP are dynamically imported inside the effect (after hydration) so neither
 * sits in the eager first-load bundle. Disabled under reduced motion.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        loadGsap(),
      ]);
      if (cancelled) return;

      const lenis = new Lenis({ lerp: 0.15, wheelMultiplier: 1, smoothWheel: true, autoRaf: false });
      // Expose the live instance so consumers (e.g. the mobile menu scroll lock)
      // can stop/start it without creating a second instance.
      lenisStore.set(lenis);
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { lenis?: unknown }).lenis = lenis;
      }

      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // Recalculate scroll limit whenever the page grows (font-swap, image loads).
      const ro = new ResizeObserver(() => lenis.resize());
      ro.observe(document.documentElement);

      let active = true;
      const resize = () => {
        if (!active) return;
        lenis.resize();
        ScrollTrigger.refresh();
      };
      document.fonts.ready.then(resize);
      if (document.readyState === "complete") resize();
      else window.addEventListener("load", resize, { once: true });

      cleanup = () => {
        active = false;
        lenisStore.set(null);
        window.removeEventListener("load", resize);
        ro.disconnect();
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduced]);

  return <>{children}</>;
}
