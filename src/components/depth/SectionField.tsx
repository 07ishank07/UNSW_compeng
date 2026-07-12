"use client";
/**
 * SectionField — a per-section pixel-dither animation. Drops inside a
 * `relative isolate overflow-hidden` section as its `-z-20` layer; the section's
 * content sits above (usually on a `.scrim`). Each instance renders ONE shape
 * (from the shared ditherShader) in ONE accent colour — the "separated station"
 * model that replaced the Phase-1 global fixed field.
 *
 * PERF CONTRACT (this DELIBERATELY overrides the old "exactly ONE WebGL surface"
 * rule — see .claude/rules/motion-canvas.md, rewritten for this phase):
 *   - Fixed pixel cell (DOWNSCALE) → same ~3 CSS-px dither on every section.
 *   - Context created LAZILY on first approach (IntersectionObserver rootMargin),
 *     via fieldPool (LRU program-memory bound; eviction is SOFT — see below).
 *   - rAF runs ONLY while intersecting AND the tab is visible; off-screen = 0 cost.
 *   - Pool eviction frees the program/buffers but KEEPS the context (a lost
 *     canvas can never getContext again — hard-evicting the hero was the
 *     "pulse disappears on scroll-back" bug). Full teardown + loseContext()
 *     happens ONLY on unmount (navigation still frees every context).
 *   - reduced-motion / hardwareConcurrency<4 / Save-Data → NO WebGL at all: a
 *     static CSS tint of the accent colour is the section ground (robust + calm).
 *   - WebGL2 unavailable / context lost → the same static tint shows through.
 * aria-hidden, pointer-events-none, token colours only.
 */
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { tokens } from "@/lib/design-tokens";
import { fieldPool, type FieldHandle } from "@/lib/fieldPool";
import {
  VERT,
  FRAG,
  SHAPES,
  SIGNAL_SPEED,
  FOUR_PI,
  compileShader,
  hexToRgb01,
  type SignalShape,
  type RGB,
} from "./ditherShader";

const MOBILE_ANIMATE = true; // one line to revert to static-on-coarse if a device disappoints
const DOWNSCALE = 3; // desktop CSS-px per dither cell
const DOWNSCALE_COARSE = 4;
const PX_SIZE = 1;
const FPS = 30;
const FPS_COARSE = 24;
const MAX_AREA = 260_000; // backing-store fragment ceiling (only a >100svh section can hit it)
const MAX_DT = 0.1;

type Props = {
  shape: SignalShape;
  /** Accent colour (a design-token hex, e.g. tokens.accentGold). Never a literal. */
  front: string;
  back?: string;
  opacity?: number;
  speed?: number;
  /** Phase offset (0..4π) so adjacent stations never pulse in sync. */
  seed?: number;
  className?: string;
};

