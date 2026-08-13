/**
 * One-off: search a node subtree for descendants whose name matches a regex.
 * Usage: node find-node.mjs <FILE_KEY> <NODE_ID> [nameRegex] [depth]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
for (const p of [path.resolve(root, '../../.env'), path.resolve(root, '.env')]) {
  try { process.loadEnvFile(p); break; } catch { /* none */ }
}
const TOKEN = process.env.FIGMA_TOKEN;
const KEY = process.env.FIGMA_FILE_KEY || process.argv[2];
const NODE = process.argv[3];
const re = new RegExp(process.argv[4] || 'gift|image|illustration|3d', 'i');
const depth = process.argv[5] || '6';
const res = await fetch(`https://api.figma.com/v1/files/${KEY}/nodes?ids=${encodeURIComponent(NODE)}&depth=${depth}`, { headers: { 'X-Figma-Token': TOKEN } });
const data = await res.json();
const docNode = data.nodes?.[NODE]?.document;
if (!docNode) { console.error('no node', JSON.stringify(data).slice(0, 400)); process.exit(1); }
function walk(n, trail) {
  const here = [...trail, n.name];
  const hasImageFill = Array.isArray(n.fills) && n.fills.some((f) => f.type === 'IMAGE');
  if (re.test(n.name || '') || hasImageFill) {
    console.log(`${n.id}  [${n.type}]${hasImageFill ? ' (IMAGE-FILL)' : ''}  ${here.join(' / ')}`);
  }
  for (const c of n.children || []) walk(c, here);
}
walk(docNode, []);
