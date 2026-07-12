"use client";
import { useEffect, useState } from "react";

/**
 * Tracks the page's CONTENT height (px) and keeps it current as the page
 * reflows — font swap, image load, route content change, viewport resize.
 *
 * Measures `document.body.scrollHeight`, NOT `documentElement.scrollHeight`:
 * the decorative layers this hook sizes (DepthField, TraceWire) are absolutely
 * positioned against the initial containing block, so they inflate the
 * documentElement's scroll area but not body's. Measuring the documentElement
 * created a RATCHET — the layers propped the document at the tallest page ever
 * visited, leaving a huge void below the footer on every shorter route
 * (live-measured: /events pinned at 4088px with content at 2430px). Body stays
 * at true content height, so the loop is structurally impossible now.
 *
 * Returns 0 until measured so callers can fall back to height:100% on first paint.
 */
export function useDocumentHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const measure = () => setHeight(document.body.scrollHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return height;
}
