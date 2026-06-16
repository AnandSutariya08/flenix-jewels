/**
 * Generates favicon files from public/icon-192x192.png (the square Flenix logo icon).
 * Produces:
 *   public/favicon-16x16.png
 *   public/favicon-32x32.png
 *   public/favicon-48x48.png
 *   public/favicon.ico  (contains 16, 32, 48 px PNG frames)
 *   public/icon-192x192.png  (regenerated from source)
 *   public/icon-512x512.png  (regenerated from source)
 *   public/apple-touch-icon.png  (180x180)
 *   public/apple-touch-icon-precomposed.png  (180x180)
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'public/icon-512x512.png');

console.log('Generating favicons from:', SRC);

async function resize(size) {
  return sharp(SRC).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

// Build ICO file containing PNG-compressed frames (supported since Windows Vista / all modern browsers)
function buildIco(frames) {
  // frames = [{ size, data: Buffer }]
  const count = frames.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;
  let dataOffset = headerSize + dirSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // type: 1 = ICO
  header.writeUInt16LE(count, 4); // number of images

  const entries = [];
  const images = [];

  for (const { size, data } of frames) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);  // width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1);  // height
    entry.writeUInt8(0, 2);  // color palette
    entry.writeUInt8(0, 3);  // reserved
    entry.writeUInt16LE(1, 4);  // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8); // size of image data
    entry.writeUInt32LE(dataOffset, 12); // offset of image data
    entries.push(entry);
    images.push(data);
    dataOffset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images]);
}

const [px16, px32, px48] = await Promise.all([resize(16), resize(32), resize(48)]);

// Write individual PNGs
writeFileSync(resolve(ROOT, 'public/favicon-16x16.png'), px16);
writeFileSync(resolve(ROOT, 'public/favicon-32x32.png'), px32);
writeFileSync(resolve(ROOT, 'public/favicon-48x48.png'), px48);
console.log('✓ favicon-16x16.png, favicon-32x32.png, favicon-48x48.png');

// Write favicon.ico (contains all three sizes)
const ico = buildIco([
  { size: 16, data: px16 },
  { size: 32, data: px32 },
  { size: 48, data: px48 },
]);
writeFileSync(resolve(ROOT, 'public/favicon.ico'), ico);
console.log('✓ favicon.ico (16+32+48px)');

// Apple touch icons (180x180 with cream background — Apple ignores transparency)
const appleBuffer = await sharp(SRC)
  .resize(180, 180, { fit: 'contain', background: { r: 250, g: 246, b: 240, alpha: 1 } })
  .flatten({ background: { r: 250, g: 246, b: 240 } })
  .png()
  .toBuffer();
writeFileSync(resolve(ROOT, 'public/apple-touch-icon.png'), appleBuffer);
writeFileSync(resolve(ROOT, 'public/apple-touch-icon-precomposed.png'), appleBuffer);
console.log('✓ apple-touch-icon.png (180x180)');

// Regenerate 192 and 512 with cream background for PWA (solid bg = better on home screens)
const pwa192 = await sharp(SRC)
  .resize(192, 192, { fit: 'contain', background: { r: 250, g: 246, b: 240, alpha: 1 } })
  .flatten({ background: { r: 250, g: 246, b: 240 } })
  .png()
  .toBuffer();
writeFileSync(resolve(ROOT, 'public/icon-192x192.png'), pwa192);

const pwa512 = await sharp(SRC)
  .resize(512, 512, { fit: 'contain', background: { r: 250, g: 246, b: 240, alpha: 1 } })
  .flatten({ background: { r: 250, g: 246, b: 240 } })
  .png()
  .toBuffer();
writeFileSync(resolve(ROOT, 'public/icon-512x512.png'), pwa512);
console.log('✓ icon-192x192.png, icon-512x512.png (PWA)');

console.log('\nAll favicon files generated successfully.');
