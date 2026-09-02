/* מטשטש אזורים עגולים בתמונה (פנים), בטשטוש רך במקום פיקסלים מרובעים.
 *
 * שימוש:
 *   node scripts/blur-faces.mjs <קלט> <פלט> "cx,cy,rx,ry cx,cy,rx,ry ..." [עוצמה] [איכות]
 *
 * הקואורדינטות הן בפיקסלים של תמונת המקור.
 * "עוצמה" = רדיוס הטשטוש בפיקסלים (ברירת מחדל 14).
 *
 * ‼️ אפשר לתת לכל אזור עוצמה משלו בערך חמישי: "cx,cy,rx,ry,עוצמה".
 *    זה חשוב: בתמונה עם פנים בגדלים שונים אין להריץ את הסקריפט כמה
 *    פעמים ברצף - כל הרצה מקודדת מחדש את ה-JPEG ומצטברים ריבועי דחיסה
 *    על כל התמונה. עדיף מעבר אחד עם עוצמה פרטנית לכל אזור.
 */
import { readFileSync, writeFileSync } from "node:fs";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

const [, , SRC, OUT, REGIONS, STRENGTH = "14", QUALITY = "88"] = process.argv;

function decodeImage(file) {
  const buf = readFileSync(file);
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    const png = PNG.sync.read(buf);
    return { width: png.width, height: png.height, data: png.data };
  }
  return jpeg.decode(buf, { useTArray: true });
}

const src = decodeImage(SRC);
const W = src.width;
const H = src.height;
const radius = Number(STRENGTH);

const regions = REGIONS.trim()
  .split(/\s+/)
  .filter(Boolean)
  .map((r) => {
    const [cx, cy, rx, ry, strength] = r.split(",").map(Number);
    return { cx, cy, rx, ry, r: Number.isFinite(strength) ? strength : radius };
  });

/** טשטוש קופסה חוזר - שלוש חזרות נותנות תוצאה קרובה לגאוסיאני */
function boxBlur(data, w, h, r) {
  const out = Buffer.from(data);
  const tmp = Buffer.alloc(data.length);

  for (let pass = 0; pass < 3; pass++) {
    // מעבר אופקי
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sr = 0, sg = 0, sb = 0, n = 0;
        for (let dx = -r; dx <= r; dx++) {
          const sx = Math.min(w - 1, Math.max(0, x + dx));
          const i = (y * w + sx) * 4;
          sr += out[i]; sg += out[i + 1]; sb += out[i + 2]; n++;
        }
        const di = (y * w + x) * 4;
        tmp[di] = sr / n; tmp[di + 1] = sg / n; tmp[di + 2] = sb / n; tmp[di + 3] = 255;
      }
    }
    // מעבר אנכי
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sr = 0, sg = 0, sb = 0, n = 0;
        for (let dy = -r; dy <= r; dy++) {
          const sy = Math.min(h - 1, Math.max(0, y + dy));
          const i = (sy * w + x) * 4;
          sr += tmp[i]; sg += tmp[i + 1]; sb += tmp[i + 2]; n++;
        }
        const di = (y * w + x) * 4;
        out[di] = sr / n; out[di + 1] = sg / n; out[di + 2] = sb / n; out[di + 3] = 255;
      }
    }
  }
  return out;
}

// מטשטשים את התיבה התוחמת של כל אזור בלבד - חוסך זמן על תמונה גדולה
const result = Buffer.from(src.data);

for (const { cx, cy, rx, ry, r: regionRadius } of regions) {
  const pad = regionRadius * 3;
  const x0 = Math.max(0, Math.floor(cx - rx - pad));
  const y0 = Math.max(0, Math.floor(cy - ry - pad));
  const x1 = Math.min(W, Math.ceil(cx + rx + pad));
  const y1 = Math.min(H, Math.ceil(cy + ry + pad));
  const bw = x1 - x0;
  const bh = y1 - y0;
  if (bw <= 0 || bh <= 0) continue;

  // חיתוך האזור
  const patch = Buffer.alloc(bw * bh * 4);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const si = ((y0 + y) * W + (x0 + x)) * 4;
      const di = (y * bw + x) * 4;
      patch[di] = src.data[si];
      patch[di + 1] = src.data[si + 1];
      patch[di + 2] = src.data[si + 2];
      patch[di + 3] = 255;
    }
  }

  const blurred = boxBlur(patch, bw, bh, regionRadius);

  // מיזוג חזרה עם קצה רך (האליפסה דוהה בין 75% ל-100% מהרדיוס)
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const px = x0 + x;
      const py = y0 + y;
      const d = Math.sqrt(((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2);
      if (d >= 1) continue;
      // הטשטוש מלא כמעט עד השוליים, ומתרכך רק ב-12% האחרונים.
      // קצה רך מדי משאיר את קווי המתאר של הפנים קריאים בהיקף.
      const alpha = d <= 0.88 ? 1 : 1 - (d - 0.88) / 0.12;
      const si = (y * bw + x) * 4;
      const di = (py * W + px) * 4;
      for (let c = 0; c < 3; c++) {
        result[di + c] = Math.round(blurred[si + c] * alpha + result[di + c] * (1 - alpha));
      }
    }
  }
}

writeFileSync(
  OUT,
  jpeg.encode({ data: result, width: W, height: H }, Number(QUALITY)).data,
);
console.log(`${OUT}: ${W}x${H}, טושטשו ${regions.length} אזורים ברדיוס ${radius}`);
