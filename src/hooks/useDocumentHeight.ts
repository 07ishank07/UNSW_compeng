"use client";
import { useEffect, useState } from "react";

/**
 * Tracks document.documentElement.scrollHeight (px) and keeps it current as the
 * page reflows — font swap, image load, route content change, viewport resize.
 *
 * Decorative full-page layers (DepthField, TraceWire) size their container from
 * this so they span the *actual* document height, never the viewport. Returns 0
 * until measured so callers can fall back to height:100% on first paint.
 */
export function useDocumentHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const measure = () => setHeight(document.documentElement.scrollHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return height;
}
