"use client";
/**
 * DecorLayer — defers the always-on decorative layers (DepthField + the DrawSVG
 * TraceWire) into a client-only chunk (ssr:false), per docs/checklists.md §2.1:
 * heavy decorative code is dynamically imported and never blocks first paint.
 *
 * Both are purely decorative, measure the document only after mount, and render
 * nothing meaningful before hydration — so loading them after the critical path
 * keeps GSAP DrawSVG + the depth system out of the initial parse and lowers TBT.
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
