/**
 * fieldPool — bounds ACTIVE GPU programs across all on-page SectionFields to
 * MAX_LIVE via LRU. Eviction is SOFT: `release()` frees the evicted field's
 * program/buffers but keeps its (idle) WebGL context — a deliberately-lost
 * canvas can never getContext again, so hard eviction bricked fields (the
 * "hero pulse disappears on scroll-back" bug). Contexts themselves are freed
 * on unmount (navigation); per-page totals (≤8) sit well under browser caps.
 *
 * A SectionField `acquire()`s a slot when it first needs its program and
 * `touch()`es it while on-screen, so the LRU victim is always far off-screen —
 * it silently re-acquires + rebuilds (<5ms) on re-approach.
 */

export type FieldHandle = {
  /** Soft-release this field's GPU program (set by SectionField). */
  release: () => void;
  lastTouch: number;
};

const MAX_LIVE = 6; // home/team/academics peak at 6-7 stations; bounds program churn
const live = new Set<FieldHandle>();
let mounted = 0;

export const fieldPool = {
  /** Count a SectionField instance on the page (dev-only over-budget guard). */
  register(): void {
    mounted++;
    if (mounted > 8 && process.env.NODE_ENV !== "production") {
      console.warn(`fieldPool: ${mounted} SectionFields mounted — design smell (>8/page).`);
    }
  },
  unregister(): void {
    mounted = Math.max(0, mounted - 1);
  },

  /** Claim a live-context slot; evicts the LRU field if MAX_LIVE is reached. */
  acquire(h: FieldHandle): void {
    if (live.has(h)) {
      h.lastTouch = performance.now();
      return;
    }
    if (live.size >= MAX_LIVE) {
      let lru: FieldHandle | null = null;
      for (const x of live) if (!lru || x.lastTouch < lru.lastTouch) lru = x;
      if (lru) {
        live.delete(lru);
        lru.release();
      }
    }
    live.add(h);
    h.lastTouch = performance.now();
  },

  /** Mark this field as recently used (keeps on-screen fields from being evicted). */
  touch(h: FieldHandle): void {
    if (live.has(h)) h.lastTouch = performance.now();
  },

  /** Drop a slot (on the field's own teardown/unmount). */
  release(h: FieldHandle): void {
    live.delete(h);
  },
};
