/* יוצר גרסה של שם הלוגו לרקע כהה: הטקסט הטורקיז הופך ללבן,
 * והמילה "אור" הצהובה נשארת צהובה - בדיוק כמו בלוגו המקורי.
 *
 * שימוש: node scripts/make-logo-light.mjs
 * קלט:  public/logo-name.png   פלט: public/logo-name-light.png
 */
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const src = PNG.sync.read(readFileSync("public/logo-name.png"));
let yellow = 0, white = 0;

for (let i = 0; i < src.data.length; i += 4) {
  const [r, g, b, a] = [src.data[i], src.data[i + 1], src.data[i + 2], src.data[i + 3]];
  if (a === 0) continue;
  const isYellow = r > 150 && g > 120 && b < 140 && r - b > 50;
  if (isYellow) { yellow++; continue; }
  src.data[i] = 255; src.data[i + 1] = 255; src.data[i + 2] = 255;
  white++;
}

writeFileSync("public/logo-name-light.png", PNG.sync.write(src));
console.log(`public/logo-name-light.png: ${src.width}x${src.height}, צהוב ${yellow}px, לבן ${white}px`);
