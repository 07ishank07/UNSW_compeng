> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §A — REFERENCE IMPLEMENTATIONS

> **⚠ Partly superseded (visual-revision pass).** The WebGL hero (§A.1 Substrate shader, §A.3 R3F `<Canvas>` wrapper) and the `registerGsap`/`useGSAP` pattern were **removed**. Current direction:
> - Hero + site-wide depth are **layered 2D (CSS/SVG)** — `src/components/depth/{HeroGate,DepthField,DecorLayer}.tsx`. No `three`/R3F/postprocessing.
> - GSAP is **lazy-loaded** via `src/components/motion/loadGsap.ts` (then `gsap.context(fn, ref)` + `ctx.revert()`), not eager `registerGsap` + `useGSAP`.
> - The Trace is `src/components/motion/TraceWire.tsx` (px-accurate, gutter-routed).
> The WebGL/GSAP-registration code below is kept for **history/reference only** — do not reintroduce it.

Complete, real code for the load-bearing pieces the sections above reference. No placeholders. Adapt names/paths to match §4, and re-verify any API against the installed versions (§0.1).

## §A.0 Motion vocabulary + GSAP registration

### `src/lib/easing.ts`
```ts
// The single motion vocabulary (CLAUDE.md §0.2.5). Import durations/eases from here;
// never scatter magic numbers across timelines.

export const DURATION = {
  fast: 0.4,
  base: 0.7,
  slow: 1.1,
  boot: 1.2, // hero boot sequence budget (§1.1)
} as const;

// "energize" easing as a cubic-bezier string (works for CSS transitions too).
// Fast attack, gentle overshoot/settle — like a capacitor charging and ringing.
export const ENERGIZE_BEZIER = "0.16, 1, 0.3, 1";

// The CustomEase definition string, registered once in registerGsap.ts.
export const ENERGIZE_CUSTOM = "M0,0 C0.16,1 0.3,1 1,1";
```

### `src/components/motion/registerGsap.ts`
```ts
// Registers GSAP plugins + the shared `energize` CustomEase exactly once.
// GSAP and all these plugins are free as of 2025-04-30 (CLAUDE.md §0.1) — verify at gsap.com.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { ENERGIZE_CUSTOM } from "@/lib/easing";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, CustomEase);
  if (!CustomEase.get("energize")) CustomEase.create("energize", ENERGIZE_CUSTOM);
  registered = true;
}
```

## §A.1 The Substrate shader (real GLSL)

> Lives as `src/shaders/substrate.vert.glsl` / `substrate.frag.glsl` (with a glsl loader) **or** as exported template strings in `src/shaders/substrate.ts` (most robust under Turbopack — no loader needed). Written in GLSL ES 1.00 for broad three.js `ShaderMaterial` compatibility (three injects `position`, `uv`, `projectionMatrix`, `modelViewMatrix`; do not redeclare them).

### `substrate.vert.glsl`
```glsl
// Vertex shader for the silicon-die plane (CLAUDE.md §0.2.4).
// Passes UVs to the fragment shader; geometry stays flat (the "depth" is shaded, not displaced).
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

### `substrate.frag.glsl`
```glsl
// Fragment shader: a procedural chip floorplan that reads as a powered silicon die.
// Layers (each block is commented so a maintainer can tune one without decoding the rest):
//   1. floorplan grid of logic blocks       2. thin copper trace lines on the grid
//   3. gold pads at some intersections       4. a scrolling "current" along the traces (signal colour)
//   5. a cursor "heat" that energizes the area under the probe
// Colours arrive as uniforms from lib/design-tokens.ts (shaders can't read CSS vars — §4.3).
precision highp float;

varying vec2 vUv;

uniform float uTime;        // seconds; frozen when reduced-motion is on
uniform vec2  uMouse;       // normalised pointer in UV space (0..1), smoothed on the JS side
uniform vec2  uResolution;  // device-pixel canvas size (for aspect correction)
uniform vec3  uSubstrate;   // background
uniform vec3  uCopper;      // traces
uniform vec3  uGold;        // pads
uniform vec3  uSignal;      // live current
uniform float uReduced;     // 1.0 if prefers-reduced-motion

// --- small hash + value noise + fbm (standard, cheap) ---
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i + vec2(0.0, 0.0));
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

