/**
 * ditherShader — the ONE shared GLSL for every SIGNAL pixel field. Extracted from
 * the Phase-1 DitherField so the shader lives once and every per-section
 * SectionField compiles the same program (different shape/colour via uniforms).
 *
 * Seven shapes (matches docs/21stdev.md:702-710), all 1-bit ordered-dithered
 * (bayer 8×8) between two brand colours. Centre-origin, WIDTH-normalised UV so
 * every shape stays circular/undistorted at any section aspect. mediump.
 *
 * 4π PHASE-WRAP CONTRACT: u_time is a CPU-side accumulator wrapped at 4π (so
 * t = 0.5·u_time wraps at 2π). Every time coefficient below is an integer
 * multiple of t and every shape is periodic in t, so the animation is pop-free
 * at the wrap even after hours (mediump sin degrades otherwise). The 21stdev
 * originals for simplex/dots/sphere are NOT periodic — they're re-derived here
 * (orbital simplex drift, integer-quantised dot clocks, integer sphere light
 * orbit). Scale factors (*1.6/*1.2/*6.0/*1.15) are density calibration knobs.
 */

export const SHAPES = {
  simplex: 1,
  warp: 2,
  dots: 3,
  wave: 4,
  ripple: 5,
  swirl: 6,
  sphere: 7,
} as const;
export type SignalShape = keyof typeof SHAPES;

/** Slow, hypnotic base pace shared by every shape (SIGNAL brief §3.2). */
export const SIGNAL_SPEED = 0.18;
/** u_time wraps here; every GLSL time term is a multiple of t = 0.5·u_time. */
export const FOUR_PI = 4 * Math.PI;

export const VERT = `#version 300 es
precision mediump float;
layout(location = 0) in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

export const FRAG = `#version 300 es
precision mediump float;

#define TWO_PI 6.28318530718

uniform float u_time;
uniform vec2  u_resolution;
uniform float u_pxSize;
uniform float u_shape;
uniform vec3  u_colorBack;
uniform vec3  u_colorFront;

out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float hash11(float p) { p = fract(p * 0.3183099) + 0.1; p *= p + 19.19; return fract(p * p); }

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
float bayer(vec2 uv) {
  ivec2 p = ivec2(mod(uv, 8.0));
  return float(bayer8x8[p.y * 8 + p.x]) / 64.0;
}

void main() {
  // Centre-origin, WIDTH-normalised pixel coord so shapes stay circular on any
  // section aspect; the pixelation quantum is u_pxSize.
  vec2 px = floor((gl_FragCoord.xy - 0.5 * u_resolution) / u_pxSize) * u_pxSize;
  vec2 shape_uv = (px / u_resolution.x) * 2.6;
  float t = 0.5 * u_time; // 4π-wrapped phase accumulator (CPU-side)

  float shape;
  if (u_shape < 1.5) {              // SIMPLEX — drifting lab-air noise (orbital => wrap-safe)
    vec2 s = shape_uv * 1.6 + 0.6 * vec2(sin(t), cos(t));
    float n = 0.5 * snoise(s) + 0.5 * snoise(2.0 * s + vec2(0.0, 1.0));
    shape = smoothstep(0.3, 0.9, 0.5 + 0.5 * n);
  } else if (u_shape < 2.5) {       // WARP — folded interference sheets
    vec2 s = shape_uv * 1.2;
    for (float i = 1.0; i < 6.0; i++) {
      s.x += 0.6 / i * cos(i * 2.5 * s.y + t);
      s.y += 0.6 / i * cos(i * 1.5 * s.x + t);
    }
    shape = smoothstep(0.02, 1.0, 0.15 / abs(sin(t - s.y - s.x)));
  } else if (u_shape < 3.5) {       // DOTS — pad array, integer per-stripe clock
    vec2 s = shape_uv * 6.0;
    float stripe = floor(2.0 * s.x / TWO_PI);
    float r = hash11(stripe * 10.0);
    float spd = 1.0 + floor(3.0 * r);
    float dir = sign(r - 0.5);
    shape = pow(abs(sin(s.x) * cos(s.y - dir * spd * t)), 6.0);
  } else if (u_shape < 4.5) {       // WAVE — tide-line in the lower third
    vec2 w = shape_uv * 4.0;
    float wave = cos(0.5 * w.x - 2.0 * t) * sin(1.5 * w.x + t) * (0.75 + 0.25 * cos(3.0 * t));
    shape = (1.0 - smoothstep(-1.0, 1.0, w.y + 0.9 + wave)) * 0.85;
  } else if (u_shape < 5.5) {       // RIPPLE — concentric rings from centre
    float d = length(shape_uv);
    shape = sin(pow(d, 1.7) * 14.0 - 6.0 * t) * 0.5 + 0.5;
  } else if (u_shape < 6.5) {       // SWIRL — signal lost
    float l = max(length(shape_uv), 1e-3);
    float a = 6.0 * atan(shape_uv.y, shape_uv.x) + 4.0 * t;
    shape = mix(0.0, fract(pow(l, -1.2) + a / TWO_PI), smoothstep(0.0, 1.0, pow(l, 1.2)));
  } else {                          // SPHERE — lit ball, integer light orbit
    vec2 s = shape_uv * 1.15;
    float d = 1.0 - dot(s, s);
    vec3 pos = vec3(s, sqrt(max(d, 0.0)));
    vec3 light = normalize(vec3(cos(t), 0.8, sin(2.0 * t)));
    shape = (0.5 + 0.5 * dot(light, pos)) * step(0.0, d);
  }

  float dither = bayer(gl_FragCoord.xy / u_pxSize) - 0.5;
  float res = step(0.5, shape + dither); // crisp 1-bit split — never soften (mud)
  vec3 col = mix(u_colorBack, u_colorFront, res);
  // Ground the whole field toward the accent so each station reads as its COLOUR
  // (gold/teal/crimson), not near-black with faint specks — "less graphite, more
  // colour". Still never brighter than the pure accent the scrim gate assumes.
  col = mix(col, u_colorFront, 0.10);
  fragColor = vec4(col, 1.0); // alpha:false; CSS opacity blends
}`;

export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("SIGNAL shader:", gl.getShaderInfoLog(sh));
    }
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export type RGB = [number, number, number];

export function hexToRgb01(hex: string): RGB {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}
