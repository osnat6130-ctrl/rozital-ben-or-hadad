/* מזהה שאריות של טשטוש-פיקסלים (מוזאיקה) ומחליק אותן.
 *
 * הרעיון: בלוק מוזאיקה הוא ריבוע בצבע אחיד לחלוטין, בעוד שבצילום אמיתי
 * תמיד יש רעש. לכן סופרים כמה גוונים שונים יש בכל חלון קטן - מעט מאוד
 * גוונים = בלוק מוזאיקה. אזור חלק באמת (קיר) גם ייתפס, אבל טשטוש של
 * אזור חלק לא משנה אותו, אז זה לא מזיק.
 *
 * שימוש:
 *   node scripts/smooth-mosaic.mjs <קלט> <פלט> [רדיוס-טשטוש] [איכות]
 */
import { readFileSync, writeFileSync } from "node:fs";
import jpeg from "jpeg-js";

const [, , SRC, OUT, RADIUS = "10", QUALITY = "90"] = process.argv;

const src = jpeg.decode(readFileSync(SRC), { useTArray: true });
const W = src.width;
const H = src.height;
const r = Number(RADIUS);

const BLOCK = 10;
const MAX_SHADES = 4; // עד כמה גוונים שונים בחלון עדיין נחשב "שטוח"

// --- 1. מפת בלוקים שטוחים ---
const bw = Math.ceil(W / BLOCK);
const bh = Math.ceil(H / BLOCK);
const flat = new Uint8Array(bw * bh);

for (let by = 0; by < bh; by++) {
  for (let bx = 0; bx < bw; bx++) {
    const shades = new Set();
    for (let y = by * BLOCK; y < Math.min(H, (by + 1) * BLOCK); y++) {
      for (let x = bx * BLOCK; x < Math.min(W, (bx + 1) * BLOCK); x++) {
        const i = (y * W + x) * 4;
        shades.add((src.data[i] << 16) | (src.data[i + 1] << 8) | src.data[i + 2]);
        if (shades.size > MAX_SHADES) break;
      }
      if (shades.size > MAX_SHADES) break;
    }
    flat[by * bw + bx] = shades.size <= MAX_SHADES ? 1 : 0;
  }
}

// --- 2. הרחבה, כדי לתפוס גם את קצוות הבלוקים ---
const grown = new Uint8Array(flat);
for (let by = 0; by < bh; by++) {
  for (let bx = 0; bx < bw; bx++) {
    if (!flat[by * bw + bx]) continue;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = bx + dx, ny = by + dy;
        if (nx >= 0 && ny >= 0 && nx < bw && ny < bh) grown[ny * bw + nx] = 1;
      }
    }
  }
}

const flatPixels = grown.reduce((a, b) => a + b, 0);

// --- 3. טשטוש התמונה כולה (קופסה, שלוש חזרות) ---
function boxBlur(data, w, h, rad) {
  let cur = Buffer.from(data);
  const tmp = Buffer.alloc(data.length);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let sr = 0, sg = 0, sb = 0, n = 0;
        for (let d = -rad; d <= rad; d++) {
          const sx = Math.min(w - 1, Math.max(0, x + d));
          const i = (y * w + sx) * 4;
          sr += cur[i]; sg += cur[i + 1]; sb += cur[i + 2]; n++;
        }
        const di = (y * w + x) * 4;
        tmp[di] = sr / n; tmp[di + 1] = sg / n; tmp[di + 2] = sb / n; tmp[di + 3] = 255;
      }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let sr = 0, sg = 0, sb = 0, n = 0;
        for (let d = -rad; d <= rad; d++) {
          const sy = Math.min(h - 1, Math.max(0, y + d));
          const i = (sy * w + x) * 4;
          sr += tmp[i]; sg += tmp[i + 1]; sb += tmp[i + 2]; n++;
        }
        const di = (y * w + x) * 4;
        cur[di] = sr / n; cur[di + 1] = sg / n; cur[di + 2] = sb / n; cur[di + 3] = 255;
      }
  }
  return cur;
}

const blurred = boxBlur(src.data, W, H, r);

// --- 4. מיזוג רק במקומות שסומנו, עם מעבר רך ---
const result = Buffer.from(src.data);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    // ממוצע של המסכה בסביבה, כדי לקבל קצה רך במקום מדרגה
    let sum = 0, n = 0;
    const bx = Math.floor(x / BLOCK), by = Math.floor(y / BLOCK);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = bx + dx, ny = by + dy;
        if (nx >= 0 && ny >= 0 && nx < bw && ny < bh) { sum += grown[ny * bw + nx]; n++; }
      }
    const alpha = n ? sum / n : 0;
    if (alpha <= 0) continue;
    const i = (y * W + x) * 4;
    for (let c = 0; c < 3; c++) {
      result[i + c] = Math.round(blurred[i + c] * alpha + result[i + c] * (1 - alpha));
    }
  }
}

writeFileSync(OUT, jpeg.encode({ data: result, width: W, height: H }, Number(QUALITY)).data);
console.log(
  `${OUT}: ${W}x${H}, הוחלקו ${flatPixels} בלוקים שטוחים (מתוך ${bw * bh})`,
);
