"use client";
/**
 * DecorLayer — the always-on, page-wide decorative layers (deferred ssr:false).
 * After the Phase-2 "sectioned stations" refactor the animated field is NO LONGER
 * global — each Section owns its own SectionField. What remains here is the CALM
 * shell texture the stations sit between:
 *   DepthField -z-10  blueprint grid + grain (static, document-anchored, cheap)
 *   TraceWire  -z-10  the copper bus spine — visually carries the signal between
 *                     stations
 * Both are decorative, measure the document only after mount, and render nothing
 * before hydration, so loading them after the critical path keeps first paint lean.
 */
import dynamic from "next/dynamic";

const DepthField = dynamic(() => import("./DepthField").then((m) => m.DepthField), { ssr: false });
const TraceWire = dynamic(() => import("@/components/motion/TraceWire").then((m) => m.TraceWire), { ssr: false });

export function DecorLayer() {
  return (
    <>
      <DepthField />
      <TraceWire />
    </>
  );
}