void main() {
  // Aspect-correct UVs so the grid stays square on any viewport.
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vUv;
  uv.x *= aspect;

  // 1) FLOORPLAN GRID — partition the die into logic blocks of varied size.
  float scale = 14.0;
  vec2 g = uv * scale;
  vec2 cell = floor(g);
  vec2 cellUv = fract(g);
  float blockTone = 0.04 + 0.06 * hash21(cell); // subtle per-block brightness variation

  // 2) COPPER TRACE LINES — thin bright lines on the cell borders (a Manhattan routing grid).
  vec2 grid = abs(cellUv - 0.5);
  float line = smoothstep(0.49, 0.5, max(grid.x, grid.y));
  // thin out some lines pseudo-randomly so it reads as routing, not graph paper
  line *= step(0.35, hash21(cell + 7.1));

  // 3) GOLD PADS — small lit squares at a subset of intersections.
  float padMask = step(0.92, hash21(cell + 3.3));
  float pad = padMask * (1.0 - smoothstep(0.0, 0.16, length(cellUv - 0.5)));

  // 4) SCROLLING CURRENT — animated signal flowing along horizontal trace bands.
  float t = uTime * mix(0.0, 0.25, 1.0 - uReduced); // 0 speed under reduced motion
  float flow = fbm(vec2(uv.x * 3.0 - t, uv.y * 3.0));
  float current = smoothstep(0.62, 0.78, flow) * line; // current only shows on the traces

  // 5) CURSOR HEAT — energize the region under the probe.
  vec2 m = uMouse; m.x *= aspect;
  float d = distance(uv, m);
  float heat = smoothstep(0.45, 0.0, d); // 1 at cursor, fades to 0

  // --- COMPOSITE ---
  vec3 col = uSubstrate + blockTone;                 // base die
  col = mix(col, uCopper, line * 0.9);               // copper routing
  col = mix(col, uGold, pad);                        // gold pads
  col = mix(col, uSignal, current * (0.55 + 0.45 * heat)); // live current, brighter near cursor
  col = mix(col, uCopper, heat * line * 0.5);        // traces glow under the probe

  // gentle radial vignette so edges fall into the substrate
  float vig = smoothstep(1.25, 0.25, length(vUv - 0.5));
  col *= mix(0.82, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
```

## §A.2 The Trace spine (real GSAP DrawSVG + scroll pulse)

### `src/components/motion/TraceSpine.tsx`
```tsx
"use client";
/**
 * TraceSpine — the signature copper bus (CLAUDE.md §0.2.3).
 * Responsibility: draw an SVG trace bound to scroll + send a signal pulse down it. Animation ONLY.
 * May import: react, gsap, @gsap/react, motion/registerGsap, lib/easing, hooks/usePrefersReducedMotion.
 * MUST NOT import: Sanity data or content modules.
 */
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { registerGsap } from "./registerGsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function TraceSpine() {
  const root = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();
  registerGsap();

  useGSAP(
    () => {
      const trace = root.current!.querySelector<SVGPathElement>("#trace");
      const pulse = root.current!.querySelector<SVGPathElement>("#pulse");
      if (!trace || !pulse) return;

      if (reduced) {
        // Reduced motion: show the bus fully drawn, hide the moving pulse. No animation. (§2.3)
        gsap.set(trace, { drawSVG: "100%" });
        gsap.set(pulse, { autoAlpha: 0 });
        return;
      }

      // The trace draws in lockstep with page scroll.
      gsap.set(trace, { drawSVG: "0%" });
      gsap.to(trace, {
        drawSVG: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // smooth, tied to scroll progress
        },
      });

      // A short bright "signal" pulse travels along the trace as you scroll.
      gsap.fromTo(
        pulse,
        { drawSVG: "0% 4%" },
        {
          drawSVG: "96% 100%",
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );

      // DO NOT remove: refresh after layout settles so trace length is measured correctly.
      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [reduced] },
  );

  // The path geometry is illustrative — generate/author the real routed path to thread your sections.
  return (
    <svg
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      viewBox="0 0 100 1000"
      preserveAspectRatio="xMidYMin slice"
    >
      <defs>
        <filter id="signalGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* The copper bus. */}
      <path
        id="trace"
        d="M50,0 L50,120 Q50,140 70,140 L90,140 M50,120 L50,360 Q50,380 30,380 L12,380 M50,360 L50,640 M50,640 L50,1000"
        fill="none"
        stroke="var(--color-copper)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      {/* The travelling signal pulse (brighter, glowing). */}
      <path
        id="pulse"
        d="M50,0 L50,120 Q50,140 70,140 L90,140 M50,120 L50,360 Q50,380 30,380 L12,380 M50,360 L50,640 M50,640 L50,1000"
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth="0.9"
        strokeLinecap="round"
        filter="url(#signalGlow)"
      />
    </svg>
  );
}
```

## §A.3 The R3F canvas (real Scene, context-loss handling, poster fallback)

### `src/lib/webgl.ts`
```ts
// Cheap one-time WebGL availability probe so we can show a static poster instead of a blank canvas.
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}
```

### `src/components/canvas/HeroCanvas.tsx`
```tsx
"use client";
/**
 * HeroCanvas — default export the home page lazy-imports (next/dynamic, ssr:false) so `three`
 * never lands in the initial bundle (CLAUDE.md §2.1). Decides WebGL vs static poster fallback.
 */
