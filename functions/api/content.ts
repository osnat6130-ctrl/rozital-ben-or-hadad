/* GET /api/content  -> התוכן העדכני מהריפו + sha לכל קובץ
 * PUT /api/content  -> שמירה: אימות, commit לכל קובץ שהשתנה, sha חדש
 *
 * הקריאה היא מהריפו (ולא מהבנייה) כדי שהפאנל תמיד יערוך את הגרסה
 * האחרונה שנשמרה, גם אם Cloudflare עדיין באמצע פרסום. */
import type { Env } from "../../server/env";
import { error, json, readJson } from "../../server/http";
import { getSession } from "../../server/session";
import { GitHubError, readFile, writeFile } from "../../server/github";
import { savePayloadSchema } from "../../server/schema";

const FILES = {
  site: "src/content/site.json",
  services: "src/content/services.json",
} as const;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await getSession(env, request);
  if (!session) return error(401, "לא מחוברת");
  try {
    const [site, services] = await Promise.all([readFile(env, FILES.site), readFile(env, FILES.services)]);
    return json(200, {
      site: JSON.parse(site.text),
      services: JSON.parse(services.text),
      shas: { site: site.sha, services: services.sha },
    });
  } catch (e) {
    return toErrorResponse(e);
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const session = await getSession(env, request);
  if (!session) return error(401, "לא מחוברת");

  try {
    // חשוב: zod משמש לאימות בלבד. כותבים את האובייקט המקורי ולא את
    // parsed.data, כי zod בונה אובייקט חדש ומשנה את סדר המפתחות - וזה
    // היה הופך שינוי של שורה אחת ל-diff של כל הקובץ, ומקלקל את ההיסטוריה.
    const raw = await readJson<Record<string, unknown>>(request);
    const parsed = savePayloadSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return error(400, `תוכן לא תקין: ${issue.path.join(".")} - ${issue.message}`);
    }
    const { message, shas } = parsed.data;
    const site = raw.site as unknown;
    const services = raw.services as unknown;
    if (!site && !services) return error(400, "אין מה לשמור");

    const author = { name: session.name, email: `${session.username}@rozital-admin.local` };
    const commitMessage = `[פאנל] ${message}`;
    const result: Record<string, { sha: string; commitUrl: string }> = {};

    // שני הקבצים נשמרים בזה אחר זה כדי שכל אחד יקבל commit משלו בהיסטוריה
    if (site) {
      const out = await writeFile(
        env,
        FILES.site,
        JSON.stringify(site, null, 2) + "\n",
        shas.site,
        commitMessage,
        author,
      );
      result.site = { sha: out.sha, commitUrl: out.commitUrl };
    }
    if (services) {
      const out = await writeFile(
        env,
        FILES.services,
        JSON.stringify(services, null, 2) + "\n",
        shas.services,
        commitMessage,
        author,
      );
      result.services = { sha: out.sha, commitUrl: out.commitUrl };
    }
    return json(200, { ok: true, saved: result, by: session.name });
  } catch (e) {
    return toErrorResponse(e);
  }
};

function toErrorResponse(e: unknown): Response {
  if (e instanceof GitHubError) return error(e.status, e.message);
  console.error(e);
  return error(500, "שגיאה בשרת");
}
