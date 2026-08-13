import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
const root = path.dirname(fileURLToPath(import.meta.url));
for (const p of [path.resolve(root, '../../.env'), path.resolve(root, '.env')]) {
  try { process.loadEnvFile(p); break; } catch { /* none */ }
}
const TOKEN = process.env.FIGMA_TOKEN;
const KEY = process.env.FIGMA_FILE_KEY || process.argv[2];
const NODE = (process.argv[3] || '').includes(':') ? process.argv[3] : (process.argv[3] || '').replace('-', ':');
const scale = process.argv[4] || '2';
const r = await fetch(`https://api.figma.com/v1/images/${KEY}?ids=${encodeURIComponent(NODE)}&format=png&scale=${scale}`, { headers: { 'X-Figma-Token': TOKEN } });
const d = await r.json();
const url = d.images?.[NODE];
if (!url) { console.error('no image', JSON.stringify(d)); process.exit(1); }
const img = await fetch(url);
const buf = Buffer.from(await img.arrayBuffer());
const out = path.join(root, 'output', `render-${NODE.replace(/:/g, '-')}.png`);
await fs.writeFile(out, buf);
console.log(out, buf.length, 'bytes');