import { useState } from "react";
import { Scene } from "./Scene";
import { isWebGLAvailable } from "@/lib/webgl";

export default function HeroCanvas() {
  // If WebGL is unavailable OR a context is lost at runtime, fall back to the poster. (§2.2)
  const [failed, setFailed] = useState(() => !isWebGLAvailable());

  if (failed) {
    return (
      <img
        src="/poster/substrate-poster.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  return <Scene onContextLost={() => setFailed(true)} />;
}
```

### `src/components/canvas/Scene.tsx`
```tsx
"use client";
/**
 * Scene — the <Canvas> wrapper. Caps DPR, adapts quality, preloads, and handles context loss.
 * Responsibility: 3D plumbing ONLY. May import three/R3F/drei, canvas/* children, lib/design-tokens.
 * MUST NOT import: Sanity data or content modules.
 */
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import { useEffect } from "react";
import { Substrate } from "./Substrate";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Attaches WebGL context-loss listeners and notifies the parent to swap to the poster. (§2.2)
function ContextLoss({ onLost }: { onLost: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault(); // allow a restore attempt instead of a hard crash
      onLost();
    };
    el.addEventListener("webglcontextlost", lost as EventListener, false);
    return () => el.removeEventListener("webglcontextlost", lost as EventListener);
  }, [gl, onLost]);
  return null;
}

export function Scene({ onContextLost }: { onContextLost: () => void }) {
  const reduced = usePrefersReducedMotion();
  return (
    <Canvas
      className="absolute inset-0"
      // Cap DPR so a 3x/4x retina display can't tank FPS (§2.2 FAILURE).
      dpr={[1, 2]}
      // Static under reduced motion (render on demand); otherwise animate continuously.
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1], fov: 50 }}
    >
      <ContextLoss onLost={onContextLost} />
      <Substrate />
      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  );
}
```

### `src/components/canvas/Substrate.tsx`
```tsx
"use client";
/**
 * Substrate — the silicon-die mesh + ShaderMaterial (CLAUDE.md §0.2.4, §A.1).
 * Declarative: geometry + material. Uniform updates live in useShaderUniforms.
 */
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { useShaderUniforms } from "./useShaderUniforms";
import vertexShader from "@/shaders/substrate.vert.glsl";
import fragmentShader from "@/shaders/substrate.frag.glsl";

