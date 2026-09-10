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

/** סוגים שהדפדפן יודע לדחוס והאתר יודע להציג */
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** אחרי דחיסה בדפדפן תמונה סבירה שוקלת מתחת ל-500KB. 4MB זה מרווח
 *  נדיב שגם עוצר קובץ שהגיע בטעות בלי דחיסה. */
const MAX_BYTES = 4 * 1024 * 1024;

const DIR = "public/images";

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

  const extension = ALLOWED[contentType];
  if (!extension) return error(400, "אפשר להעלות תמונות JPG, PNG או WebP בלבד");
  if (!base64) return error(400, "לא הגיעה תמונה");

  /* base64 מנפח בשליש, ולכן מודדים את הגודל האמיתי אחרי הפענוח */
  const bytes = Math.floor((base64.replace(/=+$/, "").length * 3) / 4);
  if (bytes > MAX_BYTES) {
    return error(413, `התמונה גדולה מדי (${Math.round(bytes / 1024 / 1024)}MB). המקסימום הוא 4MB.`);
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return error(400, "התמונה לא הגיעה בפורמט תקין");

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
      .slice(0, 40) || "image";
  const unique = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const filename = `${slug}-${unique}.${extension}`;

  try {
    const author = { name: session.name, email: `${session.username}@rozital-admin.local` };
    await writeBinaryFile(env, `${DIR}/${filename}`, base64, `[פאנל] העלאת תמונה: ${filename}`, author);
    /* הנתיב שנשמר בתוכן הוא ציבורי ולא נתיב בריפו */
    return json(200, { path: `/images/${filename}` });
  } catch (e) {
    if (e instanceof GitHubError) return error(e.status, e.message);
    console.error(e);
    return error(500, "שגיאה בשרת");
  }
};
