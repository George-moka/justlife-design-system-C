/**
 * Probe the Figma Variables REST API (GET /v1/files/:key/variables/local).
 * Works only on Enterprise plans with a `file_variables:read`-scoped token.
 * Prints collections + variable counts if accessible, otherwise the error.
 *
 * Usage: node tools/figma-sync/variables.mjs <fileKey>
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
if (!TOKEN || !FILE_KEY) {
  console.error('Need FIGMA_TOKEN (.env) + <fileKey>.');
  process.exit(1);
}

const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/variables/local`, {
  headers: { 'X-Figma-Token': TOKEN },
});
console.log(`HTTP ${res.status} ${res.statusText}`);
const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.log('Response:', JSON.stringify(body));
  console.log('\n→ Variables REST API not accessible with this token/plan (expected on non-Enterprise).');
  process.exit(0);
}

const collections = body.meta?.variableCollections ?? {};
const variables = body.meta?.variables ?? {};
console.log(`\nCollections (${Object.keys(collections).length}):`);
for (const c of Object.values(collections)) {
  const modes = (c.modes ?? []).map((m) => m.name).join(', ');
  console.log(`  - ${c.name}  [modes: ${modes}]  (id ${c.id})`);
}
console.log(`\nTotal variables: ${Object.keys(variables).length}`);

await fs.mkdir(path.join(root, 'output'), { recursive: true });
await fs.writeFile(path.join(root, 'output', 'variables-local.json'), JSON.stringify(body, null, 2));
console.log('\nSaved full payload → tools/figma-sync/output/variables-local.json');