export function SectionField({
  shape,
  front,
  back = tokens.base,
  opacity = 0.8,
  speed = SIGNAL_SPEED,
  seed = 0,
  className = "",
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  // Live config the loop reads each frame (props are constant per section in
  // practice, but this keeps the GL effect off the prop deps).
  const cfg = useRef<{ back: RGB; front: RGB; shapeId: number; speed: number; seed: number }>({
    back: hexToRgb01(back),
    front: hexToRgb01(front),
    shapeId: SHAPES[shape],
    speed,
    seed,
  });
  useEffect(() => {
    cfg.current = {
      back: hexToRgb01(back),
      front: hexToRgb01(front),
      shapeId: SHAPES[shape],
      speed,
      seed,
    };
  }, [shape, front, back, speed, seed]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    // The reduced-motion hook reports TRUE on the SSR snapshot, then flips false
    // after hydration — so this effect runs twice on a hard load. Reset any state
    // a previous run left behind (the first-load "no animation until you navigate
    // away and back" bug was a stale display:none surviving the re-run).
    canvas.style.display = "block";

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const weak = (navigator.hardwareConcurrency ?? 8) < 4;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const saveData = conn?.saveData === true;
    const animate = !reduced && !weak && !saveData && (MOBILE_ANIMATE || !coarse);

    // Static tier: the CSS tint (rendered below) IS the section ground; no WebGL,
    // no context, no rAF. The canvas stays at its default opacity 0 — invisible
    // without touching `display` (a display:none here wedged the animate re-run).
    if (!animate) return;

    const fps = coarse ? FPS_COARSE : FPS;
    const frameGap = 1000 / fps;
    const downscale = coarse ? DOWNSCALE_COARSE : DOWNSCALE;

    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vs: WebGLShader | null = null;
    let fs: WebGLShader | null = null;
    let buf: WebGLBuffer | null = null;
    let u: Record<string, WebGLUniformLocation | null> = {};
    let hasContext = false;
    let webglFailed = false;
    let w = 0;
    let h = 0;
    let lastCw = 0;
    let lastCh = 0;
    let raf = 0;
    let lastPaint = 0;
    let phase = 0;
    let visible = !document.hidden;
    let intersecting = false;

    const resize = () => {
      if (!gl) return;
      const cw = canvas.clientWidth || wrapper.clientWidth || 1;
      const ch = canvas.clientHeight || wrapper.clientHeight || 1;
      lastCw = cw;
      lastCh = ch;
      let sw = Math.max(1, Math.ceil(cw / downscale));
      let sh = Math.max(1, Math.ceil(ch / downscale));
      if (sw * sh > MAX_AREA) {
        const k = Math.sqrt(MAX_AREA / (sw * sh));
        sw = Math.max(1, Math.round(sw * k));
        sh = Math.max(1, Math.round(sh * k));
      }
      w = sw;
      h = sh;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const paint = (timeVal: number) => {
      if (!gl) return;
      gl.uniform2f(u.res, w, h);
      gl.uniform1f(u.time, timeVal);
      gl.uniform1f(u.shape, cfg.current.shapeId);
      gl.uniform3fv(u.back, cfg.current.back);
      gl.uniform3fv(u.front, cfg.current.front);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      hasContext = false;
      canvas.style.opacity = "0"; // reveal the static tint fallback
    };
    // Browser-initiated loss recovers here (preventDefault above opts us in):
    // rebuild the program on the restored context and resume if on-screen.
    const onRestored = () => {
      if (build() && intersecting) {
        canvas.style.opacity = "1";
        startLoop();
      }
    };

    const build = (): boolean => {
      if (!gl) {
        gl = canvas.getContext("webgl2", {
          antialias: false,
          depth: false,
          stencil: false,
          alpha: false,
          powerPreference: "low-power",
        });
        if (!gl) return false; // genuine WebGL absence — tint ground stays
        canvas.addEventListener("webglcontextlost", onLost);
        canvas.addEventListener("webglcontextrestored", onRestored);
      }
      if (gl.isContextLost()) return false; // wait for webglcontextrestored
      vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
      fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram();
      if (!vs || !fs || !program) return false;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      u = {
        time: gl.getUniformLocation(program, "u_time"),
        res: gl.getUniformLocation(program, "u_resolution"),
        px: gl.getUniformLocation(program, "u_pxSize"),
        shape: gl.getUniformLocation(program, "u_shape"),
        back: gl.getUniformLocation(program, "u_colorBack"),
        front: gl.getUniformLocation(program, "u_colorFront"),
      };
      gl.useProgram(program);
      gl.uniform1f(u.px, PX_SIZE);
      hasContext = true;
      wrapper.dataset.live = "1";
      phase = cfg.current.seed;
      resize();
      paint(phase); // frame 0 immediately — revealing the canvas never flashes black
      return true;
    };

    // SOFT release (pool eviction): free program/buffer GPU memory but KEEP the
    // context. Calling loseContext here was the disappearing-hero bug: a canvas
    // whose context was deliberately lost can never produce a fresh one, so the
    // re-acquire on scroll-back failed permanently. Re-build on a kept context
    // is <5ms and invisible.
    const releaseGpu = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (gl) {
        if (program) gl.deleteProgram(program);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        if (buf) gl.deleteBuffer(buf);
      }
      program = vs = fs = buf = null;
      hasContext = false;
      delete wrapper.dataset.live;
      canvas.style.opacity = "0";
    };

    // FULL teardown (unmount only) — also surrender the context so rapid
    // navigation across sectioned pages never accumulates toward the browser cap.
    const teardown = () => {
      releaseGpu();
      if (gl) {
        canvas.removeEventListener("webglcontextlost", onLost);
        canvas.removeEventListener("webglcontextrestored", onRestored);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
      gl = null;
    };

    const handle: FieldHandle = { release: releaseGpu, lastTouch: 0 };

    const ensureContext = (): boolean => {
      if (hasContext) return true;
      if (webglFailed) return false;
      fieldPool.acquire(handle);
      if (build()) return true;
      releaseGpu();
      fieldPool.release(handle);
      // Permanent tint fallback ONLY when WebGL is genuinely absent; a lost
      // context recovers via onRestored instead.
      if (!gl) webglFailed = true;
      return false;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || !intersecting || !hasContext || now - lastPaint < frameGap) return;
      const dt = lastPaint === 0 ? 0 : Math.min(MAX_DT, (now - lastPaint) * 0.001);
      lastPaint = now;
      phase = (phase + dt * cfg.current.speed) % FOUR_PI;
      fieldPool.touch(handle);
      paint(phase);
    };
    const startLoop = () => {
      if (!raf) {
        lastPaint = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stopLoop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      (entries) => {
        intersecting = entries[0].isIntersecting;
        if (intersecting) {
          if (!ensureContext()) return; // webglFailed → tint shows
          fieldPool.touch(handle);
          canvas.style.opacity = "1";
          startLoop();
        } else {
          stopLoop();
        }
      },
      { rootMargin: "300px 0px", threshold: 0 },
    );

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible && intersecting && hasContext) startLoop();
      else if (!visible) stopLoop();
    };

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!hasContext) return;
        const cw = canvas.clientWidth;
        const ch = canvas.clientHeight;
        if (Math.abs(cw - lastCw) < 1 && Math.abs(ch - lastCh) < 80) return;
        resize();
      }, 200);
    };

    fieldPool.register();
    io.observe(wrapper);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      fieldPool.release(handle);
      fieldPool.unregister();
      teardown();
    };
  }, [reduced]);

  // Static tint = the accent as a faint pooled ground (the reduced-motion/weak
  // path, and the pre-paint / WebGL-loss fallback under the canvas). Token-sourced.
  const tint = `radial-gradient(120% 100% at 50% 40%, color-mix(in srgb, ${front} 30%, transparent), transparent 80%)`;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      data-field={shape}
      className={`pointer-events-none absolute inset-0 -z-20 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <div className="absolute inset-0" style={{ backgroundImage: tint }} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block", opacity: 0, imageRendering: "pixelated", transition: "opacity 200ms linear" }}
      />
    </div>
  );
}
