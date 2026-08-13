/**
 * List the Figma file's TEXT styles with their real type properties
 * (size / weight / line-height / letter-spacing). Figma text styles are not
 * variables, so this is how we learn the canonical type scale.
 *
 * Usage: node tools/figma-sync/textstyles.mjs <fileKey>
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
const headers = { 'X-Figma-Token': TOKEN };

const stylesRes = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/styles`, { headers });
const stylesJson = await stylesRes.json();
const textStyles = (stylesJson.meta?.styles ?? []).filter((s) => s.style_type === 'TEXT');
console.log(`Text styles published: ${textStyles.length}`);

// Fetch the style nodes in batches to read their `style` block.
const ids = textStyles.map((s) => s.node_id);
const out = [];
for (let i = 0; i < ids.length; i += 40) {
  const batch = ids.slice(i, i + 40);
  const res = await fetch(
    `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(batch.join(','))}`,
    { headers },
  );
  const data = await res.json();
  for (const s of textStyles) {
    const node = data.nodes?.[s.node_id]?.document;
    if (!node?.style) continue;
    const st = node.style;
    out.push({
      name: s.name,
      fontSize: st.fontSize,
      fontWeight: st.fontWeight,
      lineHeight: Math.round(st.lineHeightPx ?? 0),
      letterSpacing: Number((st.letterSpacing ?? 0).toFixed(2)),
      family: st.fontFamily,
    });
  }
}
out.sort((a, b) => b.fontSize - a.fontSize || a.name.localeCompare(b.name));
for (const s of out) {
  console.log(`  ${s.name.padEnd(34)} ${s.fontSize}/${s.lineHeight}  w${s.fontWeight}  ls${s.letterSpacing}  ${s.family}`);
}
await fs.mkdir(path.join(root, 'output'), { recursive: true });
await fs.writeFile(path.join(root, 'output', 'text-styles.json'), JSON.stringify(out, null, 2));
console.log(`\nSaved → tools/figma-sync/output/text-styles.json`);
