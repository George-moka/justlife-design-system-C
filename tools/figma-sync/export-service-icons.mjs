// One-off: batch-export the Wallet service-icon catalog (3D icons) → packages/ui/src/assets/services/.
// Excludes the promo/state variants (Instant, Cleaning Subscription) and the odd duplicates per design review.
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

process.loadEnvFile?.('.env');
const KEY = '5oelNRfOhuxiQKNGZmuOHo'; // app-screens file (override the DS-file default)
const TOKEN = process.env.FIGMA_TOKEN;
const SCALE = 3;
const OUT = 'packages/ui/src/assets/services';

// key (kebab) → Figma component node id
const ICONS = {
  'general-cleaning': '90:777',
  'salon-spa': '90:793',
  handymen: '90:795',
  healthcare: '90:797',
  'pest-control': '90:799',
  'packers-movers': '90:801',
  'pet-grooming': '90:803',
  'furniture-cleaning': '90:805',
  'womens-spa': '90:807',
  'mens-spa': '90:809',
  'premium-grooming': '90:811',
  babysitting: '90:813',
  'personal-trainer': '90:815',
  laundry: '90:817',
  'car-wash': '90:819',
  'hair-care': '90:821',
  'nail-couture': '90:823',
  'lashes-brows': '90:825',
  'home-painting': '90:827',
  'water-tank-cleaning': '90:829',
  'lab-tests': '90:831',
  'iv-therapy': '90:834',
  'nurse-care': '90:836',
  'pcr-tests': '90:838',
  physiotherapy: '90:840',
  'online-therapy': '90:842',
  'flu-vaccine': '90:844',
  disinfection: '90:846',
  'spray-tanning': '90:848',
  'sneaker-cleaning': '90:850',
  'window-cleaning': '90:852',
  'home-inspection': '90:854',
  'glp-1': '90:858',
};

if (!TOKEN) {
  console.error('FIGMA_TOKEN missing');
  process.exit(1);
}

const ids = Object.values(ICONS);
const url = `https://api.figma.com/v1/images/${KEY}?ids=${encodeURIComponent(ids.join(','))}&format=png&scale=${SCALE}`;
const res = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
const json = await res.json();
if (json.err) {
  console.error('Figma error:', json.err);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
let ok = 0;
for (const [key, id] of Object.entries(ICONS)) {
  const img = json.images[id];
  if (!img) {
    console.error(`  ✗ ${key} (${id}) — no image url`);
    continue;
  }
  const buf = Buffer.from(await (await fetch(img)).arrayBuffer());
  const path = `${OUT}/svc_${key.replace(/-/g, '_')}.png`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, buf);
  ok++;
}
console.log(`Exported ${ok}/${ids.length} service icons → ${OUT}`);
