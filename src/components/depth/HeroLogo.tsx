"use client";
/**
 * HeroLogo — the large centred CompEng mark in a THICK CIRCULAR BLACK FRAME,
 * with a cursor-local pixel effect: ONE overlay canvas spans the frame and is
 * CSS-masked to (logo silhouette + ring annulus), so on hover a 1-bit-dithered
 * gold ripple appears in the mark AND lights the ring ONLY around the cursor —
 * the rest of the ring stays black. No tilt, no mouse-follow, no idle animation.
 *
 * VISIBILITY CONTRACT (the "logo disappears on nav-back" fix): the canvas is
 * `opacity: 0` whenever the effect is inactive and is revealed only AFTER the
 * hover loop has painted a frame. A WebGL2 buffer is not preserved between
 * composites (`preserveDrawingBuffer: false`); with the old always-visible
 * screen-blended canvas, a compositor event after the rAF halted could flush
 * garbage/white masked exactly to the mark. An invisible canvas cannot — and
 * plain per-pixel alpha replaced mix-blend-mode entirely. The mark itself is a
 * plain <img> (static asset; nothing to fail on client nav).
 *
 * Perf mirrors SectionField: one context, fps-capped, loop runs only while
 * hovering/fading, paused on tab-hide, teardown + loseContext on unmount.
 * Reduced-motion / coarse pointer / weak CPU → no canvas, just the framed mark.
 */
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { tokens } from "@/lib/design-tokens";
import { compileShader, hexToRgb01 } from "./ditherShader";

const LOGO_SRC = "/brand/logo.png";
const RING = 14; // frame ring thickness (px) — the black circle's visible band
const PX_SIZE = 3;
const DOWNSCALE = 3;
const FPS = 30;

const VERT = `#version 300 es
precision mediump float;
layout(location = 0) in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision mediump float;
uniform vec2  u_resolution;
uniform float u_time;
uniform float u_pxSize;
uniform vec2  u_mouse;   // 0..1, origin bottom-left
uniform float u_active;  // 0..1 hover strength
uniform vec3  u_color;
out vec4 fragColor;
const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);
float bayer(vec2 uv) { ivec2 p = ivec2(mod(uv, 8.0)); return float(bayer8x8[p.y * 8 + p.x]) / 64.0; }
void main() {
  vec2 px = floor(gl_FragCoord.xy / u_pxSize) * u_pxSize;
  vec2 uv = px / u_resolution.xy;
  vec2 d = uv - u_mouse;
  d.x *= u_resolution.x / u_resolution.y; // keep the ripple circular
  float dist = length(d);
  float ripple = sin(dist * 46.0 - u_time * 5.0) * 0.5 + 0.5;
  float reach = smoothstep(0.34, 0.0, dist) * u_active; // bright at the cursor, dies out fast
  float dither = bayer(gl_FragCoord.xy / u_pxSize) - 0.5;
  float res = step(0.5, ripple * reach + dither);
  fragColor = vec4(u_color, res * reach); // plain alpha; transparent away from the cursor
}`;

