"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/**
 * SSR-safe via useSyncExternalStore: the server snapshot is `true` (reduced), so
 * the first paint never animates unexpectedly; the client reconciles to the real
 * preference after hydration. Subscribes to the matchMedia change event — no
 * setState-in-effect.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}
