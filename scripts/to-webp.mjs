/* ממיר את כל התמונות ב-public/images ל-WebP, ומעדכן את כל ההפניות
 * בקבצי התוכן ובקוד.
 *
 * למה: WebP חוסך כ-40-60% משקל באותה איכות ויזואלית, ומכאן טעינה מהירה
 * יותר - במיוחד במובייל וברשת סלולרית.
 * WebP נתמך בכל הדפדפנים המודרניים (97%+), ולכן אין צורך ב-fallback.
 *
 * שימוש:
 *   node scripts/to-webp.mjs           - הרצה יבשה, רק מדווח
 *   node scripts/to-webp.mjs --apply   - ממיר, מוחק את המקור ומעדכן הפניות
 */
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import { encode } from "@jsquash/webp";

const APPLY = process.argv.includes("--apply");
const QUALITY = 80;
const DIR = "public/images";

function decodeImage(file) {
  const buf = readFileSync(file);
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    const png = PNG.sync.read(buf);
    return { width: png.width, height: png.height, data: new Uint8ClampedArray(png.data) };
  }
  const img = jpeg.decode(buf, { useTArray: true });
  return { width: img.width, height: img.height, data: new Uint8ClampedArray(img.data) };
}

/** כל הקבצים שעשויים להפנות לתמונה */
function textFiles() {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(tsx?|json|html|css|xml|txt)$/.test(entry.name)) out.push(p);
    }
  };
  walk("src");
  out.push("index.html");
  for (const f of readdirSync("public")) {
    if (/\.(xml|txt|html)$/.test(f)) out.push(join("public", f));
  }
  return out;
}

const files = readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));
let before = 0;
let after = 0;
const converted = [];

for (const name of files) {
  const src = join(DIR, name);
  const outName = name.replace(/\.(jpe?g|png)$/i, ".webp");
  const out = join(DIR, outName);
  const image = decodeImage(src);
  const webp = Buffer.from(await encode(image, { quality: QUALITY }));
  const srcSize = statSync(src).size;
  before += srcSize;
  after += webp.length;
  converted.push({ name, outName, srcSize, outSize: webp.length });
  if (APPLY) {
    writeFileSync(out, webp);
    unlinkSync(src);
  }
}

converted.sort((a, b) => b.srcSize - a.srcSize);
console.log(`${converted.length} תמונות\n`);
for (const c of converted.slice(0, 8)) {
  const pct = ((1 - c.outSize / c.srcSize) * 100).toFixed(0);
  console.log(`  ${(c.srcSize / 1024).toFixed(0).padStart(4)}KB -> ${(c.outSize / 1024).toFixed(0).padStart(4)}KB  (-${pct}%)  ${c.name}`);
}
console.log(
  `\nסה"כ: ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB ` +
    `(חיסכון ${((1 - after / before) * 100).toFixed(0)}%, ${((before - after) / 1024 / 1024).toFixed(2)}MB)`,
);

if (!APPLY) {
  console.log("\nהרצה יבשה. להרצה אמיתית: node scripts/to-webp.mjs --apply");
  process.exit(0);
}

/* --- עדכון ההפניות --- */
let touched = 0;
for (const file of textFiles()) {
  const original = readFileSync(file, "utf8");
  let updated = original;
  for (const c of converted) updated = updated.split(c.name).join(c.outName);
  if (updated !== original) {
    writeFileSync(file, updated);
    touched++;
  }
}
console.log(`עודכנו הפניות ב-${touched} קבצים`);
