/* מחלץ את הלוגו המקורי מקובץ ה-JPEG והופך את הרקע הלבן לשקוף.
   פלט: logo-mark.png (הנורה), logo-wordmark.png (השם + הסלוגן), logo-full.png (הכול) */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

const [, , SRC, OUT] = process.argv;

const raw = jpeg.decode(readFileSync(SRC), { useTArray: true });
const { width: W, height: H, data } = raw;

// --- 1. חישוב שקיפות: לבן -> שקוף, עם מעבר רך לקצוות ---
// t0 = מרחק מלבן שממנו מתחילים לראות פיקסל, t1 = מרחק שממנו הפיקסל אטום לגמרי
const T0 = 16;
const T1 = 60;

const alpha = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const r = data[i * 4],
    g = data[i * 4 + 1],
    b = data[i * 4 + 2];
  const d = 255 - Math.min(r, g, b); // מרחק מלבן
  let a = (d - T0) / (T1 - T0);
  a = a < 0 ? 0 : a > 1 ? 1 : a;
  alpha[i] = Math.round(a * 255);
}

// --- 2. איתור רצועות התוכן (נורה / שם / סלוגן) ---
const INK = 60;
const rowInk = new Int32Array(H);
for (let y = 0; y < H; y++) {
  let c = 0;
  for (let x = 0; x < W; x++) if (alpha[y * W + x] > INK) c++;
  rowInk[y] = c;
}

const bands = [];
let start = -1;
const GAP = 3; // רצועות שמופרדות בפחות מזה נחשבות לאותה רצועה
for (let y = 0; y <= H; y++) {
  const inked = y < H && rowInk[y] > 3;
  if (inked && start === -1) start = y;
  if (!inked && start !== -1) {
    const last = bands[bands.length - 1];
    if (last && start - last[1] < GAP) last[1] = y - 1;
    else bands.push([start, y - 1]);
    start = -1;
  }
}

console.log(
  "רצועות שזוהו:",
  bands.map(([a, b]) => `${a}-${b} (גובה ${b - a + 1})`).join(" | "),
);

function colExtent(y0, y1) {
  let x0 = W,
    x1 = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = 0; x < W; x++) {
      if (alpha[y * W + x] > INK) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
      }
    }
  }
  return [x0, x1];
}

function crop(y0, y1, pad = 6, name, padTop = pad, padBottom = pad) {
  const [cx0, cx1] = colExtent(y0, y1);
  const x0 = Math.max(0, cx0 - pad);
  const x1 = Math.min(W - 1, cx1 + pad);
  const ny0 = Math.max(0, y0 - padTop);
  const ny1 = Math.min(H - 1, y1 + padBottom);
  const w = x1 - x0 + 1;
  const h = ny1 - ny0 + 1;

  const png = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = (ny0 + y) * W + (x0 + x);
      const di = (y * w + x) * 4;
      png.data[di] = data[si * 4];
      png.data[di + 1] = data[si * 4 + 1];
      png.data[di + 2] = data[si * 4 + 2];
      png.data[di + 3] = alpha[si];
    }
  }

  const file = join(OUT, name);
  writeFileSync(file, PNG.sync.write(png, { colorType: 6 }));
  console.log(`${name}: ${w}x${h}`);
  return { w, h };
}

if (bands.length < 2) throw new Error("לא זוהו מספיק רצועות בלוגו");

const markBand = bands[0];
const textStart = bands[1][0];
const textEnd = bands[bands.length - 1][1];

crop(markBand[0], markBand[1], 6, "logo-mark.png");
if (bands.length >= 3) {
  crop(bands[1][0], bands[1][1], 5, "logo-name.png");
  crop(bands[2][0], bands[bands.length - 1][1], 5, "logo-tagline.png");
}
crop(textStart, textEnd, 8, "logo-wordmark.png");
// --- פיצול רצועת הטקסט לשם ולסלוגן, לפי השורה ה'ריקה' ביותר באמצע ---
function splitBand([y0, y1]) {
  const from = Math.round(y0 + (y1 - y0) * 0.25);
  const to = Math.round(y0 + (y1 - y0) * 0.75);
  let best = from, bestInk = Infinity;
  for (let y = from; y <= to; y++) {
    if (rowInk[y] < bestInk) { bestInk = rowInk[y]; best = y; }
  }
  return best;
}

if (bands.length === 2) {
  const cut = splitBand(bands[1]);
  console.log('נקודת הפיצול בין השם לסלוגן:', cut);
  crop(bands[1][0], cut, 5, 'logo-name.png', 5, 0);
  crop(cut + 2, bands[1][1], 5, 'logo-tagline.png', 0, 5);
}

crop(markBand[0], textEnd, 10, "logo-full.png");