export function Substrate() {
  const { viewport } = useThree(); // world units that exactly fill the frustum at z=0
  const { uniforms, setPointerUv } = useShaderUniforms();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      }),
    [uniforms],
  );

  return (
    <mesh
      scale={[viewport.width, viewport.height, 1]}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (e.uv) setPointerUv(e.uv.x, e.uv.y); // feed the cursor "heat" uniform
      }}
    >
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
```

### `src/components/canvas/useShaderUniforms.ts`
```ts
"use client";
/**
 * Owns the shader uniforms + their per-frame updates (time, smoothed pointer, resolution).
 * Keeps Substrate.tsx declarative (CLAUDE.md §4.3).
 */
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { tokens } from "@/lib/design-tokens";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function useShaderUniforms() {
  const reduced = usePrefersReducedMotion();
  const { size, gl } = useThree();
  const target = useRef(new THREE.Vector2(0.5, 0.5)); // raw pointer target
  const smooth = useRef(new THREE.Vector2(0.5, 0.5)); // eased pointer actually sent to the shader

  // Create uniforms once; mutate .value in useFrame (never recreate the object).
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uSubstrate: { value: new THREE.Color(tokens.substrate) },
      uCopper: { value: new THREE.Color(tokens.copper) },
      uGold: { value: new THREE.Color(tokens.gold) },
      uSignal: { value: new THREE.Color(tokens.signal) },
      uReduced: { value: reduced ? 1 : 0 },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps -- intentional: create once
  );

  uniforms.uReduced.value = reduced ? 1 : 0;

  useFrame((_, delta) => {
    if (!reduced) uniforms.uTime.value += delta; // freeze time under reduced motion
    smooth.current.lerp(target.current, 0.08); // smooth the probe so the heat glides
    uniforms.uMouse.value.copy(smooth.current);
    const dpr = gl.getPixelRatio();
    uniforms.uResolution.value.set(size.width * dpr, size.height * dpr);
  });

  return {
    uniforms,
    setPointerUv: (x: number, y: number) => target.current.set(x, y),
  };
}
```

### `src/lib/design-tokens.ts`
```ts
// TS MIRROR of the @theme colours in globals.css (CLAUDE.md §0.2.1, §4.3).
// Shaders/canvas cannot read CSS vars, so these hex values must match globals.css EXACTLY.
// If you change a colour here, change globals.css in the same commit.
export const tokens = {
  substrate: "#0A0B0F",
  copper: "#C77B45",
  copperBright: "#E8A877",
  gold: "#D9B36A",
  signal: "#86E0D8",
  solder: "#103A33",
  silk: "#ECECE4",
  ghost: "#8A8D98",
} as const;
```

> **glsl import note:** the `import … from "@/shaders/*.glsl"` form needs a loader. Under Turbopack/Next, the most robust path is to instead store the GLSL as exported template strings in `src/shaders/substrate.ts` (`export const fragmentShader = \`…\`;`) and import those — no loader, no build surprise. Either is fine; pick one and keep it consistent.

## §A.4 The revalidation webhook route (real, signature-verified)

### `src/app/api/revalidate/route.ts`
```ts
import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { type NextRequest, NextResponse } from "next/server";

// Sanity calls this on publish/delete. We verify the signature, then revalidate ONLY the
// affected content tag/path so the live site updates in seconds without a redeploy (§2.4).
// SANITY_REVALIDATE_SECRET is server-only and must match the webhook secret in sanity.io/manage.

const secret = process.env.SANITY_REVALIDATE_SECRET;

type WebhookBody = { _type?: string; slug?: string };

export async function POST(req: NextRequest) {
  try {
    if (!secret) {
      return NextResponse.json({ message: "Missing server secret" }, { status: 500 });
    }

    const signature = req.headers.get(SIGNATURE_HEADER_NAME);
    const body = await req.text(); // raw body required for signature verification

    if (!signature || !(await isValidSignature(body, signature, secret))) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body) as WebhookBody;
    const type = payload._type;
    if (!type) {
      return NextResponse.json({ message: "Bad payload" }, { status: 400 });
    }

    // Revalidate the tag the fetch wrapper attached for this content type (§3.1).
    revalidateTag(type);

    // Also revalidate the specific detail path for slug-addressable types.
    if (payload.slug) {
      if (type === "post") revalidatePath(`/blog/${payload.slug}`);
      if (type === "event") revalidatePath(`/events/${payload.slug}`);
    }
    // And the listing pages most affected.
    const listPath: Record<string, string> = {
      event: "/events",
      sponsor: "/sponsors",
      execMember: "/team",
      post: "/blog",
      academicResource: "/academics",
      siteSettings: "/",
    };
    if (listPath[type]) revalidatePath(listPath[type]);

    return NextResponse.json({ revalidated: true, type, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: "Revalidation error", error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
```
> **Next 16 note:** if you adopt Cache Components / `cacheLife` profiles, `revalidateTag` may take a second profile argument and `updateTag()` may be preferred — confirm the signature against your installed Next 16 minor and adjust. The `revalidatePath` calls above are stable regardless.

## §A.5 Smooth scroll provider + a mock (real, complete)

