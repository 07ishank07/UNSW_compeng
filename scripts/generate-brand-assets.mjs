/**
 * generate-brand-assets.mjs — regenerates every raster brand asset from the
 * vector source of record (assets/Logo_circle_ink.svg). Drives the INSTALLED
 * Chrome/Edge via playwright-core (channel — no browser download), because the
 * SVG's only content is an embedded base64 PNG clipped to a circle: the
 * browser resolves the &#10; entities inside the data URI and applies the
 * clipPath natively, so no Node-side PNG decoding is needed.
 *
 * Writes (same public paths the components already reference — no code edits):
 *   public/brand/logo.png     2048×2048 RGBA — disc fills the frame with the
 *                             same 2px inset the previous asset had (HeroLogo's
 *                             mask + ring geometry key off that alpha).
 *   public/icon.png           512×512, same composition (metadata.icons).
 *   src/app/favicon.ico       16/32/48 PNG-entry ICO (packed below).
 *   public/og/default-og.png  1200×630 — 520px disc centred on #0A0B0F, the
 *                             composition sampled from the outgoing OG card.
 *
 * Usage: node scripts/generate-brand-assets.mjs   (BROWSER_CHANNEL=msedge to switch)
 */
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Disc bounding box inside the 2048 viewBox — from the SVG's clipPath circle
// (cx 1027.7418, cy 1029.5386, r 979.15393).
const CLIP = {
  x: 1027.7418 - 979.15393,
  y: 1029.5386 - 979.15393,
  s: 2 * 979.15393,
};
const OG = { w: 1200, h: 630, bg: "#0A0B0F", disc: 520 };

const svgText = readFileSync(resolve(root, "assets/Logo_circle_ink.svg"), "utf8");
const svgUrl = `data:image/svg+xml;base64,${Buffer.from(svgText).toString("base64")}`;

const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
  headless: true,
});
const page = await (await browser.newContext({ deviceScaleFactor: 1 })).newPage();

const out = await page.evaluate(
  async ({ svgUrl, CLIP, OG }) => {
    const img = new Image();
    img.src = svgUrl;
    await img.decode();

    const master = document.createElement("canvas");
    master.width = master.height = 2048;
    const mc = master.getContext("2d");
    mc.imageSmoothingQuality = "high";
    mc.drawImage(img, CLIP.x, CLIP.y, CLIP.s, CLIP.s, 2, 2, 2044, 2044);

    // Iterative halving — a single drawImage 2048→16 aliases badly.
    const scaled = (src, size) => {
      let cur = src;
      while (cur.width / 2 >= size * 2) {
        const half = document.createElement("canvas");
        half.width = half.height = cur.width / 2;
        const hx = half.getContext("2d");
        hx.imageSmoothingQuality = "high";
        hx.drawImage(cur, 0, 0, half.width, half.height);
        cur = half;
      }
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const cx = c.getContext("2d");
      cx.imageSmoothingQuality = "high";
      cx.drawImage(cur, 0, 0, size, size);
      return c;
    };

    const og = document.createElement("canvas");
    og.width = OG.w;
    og.height = OG.h;
    const ox = og.getContext("2d");
    ox.fillStyle = OG.bg;
    ox.fillRect(0, 0, OG.w, OG.h);
    ox.imageSmoothingQuality = "high";
    ox.drawImage(scaled(master, OG.disc), (OG.w - OG.disc) / 2, (OG.h - OG.disc) / 2);

    // A blank master here means the SVG failed to rasterise — fail loudly.
    const centre = mc.getImageData(1024, 1024, 1, 1).data;
    const corner = mc.getImageData(8, 8, 1, 1).data;
    if (centre[3] !== 255 || corner[3] !== 0) {
      throw new Error(
        `master sanity check failed (centre a=${centre[3]}, corner a=${corner[3]})`,
      );
    }

    const b64 = (c) => c.toDataURL("image/png").split(",")[1];
    return {
      logo: b64(master),
      icon: b64(scaled(master, 512)),
      f16: b64(scaled(master, 16)),
      f32: b64(scaled(master, 32)),
      f48: b64(scaled(master, 48)),
      og: b64(og),
    };
  },
  { svgUrl, CLIP, OG },
);
await browser.close();

// ICO container: ICONDIR (6 B) + one 16 B ICONDIRENTRY per image + raw PNG
// blobs. PNG-format entries are valid from Windows Vista; every modern
// browser reads them.
function packIco(images /* [{ size, buf }] */) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, buf }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size % 256, 0); // width (0 means 256)
    e.writeUInt8(size % 256, 1); // height
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.buf)]);
}

const B = (s) => Buffer.from(s, "base64");
writeFileSync(resolve(root, "public/brand/logo.png"), B(out.logo));
writeFileSync(resolve(root, "public/icon.png"), B(out.icon));
writeFileSync(resolve(root, "public/og/default-og.png"), B(out.og));
writeFileSync(
  resolve(root, "src/app/favicon.ico"),
  packIco([
    { size: 16, buf: B(out.f16) },
    { size: 32, buf: B(out.f32) },
    { size: 48, buf: B(out.f48) },
  ]),
);
console.log("brand assets regenerated from assets/Logo_circle_ink.svg");
