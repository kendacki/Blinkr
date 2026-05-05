/**
 * Upscale dashboard mockup to ~4K height (3840px long edge), aspect preserved. No other edits.
 * Run: node scripts/upscale-dashboard-4k.mjs
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { renameSync, unlinkSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, "../public/images/how-it-works-dashboard.png");
const tmpPath = `${inputPath}.tmp.png`;

const TARGET_LONG_EDGE = 3840;

const meta = await sharp(inputPath).metadata();
const w = meta.width ?? 1;
const h = meta.height ?? 1;
const longEdge = Math.max(w, h);
const scale = TARGET_LONG_EDGE / longEdge;
const outW = Math.max(1, Math.round(w * scale));
const outH = Math.max(1, Math.round(h * scale));

await sharp(inputPath)
  .resize(outW, outH, {
    kernel: sharp.kernel.lanczos3,
    fit: "fill",
  })
  .png({ compressionLevel: 6 })
  .toFile(tmpPath);

try {
  unlinkSync(inputPath);
} catch {
  /* ignore */
}
renameSync(tmpPath, inputPath);

console.log(`Upscaled ${w}x${h} -> ${outW}x${outH} (long edge ${TARGET_LONG_EDGE}px)`);