export function HeroLogo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    // The reduced-motion hook reports TRUE on the SSR snapshot then flips false
    // after hydration, re-running this effect — restore anything the first run
    // hid so the animate pass isn't wedged behind a stale display:none.
    canvas.style.display = "block";

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const weak = (navigator.hardwareConcurrency ?? 8) < 4;
    if (reduced || coarse || weak) {
      canvas.style.display = "none"; // static framed mark only
      return;
    }

    // LAZY GL — the context is created on FIRST HOVER, never at mount. Any
    // mount→cleanup→remount cycle (React dev double-invoke, client-nav return)
    // would otherwise loseContext() a canvas the very next run tries to reuse,
    // and the effect silently died until a hard refresh (the "cursor animation
    // disappears after nav-back" bug). With nothing created at mount, remounts
    // are inert; the first hover builds on the current fresh canvas in <5ms.
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vs: WebGLShader | null = null;
    let fs: WebGLShader | null = null;
    let buf: WebGLBuffer | null = null;
    let u: Record<string, WebGLUniformLocation | null> = {};
    let glFailed = false;
    let w = 0;
    let h = 0;

    const resize = () => {
      if (!gl) return;
      const cw = canvas.clientWidth || 1;
      const ch = canvas.clientHeight || 1;
      w = Math.max(1, Math.round(cw / DOWNSCALE));
      h = Math.max(1, Math.round(ch / DOWNSCALE));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const ensureGl = (): boolean => {
      if (gl) return !gl.isContextLost();
      if (glFailed) return false;
      gl = canvas.getContext("webgl2", {
        antialias: false,
        depth: false,
        stencil: false,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: "low-power",
      });
      if (!gl) {
        glFailed = true;
        canvas.style.display = "none";
        return false;
      }
      vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
      fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram();
      if (!vs || !fs || !program) {
        glFailed = true;
        return false;
      }
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        glFailed = true;
        return false;
      }
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      u = {
        res: gl.getUniformLocation(program, "u_resolution"),
        time: gl.getUniformLocation(program, "u_time"),
        px: gl.getUniformLocation(program, "u_pxSize"),
        mouse: gl.getUniformLocation(program, "u_mouse"),
        active: gl.getUniformLocation(program, "u_active"),
        color: gl.getUniformLocation(program, "u_color"),
      };
      gl.useProgram(program);
      gl.uniform1f(u.px, PX_SIZE);
      gl.uniform3fv(u.color, hexToRgb01(tokens.accentGold));
      resize();
      return true;
    };

    const mouse = { x: 0.5, y: 0.5 };
    let hovering = false;
    let active = 0;
    const start = performance.now();
    let raf = 0;
    let last = 0;
    const frameGap = 1000 / FPS;
    let visible = !document.hidden;

    const paint = (t: number) => {
      if (!gl) return;
      gl.uniform2f(u.res, w, h);
      gl.uniform1f(u.time, t);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.active, active);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < frameGap) return;
      last = now;
      active += ((hovering ? 1 : 0) - active) * 0.14;
      if (!hovering && active < 0.01) {
        // Fully faded: paint one final transparent frame, then HIDE the canvas
        // (the nav-back garbage-composite fix) and stop the loop.
        active = 0;
        paint((now - start) * 0.001);
        canvas.style.opacity = "0";
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      paint((now - start) * 0.001);
    };
    const startLoop = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height; // flip to GL bottom-left origin
    };
    const onEnter = (e: PointerEvent) => {
      hovering = true;
      onMove(e);
      if (!ensureGl()) return; // first hover builds the context
      // Reveal ONLY after a freshly painted frame exists in the buffer.
      paint((performance.now() - start) * 0.001);
      canvas.style.opacity = "1";
      startLoop();
    };
    const onLeave = () => {
      hovering = false;
      startLoop(); // keep looping to fade the effect out, then it self-hides
    };
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible && (hovering || active > 0)) startLoop();
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      if (gl) {
        if (program) gl.deleteProgram(program);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        if (buf) gl.deleteBuffer(buf);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, [reduced]);

  // Two mask layers (default composite = ADD): the mark's silhouette inset by
  // the ring, plus the ring annulus itself — the cursor effect can only ever
  // show inside the logo or on the frame band.
  const maskImage = `url(${LOGO_SRC}), radial-gradient(closest-side, transparent calc(100% - ${RING + 1}px), #fff calc(100% - ${RING}px))`;
  const maskSize = `calc(100% - ${RING * 2}px) calc(100% - ${RING * 2}px), 100% 100%`;

  return (
    /* The thick circular black frame — also the hover zone for the effect. */
    <div
      ref={wrapRef}
      className="group relative mx-auto w-fit rounded-full bg-base-deep shadow-panel"
      style={{ padding: `${RING}px` }}
    >
      <div className="relative aspect-square w-[min(42vmin,380px)] overflow-hidden rounded-full">
        {/* Plain <img> on purpose — a static asset the client router can't break. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_SRC}
          alt="CompEngSoc"
          draggable={false}
          className="h-full w-full object-contain"
        />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full rounded-full"
        style={{
          opacity: 0, // revealed only while the cursor effect is live
          imageRendering: "pixelated",
          transition: "opacity 150ms linear",
          WebkitMaskImage: maskImage,
          maskImage,
          WebkitMaskSize: maskSize,
          maskSize,
          WebkitMaskRepeat: "no-repeat, no-repeat",
          maskRepeat: "no-repeat, no-repeat",
          WebkitMaskPosition: "center, center",
          maskPosition: "center, center",
        }}
      />
    </div>
  );
}
