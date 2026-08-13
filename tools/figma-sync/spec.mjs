/**
 * Figma node spec extractor.
 *
 * For a given node, prints each variant component and its shape descendants with
 * size / radius / fill / stroke, resolving Figma `boundVariables` back to OUR
 * token paths (via the variable IDs recorded in the Variables/ export).
 *
 * Usage: node tools/figma-sync/spec.mjs <fileKey> <nodeId>
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
const RAW_NODE = process.env.FIGMA_NODE_ID || process.argv[3];
const NODE_ID = RAW_NODE && (RAW_NODE.includes(':') ? RAW_NODE : RAW_NODE.replace('-', ':'));

if (!TOKEN || !FILE_KEY || !NODE_ID) {
  console.error('Need FIGMA_TOKEN (.env) + <fileKey> <nodeId>.');
  process.exit(1);
}

// --- Build variableId -> token path map from the Variables/ export ---
const VARS_DIR = path.resolve(root, '../../Variables');
const varMap = new Map();
function indexTokens(node, trail) {
  if (!node || typeof node !== 'object') return;
  if ('$value' in node) {
    const id = node.$extensions?.['com.figma.variableId'];
    if (id) varMap.set(id, trail.join('/'));
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (!k.startsWith('$')) indexTokens(v, [...trail, k]);
  }
}
try {
  const files = await fs.readdir(VARS_DIR, { recursive: true });
  for (const f of files) {
    if (f.endsWith('.json')) {
      try {
        indexTokens(JSON.parse(await fs.readFile(path.join(VARS_DIR, f), 'utf8')), []);
      } catch {
        /* skip */
      }
    }
  }
} catch {
  /* no Variables dir */
}

const tokenFor = (id) => (id ? (varMap.get(id) ?? `?(${id})`) : undefined);

function hex(c) {
  if (!c) return undefined;
  const to = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
  const base = `#${to(c.r)}${to(c.g)}${to(c.b)}`.toUpperCase();
  return c.a !== undefined && c.a < 1 ? `${base} @${Number(c.a.toFixed(2))}` : base;
}

function solidFill(node) {
  const f = (node.fills || []).find((p) => p.type === 'SOLID' && p.visible !== false);
  if (!f) return undefined;
  return { hex: hex(f.color), token: tokenFor(f.boundVariables?.color?.id) };
}
function solidStroke(node) {
  const s = (node.strokes || []).find((p) => p.type === 'SOLID' && p.visible !== false);
  if (!s) return undefined;
  return {
    hex: hex(s.color),
    token: tokenFor(s.boundVariables?.color?.id),
    weight: node.strokeWeight,
    weightToken: tokenFor(node.boundVariables?.strokeWeight?.id),
  };
}
function radius(node) {
  const r = node.cornerRadius ?? (Array.isArray(node.rectangleCornerRadii) ? node.rectangleCornerRadii[0] : undefined);
  return r === undefined ? undefined : { value: r, token: tokenFor(node.boundVariables?.cornerRadius?.id ?? node.boundVariables?.topLeftRadius?.id) };
}
function size(node) {
  const b = node.absoluteBoundingBox;
  return b ? { w: Math.round(b.width), h: Math.round(b.height) } : undefined;
}

function describe(node, depth, lines) {
  const parts = [`${'  '.repeat(depth)}${node.name} [${node.type}]`];
  const s = size(node);
  if (s) parts.push(`size=${s.w}x${s.h}`);
  if (node.type === 'TEXT' && node.style) {
    const ts = node.style;
    parts.push(`type=${ts.fontSize}/${Math.round(ts.lineHeightPx ?? 0)} w${ts.fontWeight}`);
  }
  const r = radius(node);
  if (r) parts.push(`radius=${r.value}${r.token ? `→${r.token}` : ''}`);
  const f = solidFill(node);
  if (f) parts.push(`fill=${f.hex}${f.token ? `→${f.token}` : ''}`);
  const st = solidStroke(node);
  if (st) parts.push(`stroke=${st.hex}${st.token ? `→${st.token}` : ''} w=${st.weight}${st.weightToken ? `→${st.weightToken}` : ''}`);
  lines.push(parts.join('  '));
  for (const c of node.children || []) describe(c, depth + 1, lines);
}

const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(NODE_ID)}`, {
  headers: { 'X-Figma-Token': TOKEN },
});
if (!res.ok) {
  console.error(`Figma API error ${res.status} ${res.statusText}`);
  process.exit(1);
}
const data = await res.json();
const docNode = data.nodes?.[NODE_ID]?.document;
if (!docNode) {
  console.error('Node not found.');
  process.exit(1);
}

console.log(`Variable map: ${varMap.size} ids indexed\n`);
console.log(`${docNode.name} [${docNode.type}]`);
if (docNode.componentPropertyDefinitions) {
  console.log('Variant properties:');
  for (const [k, v] of Object.entries(docNode.componentPropertyDefinitions)) {
    console.log(`  ${k}: ${(v.variantOptions || [v.defaultValue]).join(' | ')}`);
  }
}
const lines = [];
for (const variant of docNode.children || []) describe(variant, 0, lines);
console.log('\n' + lines.join('\n'));

await fs.mkdir(path.join(root, 'output'), { recursive: true });
await fs.writeFile(path.join(root, 'output', `spec-${NODE_ID.replace(/:/g, '-')}.json`), JSON.stringify(docNode, null, 2));
