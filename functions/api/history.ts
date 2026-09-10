/* GET /api/history          -> רשימת הגרסאות של התוכן, מהחדשה לישנה
 * GET /api/history?sha=<sha> -> התוכן כפי שהיה באותה גרסה
 *
 * ההיסטוריה היא היסטוריית ה-git של src/content - אין טבלה ואין מסד
 * נתונים. לכן היא שורדת סגירת סשן, מכילה גם שינויים שנעשו מחוץ לפאנל,
 * ולא צריך לתחזק אותה בכלל.
 *
 * הרשימה זולה (קריאה אחת), והתוכן המלא של גרסה נטען רק כשנפתחת - כדי
 * לא לשרוף את מגבלת הקריאות של GitHub על מסך שרק מוצג. */
import type { Env } from "../../server/env";
import { error, json } from "../../server/http";
import { getSession } from "../../server/session";
import { GitHubError, listContentCommits, readFileAtRef } from "../../server/github";

const CONTENT_DIR = "src/content";
const FILES = {
  site: "src/content/site.json",
  services: "src/content/services.json",
} as const;

const DEFAULT_LIMIT = 40;
const SHA_PATTERN = /^[0-9a-f]{7,40}$/;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await getSession(env, request);
  if (!session) return error(401, "לא מחוברת");

  const url = new URL(request.url);
  const sha = url.searchParams.get("sha");

  try {
    /* --- גרסה אחת: התוכן שלה, לתצוגת השינויים ולשחזור --- */
    if (sha !== null) {
      if (!SHA_PATTERN.test(sha)) return error(400, "מזהה גרסה לא תקין");
      const [site, services] = await Promise.all([
        readFileAtRef(env, FILES.site, sha),
        readFileAtRef(env, FILES.services, sha),
      ]);
      if (site === null && services === null) return error(404, "הגרסה לא נמצאה");
      return json(200, {
        sha,
        site: site === null ? null : safeParse(site),
        services: services === null ? null : safeParse(services),
      });
    }

    /* --- רשימת הגרסאות --- */
    const limitParam = Number(url.searchParams.get("limit"));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : DEFAULT_LIMIT;
    const commits = await listContentCommits(env, CONTENT_DIR, limit);
    return json(200, { commits });
  } catch (e) {
    if (e instanceof GitHubError) return error(e.status, e.message);
    console.error(e);
    return error(500, "שגיאה בשרת");
  }
};

/** קובץ תוכן פגום בגרסה ישנה לא צריך להפיל את כל המסך */
function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
