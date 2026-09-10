/* POST /api/asset  { name, contentType, base64 }
 *   -> { path: "/images/<file>" }
 *
 * מעלה תמונה ל-public/images בריפו כ-commit, ומחזיר את הנתיב הציבורי
 * שנשמר בקובץ התוכן. הדחיסה נעשית בדפדפן לפני השליחה (ראו
 * src/cms/image.ts) - כאן רק מאמתים ושומרים.
 *
 * זו הנקודה היחידה בפאנל שמקבלת קובץ מבחוץ, ולכן האימות כאן הדוק:
 * סוג מותר, גודל מוגבל, ושם קובץ שנבנה מחדש ולא מתקבל כמו שהוא. */
import type { Env } from "../../server/env";
import { error, json, readJson } from "../../server/http";
import { getSession } from "../../server/session";
import { GitHubError, writeBinaryFile } from "../../server/github";

/** סוגים שהאתר יודע להציג. התיקייה והמגבלה נגזרות מהסוג. */
const ALLOWED: Record<string, { extension: string; dir: string; maxBytes: number }> = {
  /* תמונות נדחסות בדפדפן לפני השליחה ויוצאות מתחת ל-500KB. 4MB זה
     מרווח נדיב שגם עוצר קובץ שהגיע בטעות בלי דחיסה. */
  "image/jpeg": { extension: "jpg", dir: "public/images", maxBytes: 4 * 1024 * 1024 },
  "image/png": { extension: "png", dir: "public/images", maxBytes: 4 * 1024 * 1024 },
  "image/webp": { extension: "webp", dir: "public/images", maxBytes: 4 * 1024 * 1024 },
  /* ‼️ וידאו לא נדחס בדפדפן - אין לזה דרך מעשית. המגבלה כאן היא של
     קלאודפלייר עצמה: היא לא מגישה קובץ סטטי מעל 25MiB. 20MB משאיר
     מרווח, ומעבר לזה הסרטון גם ממילא כבד מדי לאתר. */
  "video/mp4": { extension: "mp4", dir: "public/videos", maxBytes: 20 * 1024 * 1024 },
  "video/webm": { extension: "webm", dir: "public/videos", maxBytes: 20 * 1024 * 1024 },
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const session = await getSession(env, request);
  if (!session) return error(401, "לא מחוברת");

  let body: { name?: unknown; contentType?: unknown; base64?: unknown };
  try {
    body = await readJson(request);
  } catch {
    return error(400, "בקשה לא תקינה");
  }

  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const base64 = typeof body.base64 === "string" ? body.base64 : "";
  const rawName = typeof body.name === "string" ? body.name : "";

  const kind = ALLOWED[contentType];
  if (!kind) return error(400, "אפשר להעלות תמונות JPG, PNG, WebP או סרטוני MP4, WebM בלבד");
  if (!base64) return error(400, "לא הגיע קובץ");
  const { extension, dir, maxBytes } = kind;
  const isVideo = contentType.startsWith("video/");

  /* base64 מנפח בשליש, ולכן מודדים את הגודל האמיתי אחרי הפענוח */
  const bytes = Math.floor((base64.replace(/=+$/, "").length * 3) / 4);
  if (bytes > maxBytes) {
    const what = isVideo ? "הסרטון" : "התמונה";
    return error(
      413,
      `${what} גדול מדי (${Math.round(bytes / 1024 / 1024)}MB). המקסימום הוא ${Math.round(maxBytes / 1024 / 1024)}MB.`,
    );
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return error(400, "הקובץ לא הגיע בפורמט תקין");

  /* שם הקובץ נבנה מחדש ולא מתקבל כמו שהוא: מונע ../ , ומונע דריסה של
     תמונה קיימת כשמעלים קובץ עם אותו שם.
     נשמרות רק אותיות אנגליות וספרות - שם קובץ בעברית דורש קידוד אחוזים
     בכתובת ושובר חלק מהכלים, ולכן קובץ בשם עברי מקבל את הקידומת
     "image" ומזוהה לפי המזהה הייחודי. */
  const slug =
    rawName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || (isVideo ? "video" : "image");
  const unique = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const filename = `${slug}-${unique}.${extension}`;

  try {
    const author = { name: session.name, email: `${session.username}@rozital-admin.local` };
    const label = isVideo ? "סרטון" : "תמונה";
    await writeBinaryFile(env, `${dir}/${filename}`, base64, `[פאנל] העלאת ${label}: ${filename}`, author);
    /* הנתיב שנשמר בתוכן הוא ציבורי ולא נתיב בריפו */
    return json(200, { path: `/${dir.replace(/^public\//, "")}/${filename}` });
  } catch (e) {
    if (e instanceof GitHubError) return error(e.status, e.message);
    console.error(e);
    return error(500, "שגיאה בשרת");
  }
};
