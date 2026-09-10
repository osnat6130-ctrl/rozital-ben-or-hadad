/* ============================================================================
   המרת התמונות שבריפו ל-WebP
   ----------------------------------------------------------------------------
   שימוש:
     node scripts/to-webp.mjs            # המרה + עדכון הנתיבים בקובצי התוכן
     node scripts/to-webp.mjs --dry-run  # רק מדווח מה יקרה

   WebP שוקל בערך שליש פחות מ-JPEG באותה איכות נראית, וזה נמדד ישירות
   ב-Core Web Vitals: התמונה הראשית היא ה-LCP של כל עמוד כאן.

   ‼️ למה נשמר גם עותק JPEG לתמונות השיתוף:
   וואטסאפ הוא ערוץ ההמרה המרכזי באתר הזה, והתמיכה שלו ב-WebP בתצוגה
   מוקדמת של קישור לא עקבית בין מכשירים. תמונה שלא נטענת בתצוגה
   המוקדמת פירושה קישור בלי תמונה, ולכן כל תמונה שמשמשת כ-og:image
   (ה-hero של כל תחום, תמונת האודות, והלוגו) נשארת גם כ-JPEG.
   scripts/prerender.mjs מעדיף את התאום ה-JPEG כשהוא קיים.

   העלאות מהפאנל ממילא מומרות ל-WebP בדפדפן לפני השליחה (src/cms/image.ts),
   ולכן הסקריפט הזה נוגע רק בתמונות שהיו בריפו מלפני זה. הוא אידמפוטנטי:
   קובץ שכבר הומר ומעודכן נדלג עליו.
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";

/* ‼️ sharp לא מוצהר כתלות של הפרויקט במכוון: הוא כבד (עשרות MB), הוא
   נחוץ רק לסקריפט התחזוקה הזה, והבנייה בקלאודפלייר הייתה מתקינה אותו
   בכל פריסה בחינם. הוא מגיע ממילא דרך wrangler, ואם לא - ההודעה כאן
   אומרת בדיוק מה לעשות. */
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("צריך את sharp כדי להמיר תמונות. להתקין פעם אחת:  npm i -D sharp");
  process.exit(1);
}

const DRY = process.argv.includes("--dry-run");
const IMAGES = "public/images";
const CONTENT = ["src/content/site.json", "src/content/services.json"];
const QUALITY = 82;

/* התמונות שנשארות גם כ-JPEG - נגזר מקובצי התוכן ולא נכתב ביד, כדי
   שהוספת תחום חדש לא תשכח את התאום.
   ‼️ בלי הסיומת. הריצה הראשונה משנה את הנתיבים בקובץ התוכן ל-.webp,
   ולכן השוואה לפי נתיב מלא הפסיקה להתאים בריצה השנייה - והסקריפט מחק
   בדיוק את התאומים שהוא היה אמור לשמור. */
function shareImages() {
  const site = JSON.parse(fs.readFileSync("src/content/site.json", "utf8"));
  const services = JSON.parse(fs.readFileSync("src/content/services.json", "utf8"));
  return new Set(
    [
      site.site.heroImage,
      site.about.pageImage,
      site.about.image,
      ...services.map((s) => s.heroImage),
      ...services.map((s) => s.cardImage),
    ]
      .filter(Boolean)
      .map((p) => stripExtension(p.replace(/^\//, ""))),
  );
}

const stripExtension = (file) => file.replace(/\.[^.]+$/, "");

/** נתיב ציבורי בלי סיומת: public\images\yoga-hero.jpg -> images/yoga-hero */
const withoutExtension = (file) =>
  stripExtension(file.replace(/\\/g, "/").replace(/^public\//, ""));

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

const share = shareImages();
const sources = walk(IMAGES).filter((f) => /\.(jpe?g|png)$/i.test(f));

let converted = 0;
let skipped = 0;
let savedBytes = 0;

for (const source of sources) {
  const target = source.replace(/\.(jpe?g|png)$/i, ".webp");
  const originalSize = fs.statSync(source).size;

  if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs) {
    skipped++;
    continue;
  }

  if (DRY) {
    console.log(`יומר: ${source}`);
    converted++;
    continue;
  }

  await sharp(source).webp({ quality: QUALITY }).toFile(target);
  const newSize = fs.statSync(target).size;

  /* ‼️ אם ה-WebP יצא גדול יותר - וזה קורה בתמונות קטנות ובגרפיקה
     שטוחה - מוחקים אותו ומשאירים את המקור. "המרה" שמנפחת קובץ היא
     נזק, לא אופטימיזציה. */
  if (newSize >= originalSize) {
    fs.unlinkSync(target);
    console.log(`נשאר JPEG (WebP יצא גדול יותר): ${path.basename(source)}`);
    skipped++;
    continue;
  }

  savedBytes += originalSize - newSize;
  converted++;
  const keep = share.has(withoutExtension(source));
  console.log(
    `${path.basename(source)}: ${Math.round(originalSize / 1024)}KB -> ${Math.round(newSize / 1024)}KB${
      keep ? "  (המקור נשמר כתמונת שיתוף)" : ""
    }`,
  );
}

/* --- עדכון הנתיבים בקובצי התוכן --- */
let rewritten = 0;
if (!DRY) {
  for (const file of CONTENT) {
    const before = fs.readFileSync(file, "utf8");
    const after = before.replace(/"(\/images\/[^"]+?)\.(jpe?g|png)"/gi, (match, base, extension) => {
      const webp = path.join("public", `${base}.webp`);
      if (!fs.existsSync(webp)) return match; // לא הומר - הנתיב נשאר
      rewritten++;
      return `"${base}.webp"`;
    });
    if (after !== before) {
      JSON.parse(after); // רשת ביטחון: לא כותבים JSON שבור
      fs.writeFileSync(file, after);
    }
  }
}

/* --- מחיקת המקורות שאין להם עוד שימוש --- */
let removed = 0;
if (!DRY) {
  const content = CONTENT.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  for (const source of sources) {
    const posix = source.replace(/\\/g, "/").replace(/^public\//, "");
    if (share.has(withoutExtension(source))) continue; // תאום לשיתוף - נשמר
    if (!fs.existsSync(source.replace(/\.(jpe?g|png)$/i, ".webp"))) continue; // לא הומר
    if (content.includes(`/${posix}`)) continue; // עוד מוזכר איפשהו
    fs.unlinkSync(source);
    removed++;
  }
}

console.log("");
console.log(`הומרו: ${converted}${DRY ? " (הרצה יבשה, לא נכתב כלום)" : ""}`);
console.log(`נדלגו: ${skipped}`);
if (!DRY) {
  console.log(`נתיבים שעודכנו בקובצי התוכן: ${rewritten}`);
  console.log(`מקורות שנמחקו: ${removed}`);
  console.log(`נחסך: ${(savedBytes / 1024 / 1024).toFixed(2)}MB`);
}
