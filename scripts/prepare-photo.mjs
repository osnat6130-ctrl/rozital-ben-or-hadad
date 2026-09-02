/* מכין תמונה אמיתית לאתר: חיתוך ליחס הנדרש, הקטנה לגודל שבאמת מוצג, ודחיסה.
 *
 * שימוש:
 *   node scripts/prepare-photo.mjs <קלט> <פלט> <יחס> <רוחב-מקסימלי> [איכות] [מיקוד]
 *
 * דוגמה (כרטיס בדף הבית, יחס 4:3, רוחב 900):
 *   node scripts/prepare-photo.mjs "C:/temp/photo.jpg" public/images/lectures-card.jpg 4:3 900
 *
 * "מיקוד" הוא מיקום החיתוך האופקי בין 0 (הצמדה לשמאל) ל-1 (הצמדה לימין).
 * ברירת מחדל 0.5 = מהמרכז.
 */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

/** קורא JPEG או PNG לפי החתימה של הקובץ (ולא לפי הסיומת, שלפעמים שגויה) */
function decodeImage(file) {
  const buf = readFileSync(file);
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (isPng) {
    const png = PNG.sync.read(buf);
    return { width: png.width, height: png.height, data: png.data };
  }
  return jpeg.decode(buf, { useTArray: true });
}

const [, , SRC, OUT, ASPECT = "4:3", MAX_W = "900", QUALITY = "82", FOCUS = "0.5"] = process.argv;

if (!SRC || !OUT) {
  console.error("חסרים פרמטרים. ראו את ההסבר בראש הקובץ.");
  process.exit(1);
}

const [aw, ah] = ASPECT.split(":").map(Number);
const maxW = Number(MAX_W);
const quality = Number(QUALITY);
const focus = Math.min(1, Math.max(0, Number(FOCUS)));

const src = decodeImage(SRC);

// --- חיתוך ליחס המבוקש ---
const targetRatio = aw / ah;
let cropW = src.width;
let cropH = Math.round(src.width / targetRatio);
if (cropH > src.height) {
  cropH = src.height;
  cropW = Math.round(src.height * targetRatio);
}
// "focus" חל על הציר שבו מתבצע החיתוך בפועל:
// תמונה רחבה מדי -> חיתוך אופקי, תמונה גבוהה מדי -> חיתוך אנכי.
// בפורטרט זה קריטי: 0.5 יחתוך את הראש, ערך נמוך יותר משאיר אוויר מעל.
const cropX = Math.round((src.width - cropW) * (src.width > cropW ? focus : 0.5));
const cropY = Math.round((src.height - cropH) * (src.height > cropH ? focus : 0.5));

// --- הקטנה (box filter - איכות טובה בהקטנה) ---
const outW = Math.min(maxW, cropW);
const outH = Math.round((outW / cropW) * cropH);
const data = Buffer.alloc(outW * outH * 4);
const bx = cropW / outW;
const by = cropH / outH;

for (let y = 0; y < outH; y++) {
  const y0 = cropY + Math.floor(y * by);
  const y1 = cropY + Math.min(cropH, Math.ceil((y + 1) * by));
  for (let x = 0; x < outW; x++) {
    const x0 = cropX + Math.floor(x * bx);
    const x1 = cropX + Math.min(cropW, Math.ceil((x + 1) * bx));
    let r = 0, g = 0, b = 0, n = 0;
    for (let sy = y0; sy < y1; sy++) {
      for (let sx = x0; sx < x1; sx++) {
        const i = (sy * src.width + sx) * 4;
        r += src.data[i];
        g += src.data[i + 1];
        b += src.data[i + 2];
        n++;
      }
    }
    const di = (y * outW + x) * 4;
    data[di] = Math.round(r / n);
    data[di + 1] = Math.round(g / n);
    data[di + 2] = Math.round(b / n);
    data[di + 3] = 255;
  }
}

writeFileSync(OUT, jpeg.encode({ data, width: outW, height: outH }, quality).data);

const before = (statSync(SRC).size / 1024).toFixed(0);
const after = (statSync(OUT).size / 1024).toFixed(0);
console.log(
  `${OUT}: ${src.width}x${src.height} (${before}KB) -> ${outW}x${outH} (${after}KB), יחס ${ASPECT}`,
);
