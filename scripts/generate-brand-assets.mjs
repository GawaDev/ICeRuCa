import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const icon = await readFile(new URL('../public/favicon.svg', import.meta.url));
const output = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
await mkdir(new URL('../public/screenshots/', import.meta.url), { recursive: true });

await Promise.all([
  sharp(icon).resize(64, 64).png().toFile(output('favicon.png')),
  sharp(icon).resize(180, 180).png().toFile(output('apple-touch-icon.png')),
  sharp(icon).resize(192, 192).png().toFile(output('pwa-192.png')),
  sharp(icon).resize(512, 512).png().toFile(output('pwa-512.png')),
  sharp({ create: { width: 512, height: 512, channels: 4, background: '#e7f8ff' } })
    .composite([{ input: await sharp(icon).resize(360, 360).png().toBuffer(), left: 76, top: 76 }])
    .png().toFile(output('pwa-maskable-512.png')),
]);
await writeFile(output('favicon.ico'), await pngToIco(await Promise.all(
  [16, 32, 48].map((size) => sharp(icon).resize(size, size).png().toBuffer()),
)));

const encoded = icon.toString('base64');
const og = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#eef8fb"/>
  <rect x="70" y="70" width="1060" height="490" rx="24" fill="#fff" stroke="#c9dfe8" stroke-width="2"/>
  <image href="data:image/svg+xml;base64,${encoded}" x="130" y="175" width="280" height="280"/>
  <text x="470" y="285" font-family="Segoe UI,sans-serif" font-size="80" font-weight="700" fill="#0d5978">ICeRuCa</text>
  <text x="474" y="355" font-family="Segoe UI,sans-serif" font-size="32" fill="#425f69">交通系ICカードの利用条件を確認</text>
  <path d="M474 400h520" stroke="#2694c3" stroke-width="8"/>
</svg>`);
await sharp(og).png().toFile(output('og.png'));

for (const [name, width, height] of [['wide.png', 1280, 720], ['narrow.png', 390, 844]]) {
  await sharp({ create: { width, height, channels: 4, background: '#eef3f5' } })
    .composite([{ input: await sharp(icon).resize(Math.min(width, height) / 3).png().toBuffer(), gravity: 'centre' }])
    .png().toFile(fileURLToPath(new URL(`../public/screenshots/${name}`, import.meta.url)));
}
