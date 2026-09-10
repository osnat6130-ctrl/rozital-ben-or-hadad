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

/** PNG נשמר כ-PNG כדי לא לאבד שקיפות; כל השאר הופך ל-JPEG */
function targetType(file: File): string {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
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

  const type = targetType(file);
  const dataUrl = canvas.toDataURL(type, QUALITY);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bytes = Math.floor((base64.replace(/=+$/, "").length * 3) / 4);

  if (bytes > MAX_UPLOAD_BYTES) {
    throw new Error(
      `התמונה גדולה מדי גם אחרי דחיסה (${Math.round(bytes / 1024 / 1024)}MB). נסי תמונה קטנה יותר.`,
    );
  }

  return { name: file.name, contentType: type, base64, dataUrl, width, height, bytes };
}

export const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;
