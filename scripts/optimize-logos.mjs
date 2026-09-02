/* מקטין את קבצי הלוגו לגודל שבאמת מוצג באתר (בפי 2.5 לצורך מסכי רטינה)
   ומאפס את הפיקסלים השקופים - מה שמשפר משמעותית את דחיסת ה-PNG. */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { PNG } from "pngjs";

function resize(src, targetH) {
  const scale = targetH / src.height;
  if (scale >= 1) return src;
  const w = Math.max(1, Math.round(src.width * scale));
  const h = targetH;
  const out = new PNG({ width: w, height: h });

  // ממוצע על תיבת הפיקסלים המקורית (box filter) - איכות טובה בהקטנה
  const bx = src.width / w;
  const by = src.height / h;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      const x0 = Math.floor(x * bx), x1 = Math.min(src.width, Math.ceil((x + 1) * bx));
      const y0 = Math.floor(y * by), y1 = Math.min(src.height, Math.ceil((y + 1) * by));
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * src.width + sx) * 4;
          const sa = src.data[i + 3] / 255;
          r += src.data[i] * sa;
          g += src.data[i + 1] * sa;
          b += src.data[i + 2] * sa;
          a += src.data[i + 3];
          n++;
        }
      }
      const di = (y * w + x) * 4;
      const aa = a / n;
      const wsum = (a / 255) || 1e-6;
      out.data[di] = Math.round(r / wsum);
      out.data[di + 1] = Math.round(g / wsum);
      out.data[di + 2] = Math.round(b / wsum);
      out.data[di + 3] = Math.round(aa);
    }
  }
  return out;
}

function clean(png) {
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] === 0) {
      png.data[i] = 0;
      png.data[i + 1] = 0;
      png.data[i + 2] = 0;
    }
  }
  return png;
}

const targets = [
  ["public/logo-mark.png", 240],
  ["public/logo-name.png", 70],
  ["public/logo-tagline.png", 56],
  ["public/logo-wordmark.png", 130],
  ["public/logo-full.png", 420],
];

for (const [file, h] of targets) {
  const before = statSync(file).size;
  const png = clean(resize(PNG.sync.read(readFileSync(file)), h));
  writeFileSync(file, PNG.sync.write(png, { colorType: 6, deflateLevel: 9 }));
  const after = statSync(file).size;
  console.log(
    `${file}: ${png.width}x${png.height} · ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`,
  );
}
