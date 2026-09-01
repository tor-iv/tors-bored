// One-off: convert the master pottery photos from the tors-studio repo into
// web-ready WebP under public/pieces/. Sources are 1024-1536px, so the resize
// is a safety cap, not real downscaling. Run: bun run scripts/process-pieces.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SRC_DIR = "/Users/torcox/side-projects/tors-studio/images";
const OUT_DIR = fileURLToPath(new URL("../public/pieces/", import.meta.url));

const files = [
  "tomato.png",
  "green-vase.png",
  "multicolor-vase.png",
  "white-flower.png",
  "white-rib-vase.png",
];

await mkdir(OUT_DIR, { recursive: true });

for (const file of files) {
  const name = file.replace(/\.png$/, ".webp");
  const info = await sharp(`${SRC_DIR}/${file}`)
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT_DIR}${name}`);
  console.log(`✓ ${file} → public/pieces/${name} (${info.width}x${info.height}, ${Math.round(info.size / 1024)}KB)`);
}
