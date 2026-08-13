import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
for (const p of [path.resolve(root, '../../.env'), path.resolve(root, '.env')]) {
  try { process.loadEnvFile(p); break; } catch { /* none */ }
}
const TOKEN = process.env.FIGMA_TOKEN;
const KEY = process.env.FIGMA_FILE_KEY || process.argv[2];
const r = await fetch(`https://api.figma.com/v1/files/${KEY}?depth=1`, { headers: { 'X-Figma-Token': TOKEN } });
const d = await r.json();
console.log('File:', d.name);
for (const p of d.document.children || []) console.log(' -', p.name, `(${p.children ? p.children.length : '?'} top) ${p.id}`);
