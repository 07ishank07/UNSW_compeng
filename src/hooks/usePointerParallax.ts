"use client";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Drives the global `--mx` / `--my` pointer channel (normalised −1..1) that the
 * layered-2D depth system parallaxes against. Mounted once, app-wide.
 *
 * Performance contract (docs/checklists.md §2.2 — the layered-2D criteria):
 *   - rAF-throttled: at most ONE CSS-var write per frame, never per raw event.
 *   - Disabled entirely on coarse pointers (touch — parallax is meaningless) and
 *     under prefers-reduced-motion.
 *   - Cheap capability gate: navigator.hardwareConcurrency < 4 → `data-perf=lite`
 *     and stay static (weak devices get the shaded-but-still composition).
 *   - No idle loop: the rAF is scheduled only on movement and cancelled when the
 *     tab is hidden, so nothing runs off-screen / in a background tab.
 */
export function usePointerParallax(): void {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    const neutralise = () => {
      root.style.setProperty("--mx", "0");
      root.style.setProperty("--my", "0");
    };

    if (reduced) {
      neutralise();
      return;
    }

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const weak = (navigator.hardwareConcurrency ?? 8) < 4;
    if (coarse || weak) {
      if (weak) root.dataset.perf = "lite";
      neutralise();
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let raf = 0;
    let pending = false;
    let visible = !document.hidden;

    const write = () => {
      raf = 0;
      pending = false;
      root.style.setProperty("--mx", targetX.toFixed(4));
      root.style.setProperty("--my", targetY.toFixed(4));
    };

    const schedule = () => {
      if (pending || !visible) return;
      pending = true;
      raf = requestAnimationFrame(write);
    };

    const onMove = (e: PointerEvent) => {
      // Normalise to −1..1 around the viewport centre.
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };

    const onVisibility = () => {
      visible = !document.hidden;
      if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        pending = false;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);
}
