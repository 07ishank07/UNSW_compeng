/**
 * scrollSignal — tiny framework-agnostic external store for scroll progress.
 *
 * page  = full-document progress  0..1 (published by TraceSpine's ScrollTrigger)
 * hero  = first-viewport progress 0..1 (how far the user has scrolled past the hero)
 *
 * The canvas reads this inside useFrame (plain import, not GSAP).
 * TraceSpine writes it from its onUpdate callback.
 * SmoothScrollProvider is untouched.
 */

export interface ScrollState {
  page: number;
  hero: number;
}

let _state: ScrollState = { page: 0, hero: 0 };
const _listeners = new Set<(s: ScrollState) => void>();

export const scrollSignal = {
  get(): ScrollState {
    return _state;
  },

  set(next: Partial<ScrollState>): void {
    _state = { ..._state, ...next };
    _listeners.forEach((fn) => fn(_state));
  },

  subscribe(fn: (s: ScrollState) => void): () => void {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
} as const;
