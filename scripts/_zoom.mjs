import { readFileSync, writeFileSync } from "node:fs";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
const [, , SRC, OUT, x0, y0, x1, y1, S = "2"] = process.argv;
const img = jpeg.decode(readFileSync(SRC), { useTArray: true });
const X0 = +x0, Y0 = +y0, X1 = Math.min(img.width, +x1), Y1 = Math.min(img.height, +y1), s = +S;
const w = (X1 - X0) * s, h = (Y1 - Y0) * s;
const png = new PNG({ width: w, height: h });
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const si = ((Y0 + Math.floor(y / s)) * img.width + (X0 + Math.floor(x / s))) * 4, di = (y * w + x) * 4;
  png.data[di] = img.data[si]; png.data[di + 1] = img.data[si + 1]; png.data[di + 2] = img.data[si + 2]; png.data[di + 3] = 255;
}
const line = (i) => { png.data[i] = 255; png.data[i + 1] = 0; png.data[i + 2] = 0; };
for (let gx = Math.ceil(X0 / 50) * 50; gx < X1; gx += 50) { const x = (gx - X0) * s; for (let y = 0; y < h; y++) line((y * w + x) * 4); }
for (let gy = Math.ceil(Y0 / 50) * 50; gy < Y1; gy += 50) { const y = (gy - Y0) * s; for (let x = 0; x < w; x++) line((y * w + x) * 4); }
writeFileSync(OUT, PNG.sync.write(png));
console.log(`${OUT}: origin ${X0},${Y0} x${s} (${w}x${h}) grid 50px`);
