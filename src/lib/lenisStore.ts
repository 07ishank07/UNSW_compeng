/**
 * lenisStore — exposes the single active Lenis instance created inside
 * SmoothScrollProvider so other modules (e.g. the mobile menu's scroll lock)
 * can drive it without spinning up a second instance.
 *
 * A framework-agnostic singleton holder. Only the
 * stop/start surface is typed, so importing this never pulls in Lenis's types
 * or runtime. Under reduced motion no instance is ever created, so consumers
 * must handle a null instance (e.g. fall back to a CSS scroll lock).
 */

export interface ScrollController {
  stop(): void;
  start(): void;
}

let _instance: ScrollController | null = null;

export const lenisStore = {
  get(): ScrollController | null {
    return _instance;
  },

  set(instance: ScrollController | null): void {
    _instance = instance;
  },
} as const;
