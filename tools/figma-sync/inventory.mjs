/**
 * Figma component inventory (optionally scoped to a single node/section).
 *
 * Usage:
 *   node inventory.mjs <fileKey> [nodeId]
 *   # or via env: FIGMA_FILE_KEY / FIGMA_NODE_ID (+ FIGMA_TOKEN from .env)
 *
 *   pnpm figma:inventory                    # whole file (large!)
 *   node tools/figma-sync/inventory.mjs <fileKey> <nodeId>   # just one section
 *
 * With a nodeId it fetches only that subtree (GET /v1/files/:key/nodes?ids=),
 * prints the structure, and lists the COMPONENT / COMPONENT_SET inside it.
 *
 * Note: the Figma *Variables* REST API is Enterprise-gated. Use the JSON export
 * for variables (`pnpm tokens:import`); this tool covers components/specs/assets.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

// Load credentials from a git-ignored .env (repo root or this folder) if present.
// The token lives only in that file — it is never hard-coded or logged.
for (const envPath of [path.resolve(root, '../../.env'), path.resolve(root, '.env')]) {
  try {
    process.loadEnvFile(envPath);
    break;
  } catch {
    /* no .env at this location */
  }
}

const TOKEN = process.env.FIGMA_TOKEN;
// `||` (not `??`) so an empty FIGMA_FILE_KEY= line in .env falls back to the CLI arg.
const FILE_KEY = process.env.FIGMA_FILE_KEY || process.argv[2];
const RAW_NODE = process.env.FIGMA_NODE_ID || process.argv[3];
// URLs use "11714-1003"; the REST API expects "11714:1003".
const NODE_ID = RAW_NODE ? (RAW_NODE.includes(':') ? RAW_NODE : RAW_NODE.replace('-', ':')) : undefined;

function instructions(msg) {
  console.log(
    [
      msg,
      '',
      'Set up Figma access:',
      '  FIGMA_TOKEN=<personal access token>   in .env (Figma → Settings → Personal access tokens)',
      '  then: node tools/figma-sync/inventory.mjs <fileKey> [nodeId]',
      '',
      'The Variables REST API is Enterprise-gated — use `pnpm tokens:import` for variables.',
    ].join('\n'),
  );
}

if (!TOKEN) {
  instructions('No FIGMA_TOKEN found — skipping.');
  process.exit(0);
}
if (!FILE_KEY) {
  instructions('No FIGMA_FILE_KEY found — skipping.');
  process.exit(0);
}

const headers = { 'X-Figma-Token': TOKEN };

const found = [];
function walk(node, page) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'CANVAS') page = node.name;
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    found.push({ id: node.id, name: node.name, type: node.type, page });
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, page);
  }
}

function outline(node, depth, maxDepth, lines) {
  if (!node || depth > maxDepth) return;
  const showId = ['SECTION', 'COMPONENT_SET', 'CANVAS'].includes(node.type);
  lines.push(`${'  '.repeat(depth)}- ${node.name}  [${node.type}]${showId ? `  (id ${node.id})` : ''}`);
  if (Array.isArray(node.children) && depth < maxDepth) {
    for (const child of node.children) outline(child, depth + 1, maxDepth, lines);
  }
}

async function getJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`Figma API error: ${res.status} ${res.statusText}`);
    if (res.status === 403) console.error('  → token invalid or lacks file-read access.');
    if (res.status === 404) console.error('  → check the file key / node id.');
    process.exit(1);
  }
  return res.json();
}

try {
  let docRoot;
  let fileName;

  if (NODE_ID) {
    const data = await getJson(
      `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(NODE_ID)}`,
    );
    fileName = data.name;
    const node = data.nodes?.[NODE_ID];
    if (!node?.document) {
      console.error(`Node ${NODE_ID} not found. Double-check the node-id from the URL.`);
      process.exit(1);
    }
    docRoot = node.document;
    console.log(`File:    "${fileName}"`);
    console.log(`Section: "${docRoot.name}"  [${docRoot.type}]  (node ${NODE_ID})\n`);
    const lines = [];
    outline(docRoot, 0, 3, lines);
    console.log('Structure (depth 3):\n' + lines.join('\n'));
  } else {
    const data = await getJson(`https://api.figma.com/v1/files/${FILE_KEY}`);
    fileName = data.name;
    docRoot = data.document;
    console.log(`File: "${fileName}" (whole file)`);
  }

  walk(docRoot, docRoot.name);

  const outDir = path.join(root, 'output');
  await fs.mkdir(outDir, { recursive: true });
  const slug = NODE_ID ? `node-${NODE_ID.replace(/:/g, '-')}` : 'components';
  const outFile = path.join(outDir, `${slug}.json`);
  await fs.writeFile(
    outFile,
    `${JSON.stringify({ file: fileName, node: NODE_ID ?? null, count: found.length, components: found }, null, 2)}\n`,
  );

  console.log(`\n✓ ${found.length} component(s)/set(s) in scope:`);
  for (const c of found.slice(0, 80)) console.log(`  · [${c.type}] ${c.name}`);
  if (found.length > 80) console.log(`  … and ${found.length - 80} more`);
  console.log(`\nReport: ${path.relative(process.cwd(), outFile)}`);
} catch (err) {
  console.error('figma-sync failed:', err instanceof Error ? err.message : err);
  process.exit(1);
}
