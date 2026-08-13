/**
 * Figma → canonical DTCG token importer.
 *
 * Converts the Figma *native* variables export (in ../../Variables) into the
 * canonical DTCG source this package builds from:
 *
 *   Variables/Default.tokens.json        -> src/primitive/color.json   (color + opacity)
 *   Variables/Default.tokens 2.json      -> src/primitive/size.json
 *   Variables/Value.tokens.json          -> src/primitive/typography.json
 *   Variables/Semantic_ Colors/{mode}    -\
 *   Variables/Component_ Colors/{mode}    >-> src/themes/{light,dark}.json
 *   Variables/Button_Theme/{mode}        -/
 *
 * Handles: Figma color objects ({components,alpha,hex}) -> hex / rgba(),
 * {alias} string references (preserved), opacity percentages (25 -> 0.25),
 * font-weight names ("Semi Bold" -> "600"), and $type normalisation.
 *
 * Usage: pnpm tokens:import   (then: pnpm --filter @justlife/tokens build)
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(root, 'src');
const VARS = path.resolve(root, '../../Variables');

const FONT_WEIGHT = {
  Thin: '100',
  'Extra Light': '200',
  Light: '300',
  Regular: '400',
  Medium: '500',
  'Semi Bold': '600',
  SemiBold: '600',
  Bold: '700',
  'Extra Bold': '800',
  ExtraBold: '800',
  Black: '900',
};

const isToken = (n) => n && typeof n === 'object' && '$value' in n;

function figmaColor(v) {
  if (typeof v === 'string') return v; // {alias} reference or plain string
  if (v && typeof v === 'object' && Array.isArray(v.components)) {
    const [r, g, b] = v.components.map((c) => Math.round(c * 255));
    if (typeof v.alpha === 'number' && v.alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${Number(v.alpha.toFixed(3))})`;
    }
    return (v.hex ?? `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`).toUpperCase();
  }
  return v;
}

function convertToken(node, topGroup) {
  const ftype = node.$type;
  const raw = node.$value;
  let $type = ftype;
  let $value = raw;

  if (ftype === 'color') {
    $type = 'color';
    $value = figmaColor(raw);
  } else if (ftype === 'number') {
    if (topGroup === 'opacity') {
      $type = 'number';
      $value = typeof raw === 'number' ? Number((raw / 100).toFixed(4)) : raw;
    } else {
      $type = 'dimension';
      $value = raw;
    }
  } else if (ftype === 'string') {
    if (topGroup === 'font-weight') {
      $type = 'fontWeight';
      $value = FONT_WEIGHT[raw] ?? raw;
    } else if (topGroup === 'font-family') {
      $type = 'fontFamily';
      $value = raw;
    } else {
      $type = 'string';
    }
  }

  const out = { $type, $value };
  if (node.$description) out.$description = node.$description;
  return out;
}

function convertTree(node, topGroup) {
  if (isToken(node)) return convertToken(node, topGroup);
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    out[k] = convertTree(v, topGroup === undefined ? k : topGroup);
  }
  return out;
}

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && !('$value' in v) && target[k]) {
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

async function readJSON(rel) {
  return JSON.parse(await fs.readFile(path.join(VARS, rel), 'utf8'));
}

async function writeJSON(rel, data) {
  const dest = path.join(SRC, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`  ✓ ${path.relative(root, dest)}`);
}

async function mergeMode(files) {
  const merged = {};
  for (const f of files) deepMerge(merged, convertTree(await readJSON(f)));
  return merged;
}

async function main() {
  try {
    await fs.access(VARS);
  } catch {
    console.log(`No Figma export at ${VARS} — nothing to import.`);
    return;
  }

  // Reset the Figma-managed source dirs (semantic/ holds hand-authored additions).
  await fs.rm(path.join(SRC, 'primitive'), { recursive: true, force: true });
  await fs.rm(path.join(SRC, 'themes'), { recursive: true, force: true });
  await fs.rm(path.join(SRC, 'component'), { recursive: true, force: true });

  console.log('Importing Figma variables → canonical DTCG:');

  // Primitives (mode-agnostic)
  const primitives = convertTree(await readJSON('Default.tokens.json')); // { color, opacity }
  await writeJSON('primitive/color.json', { color: primitives.color });
  await writeJSON('primitive/opacity.json', { opacity: primitives.opacity });
  await writeJSON('primitive/size.json', convertTree(await readJSON('Default.tokens 2.json')));
  await writeJSON('primitive/typography.json', convertTree(await readJSON('Value.tokens.json')));

  // Modes (semantic + component + button-theme colours)
  await writeJSON(
    'themes/light.json',
    await mergeMode([
      'Semantic_ Colors/Light.tokens.json',
      'Component_ Colors/Light.tokens.json',
      'Button_Theme/Light.tokens.json',
    ]),
  );
  await writeJSON(
    'themes/dark.json',
    await mergeMode([
      'Semantic_ Colors/Dark.tokens.json',
      'Component_ Colors/Dark.tokens.json',
      'Button_Theme/Dark.tokens.json',
    ]),
  );

  console.log('\nDone. Next: pnpm --filter @justlife/tokens build');
}

main().catch((err) => {
  console.error('Token import failed:', err);
  process.exit(1);
});
