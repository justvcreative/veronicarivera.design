// Turns the PNGs exported from Penpot (scripts/source/, not committed) into WebP at 1x and 2x
// in public/images/, and writes their sizes to src/data/images.json for <Picture>.
// Run: npm run images
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'scripts/source');
const OUT = path.join(root, 'public/images');
const config = JSON.parse(await readFile(path.join(root, 'scripts/images.config.json'), 'utf8'));
await mkdir(OUT, { recursive: true });

const manifest = {};
for (const [name, { src, w, q }] of Object.entries(config)) {
  const file = path.join(SRC, src);
  if (!existsSync(file)) { console.warn(`skip ${name}: ${src} not found`); continue; }
  const img = sharp(file);
  const meta = await img.metadata();
  const w1 = Math.min(w, meta.width);
  const w2 = Math.min(w * 2, meta.width);
  const h1 = Math.round((meta.height / meta.width) * w1);
  await sharp(file).resize({ width: w1 }).webp({ quality: q ?? 82, effort: 5 }).toFile(path.join(OUT, `${name}.webp`));
  await sharp(file).resize({ width: w2 }).webp({ quality: q ? q - 4 : 78, effort: 5 }).toFile(path.join(OUT, `${name}@2x.webp`));
  manifest[name] = { w: w1, h: h1, w2 };
  console.log(`${name}: ${w1}w / ${w2}w`);
}
await writeFile(path.join(root, 'src/data/images.json'), JSON.stringify(manifest, null, 2) + '\n');
