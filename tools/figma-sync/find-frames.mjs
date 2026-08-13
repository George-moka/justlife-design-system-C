/**
 * One-off discovery: list pages + top-level frames whose name matches a regex.
 * Usage: node find-frames.mjs "<regex>"
 */
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
const FILE_KEY = process.env.FIGMA_FILE_KEY || process.argv[3];
const re = new RegExp(process.argv[2] || 'wallet', 'i');
if (!TOKEN || !FILE_KEY) {
  console.error('Need FIGMA_TOKEN + FIGMA_FILE_KEY');
  process.exit(1);
}

const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}?depth=2`, {
  headers: { 'X-Figma-Token': TOKEN },
});
if (!res.ok) {
  console.error(`Figma API error ${res.status} ${res.statusText}`);
  process.exit(1);
}
const data = await res.json();
const doc = data.document;
console.log(`File: ${data.name}\n`);
for (const page of doc.children || []) {
  const frames = (page.children || []).filter((c) => re.test(c.name || ''));
  if (frames.length) {
    console.log(`PAGE: ${page.name}`);
    for (const f of frames) console.log(`  • ${f.name} [${f.type}] ${f.id}`);
  }
}
