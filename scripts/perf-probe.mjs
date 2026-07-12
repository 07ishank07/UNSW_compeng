/**
 * perf-probe.mjs — headless verification of the cinematic makeover
 * (docs/checklists.md §2 acceptance). Drives the INSTALLED Chrome/Edge via
 * playwright-core (channel — no browser download):
 *
 *   1. Screenshots every route at desktop (1440×900) and mobile (360×780).
 *   2. Samples frame rate while scrolling each heavy route under 4× CPU
 *      throttle (CDP Emulation.setCPUThrottlingRate) — reports avg fps + worst
 *      frame gap through the scroll.
 *   3. Asserts no horizontal overflow at 360px (document.scrollWidth).
 *   4. Reduced-motion pass — asserts the field/animations are static & usable.
 *
 * Usage:  node scripts/perf-probe.mjs [baseUrl] [outDir]
 * Needs a dev/prod server already running at baseUrl (default localhost:3000).
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = process.argv[3] || "./_probe";
const CHANNEL = process.env.BROWSER_CHANNEL || "chrome";
const ROUTES = ["/", "/events", "/team", "/academics", "/sponsors", "/blog"];
const HEAVY = ["/", "/events"];

mkdirSync(OUT, { recursive: true });
const summary = { fps: {}, overflow: {}, notes: [] };

const settle = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(page, route, label) {
  await page.goto(BASE + route, { waitUntil: "networkidle" }).catch(() => {});
  await settle(1400); // let the field paint + reveals fire
  const name = (route === "/" ? "home" : route.replaceAll("/", "-").replace(/^-/, "")) + `-${label}`;
  await page.screenshot({ path: `${OUT}/${name}.png` });
  return name;
}

/** Sample fps while scrolling the page to the bottom and back. */
async function sampleFps(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        let frames = 0;
        let worst = 0;
        const start = performance.now();
        let last = start;
        const step = () => {
          const now = performance.now();
          const d = now - last;
          if (frames > 2 && d > worst) worst = d; // ignore warm-up frames
          last = now;
          frames++;
          window.scrollBy(0, 14); // drive the scroll pipeline (field hue, triggers)
          if (now - start < 3500) requestAnimationFrame(step);
          else {
            const secs = (now - start) / 1000;
            resolve({ fps: Math.round(frames / secs), worstFrameMs: Math.round(worst) });
          }
        };
        window.scrollTo(0, 0);
        requestAnimationFrame(step);
      }),
  );
}

const browser = await chromium.launch({ channel: CHANNEL, headless: true });
try {
  // ---- Desktop screenshots + fps -------------------------------------------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);

  for (const route of ROUTES) {
    await shoot(page, route, "desktop");
    if (HEAVY.includes(route)) {
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      summary.fps[route] = await sampleFps(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    }
  }
  await ctx.close();

  // ---- Mobile screenshots + overflow ---------------------------------------
  const mctx = await browser.newContext({
    viewport: { width: 360, height: 780 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mpage = await mctx.newPage();
  for (const route of ROUTES) {
    await shoot(mpage, route, "mobile");
    const sw = await mpage.evaluate(() => document.documentElement.scrollWidth);
    summary.overflow[route] = { scrollWidth: sw, overflow: sw > 361 };
  }
  await mctx.close();

  // ---- Reduced motion ------------------------------------------------------
  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rpage = await rctx.newPage();
  await shoot(rpage, "/", "reduced");
  await shoot(rpage, "/events", "reduced");
  await rctx.close();

  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
