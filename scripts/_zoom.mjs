/* עזר זמני: חותך אזור, מגדיל ומצייר רשת קואורדינטות. למחוק אחרי השימוש. */
import { readFileSync, writeFileSync } from "node:fs";
import jpeg from "jpeg-js";
const [, , SRC, OUT, X0, Y0, X1, Y1, STEP = "50"] = process.argv;
const src = jpeg.decode(readFileSync(SRC), { useTArray: true });
const x0 = Number(X0), y0 = Number(Y0), x1 = Number(X1), y1 = Number(Y1);
const bw = x1 - x0, bh = y1 - y0;
const scale = Math.max(1, Math.min(3, Math.floor(1200 / bw)));
const W = bw * scale, H = bh * scale;
const out = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const si = ((y0 + Math.floor(y / scale)) * src.width + (x0 + Math.floor(x / scale))) * 4;
  const di = (y * W + x) * 4;
  out[di] = src.data[si]; out[di+1] = src.data[si+1]; out[di+2] = src.data[si+2]; out[di+3] = 255;
}
const step = Number(STEP) * scale;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (x % step !== 0 && y % step !== 0) continue;
  const di = (y * W + x) * 4;
  out[di] = 255; out[di+1] = 0; out[di+2] = 0;
}
writeFileSync(OUT, jpeg.encode({ data: out, width: W, height: H }, 90).data);
console.log(`${OUT}: ${W}x${H}, x ${x0}-${x1}, y ${y0}-${y1}, רשת כל ${STEP}px, הגדלה x${scale}`);
