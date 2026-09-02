/* מכין את תעודות ההסמכה של רוזיטל להצגה באתר.
 *
 * שני דברים קורים כאן, ושניהם חשובים:
 *   1. חיתוך - הסרת שוליים וכיתובים של אפליקציית הסריקה
 *      ("Scanned with CamScanner" / "Summarize this document").
 *   2. ‼️ הסתרת מספר תעודת הזהות - שלוש מהתעודות כוללות את ת.ז. של
 *      רוזיטל. אסור לפרסם מספר ת.ז. באתר ציבורי, ולכן מצויר מלבן אטום
 *      מעליו. מלבן אטום ולא טשטוש - טשטוש לפעמים ניתן לשחזור.
 *
 * שימוש:  node scripts/prepare-certificates.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import jpeg from "jpeg-js";

const SRC_DIR =
  "C:/Users/osnat/AppData/Local/Temp/claude/C--Users-osnat-OneDrive----------------------------------------/4400ce3d-84a3-4e65-ac30-9acb8bddaf79/scratchpad/";
const OUT_DIR = "public/images/certificates";

/** crop: [x, y, w, h] בפיקסלים של המקור. redact: מלבנים להסתרה (אחרי החיתוך). */
const CERTS = [
  { in: "cert-raw-1.jpg", out: "cert-1.jpg", crop: [8, 6, 477, 612], redact: [] },
  { in: "cert-raw-2.jpg", out: "cert-2.jpg", crop: [6, 6, 450, 608], redact: [] },
  // ת.ז. בשורה "רוזיטל בן אור חדד, ת.ז. 32224917"
  { in: "cert-raw-3.jpg", out: "cert-3.jpg", crop: [60, 8, 570, 660], redact: [[152, 302, 72, 24]] },
  { in: "cert-raw-4.jpg", out: "cert-4.jpg", crop: [6, 6, 454, 606], redact: [] },
  // ת.ז. בשורה "לגב' בן-אור חדד רוזיטל ת.ז. 032224917"
  { in: "cert-raw-5.jpg", out: "cert-5.jpg", crop: [6, 6, 454, 588], redact: [[54, 225, 110, 28]] },
  // ת.ז. מתחת לשם
  { in: "cert-raw-6.jpg", out: "cert-6.jpg", crop: [6, 6, 457, 610], redact: [[176, 200, 100, 22]] },
];

mkdirSync(OUT_DIR, { recursive: true });

for (const cert of CERTS) {
  const src = jpeg.decode(readFileSync(SRC_DIR + cert.in), { useTArray: true });
  const [cx, cy, cw, ch] = cert.crop;
  const w = Math.min(cw, src.width - cx);
  const h = Math.min(ch, src.height - cy);

  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((cy + y) * src.width + (cx + x)) * 4;
      const di = (y * w + x) * 4;
      data[di] = src.data[si];
      data[di + 1] = src.data[si + 1];
      data[di + 2] = src.data[si + 2];
      data[di + 3] = 255;
    }
  }

  // מלבן אטום מעל מספר תעודת הזהות
  for (const [rx, ry, rw, rh] of cert.redact) {
    for (let y = ry; y < Math.min(ry + rh, h); y++) {
      for (let x = rx; x < Math.min(rx + rw, w); x++) {
        const di = (y * w + x) * 4;
        data[di] = 26;
        data[di + 1] = 32;
        data[di + 2] = 36;
        data[di + 3] = 255;
      }
    }
  }

  writeFileSync(`${OUT_DIR}/${cert.out}`, jpeg.encode({ data, width: w, height: h }, 88).data);
  console.log(`${cert.out}: ${w}x${h}${cert.redact.length ? " (ת.ז. הוסתרה)" : ""}`);
}
