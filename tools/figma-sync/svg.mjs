/**
 * Export a Figma node as SVG (for icon/vector geometry — used to recreate glyphs
 * faithfully instead of hand-drawing them).
 *
 * Usage: node tools/figma-sync/svg.mjs <fileKey> <nodeId>
 * Prints the SVG markup and saves it to output/svg-<nodeId>.svg.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
for (const p of [path.resolve(root, '../../.env'), path.resolve(root, '.env')]) {
  try {
    process.loadEnvFile(p);
    break;
  } catch {
    /* none */
  }
}

const TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY || process.argv[2];
const RAW = process.env.FIGMA_NODE_ID || process.argv[3];
const NODE = RAW && (RAW.includes(':') ? RAW : RAW.replace('-', ':'));
if (!TOKEN || !FILE_KEY || !NODE) {
  console.error('Need FIGMA_TOKEN (.env) + <fileKey> <nodeId>.');
  process.exit(1);
}

const headers = { 'X-Figma-Token': TOKEN };
const meta = await fetch(
  `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(NODE)}&format=svg`,
  { headers },
);
const metaJson = await meta.json();
const url = metaJson.images?.[NODE];
if (!url) {
  console.error('No image URL returned:', JSON.stringify(metaJson));
  process.exit(1);
}
const svg = await (await fetch(url)).text();
await fs.mkdir(path.join(root, 'output'), { recursive: true });
await fs.writeFile(path.join(root, 'output', `svg-${NODE.replace(/:/g, '-')}.svg`), svg);
console.log(svg);