### `src/components/motion/SmoothScrollProvider.tsx`
```tsx
"use client";
/**
 * SmoothScrollProvider — boots ONE Lenis instance and drives GSAP ScrollTrigger from it (§2.3).
 * Wrap the app once (in app/layout.tsx). Respects reduced motion (no smoothing, native scroll).
 */
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsap } from "./registerGsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  registerGsap();

  useEffect(() => {
    if (reduced) return; // native scrolling under reduced motion; do not smooth (§2.3)

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    // Keep ScrollTrigger in sync with Lenis, and drive Lenis from GSAP's ticker (single RAF).
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // DO NOT remove this teardown — without it, Lenis + the ticker leak across navigations (§2.3 FAILURE).
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
```

### `src/hooks/usePrefersReducedMotion.ts`
```ts
"use client";
// Every animation reads this before running (CLAUDE.md §0.2). SSR-safe default: reduced = true
// until proven otherwise, so the first paint never animates unexpectedly.
import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
```

### `src/data/mocks/events.mock.ts` (shape matches `upcomingEventsQuery`, §3.7)
```ts
// Static payload for offline/canvas dev (§5.3). Shape MUST match the GROQ selection so a
// drift is a compile error against types/sanity.ts. Dates are spread around "now" on purpose.
import type { EventCard } from "@/types/sanity";

const now = Date.now();
const days = (n: number) => new Date(now + n * 86_400_000).toISOString();

export const events: EventCard[] = [
  {
    _id: "mock-cruise",
    title: "Vivid Harbour Cruise",
    slug: "vivid-harbour-cruise",
    eventType: "cruise",
    startDateTime: days(21),
    endDateTime: days(21),
    location: "Darling Harbour",
    shortDescription: "Our flagship social: the harbour lit up for Vivid, the whole society on deck.",
    ticketUrl: "https://example.com/tickets/vivid",
    image: null,
  },
  {
    _id: "mock-camp",
    title: "First-Year Camp",
    slug: "first-year-camp",
    eventType: "camp",
    startDateTime: days(40),
    endDateTime: days(42),
    location: "South Coast",
    shortDescription: "Two nights away to meet your cohort before semester ramps up.",
    ticketUrl: null,
    image: null,
  },
  {
    _id: "mock-fpga",
    title: "Intro to FPGAs: Zero to Bitstream",
    slug: "intro-to-fpga",
    eventType: "workshop",
    startDateTime: days(-7), // a past event, to exercise the de-energized state
    endDateTime: days(-7),
    location: "Electrical Engineering Building",
    shortDescription: "Hands-on Verilog to a running bitstream in one session.",
    ticketUrl: null,
    image: null,
  },
];
```

### `src/types/sanity.ts` (the matching type — keep in sync, or generate with typegen)
```ts
// Hand-written boundary types. Prefer `sanity typegen` / `next typegen` to generate these
// from the schema + GROQ so a query/schema drift fails at compile time (§2.4, §6.1).
import type { Image } from "sanity";

export type EventType = "cruise" | "camp" | "workshop" | "networking" | "social" | "hackathon";

export interface EventCard {
  _id: string;
  title: string;
  slug: string;
  eventType: EventType;
  startDateTime: string; // ISO
  endDateTime: string | null;
  location: string | null;
  shortDescription: string | null;
  ticketUrl: string | null;
  image: Image | null;
}
```

---

## END OF PLAYBOOK

Build order recap (from §0.1): **scaffold → tokens → Sanity schemas/client/queries → pages on mock data → swap to live Sanity → scroll system → hero canvas → transitions → a11y/perf pass.** The masterpiece layer goes on last, over a site that already works without it. When in doubt, satisfy the *goal* in §2, honour the separation law in §6, and cut anything that doesn't serve the fusion thesis in §0.3.

---

## Addendum — hosting on Cloudflare Workers (OpenNext)

The `/api/revalidate/route.ts` code above (signature verification → `revalidateTag`/`revalidatePath`) is unchanged on Cloudflare — that's ordinary Next.js application code. What changes is the infrastructure those calls write to: on Vercel this just works; on Cloudflare Workers via `@opennextjs/cloudflare`, `revalidateTag` needs an R2-backed incremental cache plus a Durable Object-backed tag cache configured in `open-next.config.ts` and `wrangler.jsonc`. See `docs/deployment.md` §5.2 and §5.5 for the exact config and for the simpler time-based-only alternative that avoids this setup entirely.
