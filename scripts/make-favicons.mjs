/* יוצר אייקונים לדפדפן מתוך הסמל המקורי של הלוגו */
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const src = PNG.sync.read(readFileSync("public/logo-mark.png"));

function make({ size, pad, bg, out, radius = 0 }) {
  const png = new PNG({ width: size, height: size });
  const inner = size - pad * 2;
  const scale = Math.min(inner / src.width, inner / src.height);
  const dw = Math.round(src.width * scale);
  const dh = Math.round(src.height * scale);
  const ox = Math.round((size - dw) / 2);
  const oy = Math.round((size - dh) / 2);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const di = (y * size + x) * 4;
      let br = 0, bgc = 0, bb = 0, ba = 0;

      if (bg) {
        // פינות מעוגלות
        const rx = Math.min(x, size - 1 - x);
        const ry = Math.min(y, size - 1 - y);
        let inside = true;
        if (radius && rx < radius && ry < radius) {
          const dx = radius - rx, dy = radius - ry;
          inside = dx * dx + dy * dy <= radius * radius;
        }
        if (inside) { [br, bgc, bb] = bg; ba = 255; }
      }

      // דגימת הסמל
      let sr = 0, sg = 0, sb = 0, sa = 0;
      if (x >= ox && x < ox + dw && y >= oy && y < oy + dh) {
        const sx = Math.min(src.width - 1, Math.floor((x - ox) / scale));
        const sy = Math.min(src.height - 1, Math.floor((y - oy) / scale));
        const si = (sy * src.width + sx) * 4;
        sr = src.data[si]; sg = src.data[si + 1]; sb = src.data[si + 2]; sa = src.data[si + 3];
      }

      const a = sa / 255;
      png.data[di] = Math.round(sr * a + br * (1 - a));
      png.data[di + 1] = Math.round(sg * a + bgc * (1 - a));
      png.data[di + 2] = Math.round(sb * a + bb * (1 - a));
      png.data[di + 3] = Math.round(255 * a + ba * (1 - a));
    }
  }

  writeFileSync(out, PNG.sync.write(png, { colorType: 6 }));
  console.log(`${out}: ${size}x${size}`);
}

// אייקון לשונית - רקע שקוף
make({ size: 128, pad: 6, bg: null, out: "public/favicon.png" });
// אייקון ל-iOS - חייב רקע אטום
make({ size: 180, pad: 22, bg: [30, 142, 158], radius: 40, out: "public/apple-touch-icon.png" });
