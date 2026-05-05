/**
 * Removes connected near-black background (typical export artifact) via edge flood-fill.
 * Run: node scripts/remove-dashboard-bg.mjs
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { renameSync, unlinkSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, "../public/images/how-it-works-dashboard.png");

/** Pixels with max(R,G,B) below this are treated as "background" for flood-fill */
const BG_THRESHOLD = 52;

const image = sharp(inputPath);
const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const out = new Uint8Array(data);

function maxChannel(i) {
  return Math.max(out[i], out[i + 1], out[i + 2]);
}

function isBackgroundPixel(i) {
  return maxChannel(i) < BG_THRESHOLD;
}

const visited = new Uint8Array(width * height);
const stack = [];

function tryPush(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const p = y * width + x;
  if (visited[p]) return;
  const i = p * 4;
  if (!isBackgroundPixel(i)) return;
  visited[p] = 1;
  stack.push([x, y]);
}

for (let x = 0; x < width; x++) {
  tryPush(x, 0);
  tryPush(x, height - 1);
}
for (let y = 0; y < height; y++) {
  tryPush(0, y);
  tryPush(width - 1, y);
}

while (stack.length) {
  const [x, y] = stack.pop();
  const i = (y * width + x) * 4;
  out[i + 3] = 0;
  tryPush(x + 1, y);
  tryPush(x - 1, y);
  tryPush(x, y + 1);
  tryPush(x, y - 1);
}

const tmpPath = `${inputPath}.tmp.png`;
await sharp(out, {
  raw: { width, height, channels: 4 },
})
  .png({ compressionLevel: 9 })
  .toFile(tmpPath);

try {
  unlinkSync(inputPath);
} catch {
  /* ignore */
}
renameSync(tmpPath, inputPath);

console.log("Updated", inputPath, `${width}x${height}`);
