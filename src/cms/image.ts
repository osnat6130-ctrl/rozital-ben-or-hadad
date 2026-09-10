/* ============================================================================
   הכנת תמונה בדפדפן לפני העלאה
   ----------------------------------------------------------------------------
   תמונה מהטלפון היא 3-6MB ו-4000px רוחב. באתר היא מוצגת ב-700px לכל
   היותר. העלאה כמו-שהיא הייתה מנפחת את הריפו ומאיטה את האתר בדיוק
   במקום שבו זה מרגיש - גלישה סלולרית.

   לכן מקטינים ודוחסים כאן, בצד הלקוח: השרת מקבל קובץ מוכן, ואין צורך
   בעיבוד תמונה ב-Worker (שאין לו את הזמן ואת הספריות לזה).
   ========================================================================== */

/** רוחב מקסימלי: התמונה הרחבה באתר מוצגת ב-~1100px, וכפול 2 למסכי רטינה */
const MAX_WIDTH = 2000;
/** גובה מקסימלי, כדי שתמונת פורטרט ארוכה לא תישאר ענקית */
const MAX_HEIGHT = 2000;
const QUALITY = 0.82;

export type PreparedImage = {
  name: string;
  contentType: string;
  base64: string;
  /** לתצוגה מקדימה מיד, לפני שהעלאה הסתיימה */
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
};

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/* ‼️ WebP לכל התמונות שמועלות מהפאנל: ~30% קטן מ-JPEG באותה איכות
   נראית, ותומך בשקיפות, כך שגם PNG יכול לעבור אליו בלי לאבד כלום.

   הבדיקה כאן היא לא פורמליות: canvas.toDataURL עם סוג שהדפדפן לא
   תומך בו **נכשל בשקט** ומחזיר PNG - בלי שגיאה. בלי הבדיקה, דפדפן
   ישן היה מעלה PNG ענק בשם קובץ .webp, והשרת היה דוחה אותו על אי
   התאמה בין הסוג לתוכן, או גרוע מזה - שומר קובץ פגום. */
function encode(canvas: HTMLCanvasElement): { dataUrl: string; contentType: string } {
  const webp = canvas.toDataURL("image/webp", QUALITY);
  if (webp.startsWith("data:image/webp")) return { dataUrl: webp, contentType: "image/webp" };
  /* דפדפן בלי WebP - חוזרים ל-JPEG, שנתמך בכל מקום */
  return { dataUrl: canvas.toDataURL("image/jpeg", QUALITY), contentType: "image/jpeg" };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("לא הצלחתי לקרוא את התמונה"));
    };
    img.src = url;
  });
}

/**
 * מקטין, דוחס, ומחזיר base64 מוכן לשליחה.
 * זורק שגיאה קריאה בעברית אם הקובץ לא תמונה או גדול מדי גם אחרי דחיסה.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) throw new Error("זה לא קובץ תמונה");

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_WIDTH / img.naturalWidth, MAX_HEIGHT / img.naturalHeight);
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("הדפדפן לא אפשר עיבוד תמונה");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const { dataUrl, contentType } = encode(canvas);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bytes = Math.floor((base64.replace(/=+$/, "").length * 3) / 4);

  if (bytes > MAX_UPLOAD_BYTES) {
    throw new Error(
      `התמונה גדולה מדי גם אחרי דחיסה (${Math.round(bytes / 1024 / 1024)}MB). נסי תמונה קטנה יותר.`,
    );
  }

  return { name: file.name, contentType, base64, dataUrl, width, height, bytes };
}

export const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;

/* ========================================================================== */

/** מגבלת קלאודפלייר על קובץ סטטי היא 25MiB. 20MB משאיר מרווח. */
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
/** מעל זה הסרטון יעבוד, אבל יאט את הדף - ולכן מזהירים */
export const VIDEO_WARN_BYTES = 8 * 1024 * 1024;

export type PreparedVideo = {
  name: string;
  contentType: string;
  base64: string;
  /** לתצוגה מקדימה מיד */
  objectUrl: string;
  /** נשמרים בתוכן כדי שיחס התצוגה יהיה נכון - סרטוני טלפון נבדלים ביניהם */
  width: number;
  height: number;
  durationSeconds: number;
  bytes: number;
};

/** קורא מידות ואורך מהסרטון עצמו, בלי לפענח אותו */
function readVideoMeta(file: File): Promise<{ width: number; height: number; duration: number; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        url,
      });
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("לא הצלחתי לקרוא את הסרטון. אפשר להעלות MP4 או WebM."));
    };
    video.src = url;
  });
}

const bytesFromBase64 = (base64: string) => Math.floor((base64.replace(/=+$/, "").length * 3) / 4);

/**
 * מכין סרטון להעלאה.
 *
 * ‼️ בלי דחיסה, במכוון: אין דרך מעשית לדחוס וידאו בדפדפן, ודחיסה
 * ב-Worker היא מחוץ לתחום (אין זמן CPU ואין ffmpeg). לכן המגבלה היא
 * גודל הקובץ כמו שהוא, וההודעה למשתמשת אומרת מה לעשות אם הוא גדול.
 */
export async function prepareVideo(file: File): Promise<PreparedVideo> {
  if (!file.type.startsWith("video/")) throw new Error("זה לא קובץ סרטון");
  if (file.type !== "video/mp4" && file.type !== "video/webm") {
    throw new Error("אפשר להעלות MP4 או WebM. פורמטים אחרים לא מנוגנים בכל הדפדפנים.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(
      `הסרטון שוקל ${formatBytes(file.size)}, והמקסימום הוא ${formatBytes(MAX_VIDEO_BYTES)}. ` +
        "אפשר לקצר אותו או לייצא אותו באיכות נמוכה יותר מהטלפון.",
    );
  }

  const meta = await readVideoMeta(file);

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("קריאת הסרטון נכשלה"));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    contentType: file.type,
    base64,
    objectUrl: meta.url,
    width: meta.width,
    height: meta.height,
    durationSeconds: Math.round(meta.duration),
    bytes: bytesFromBase64(base64),
  };
}
