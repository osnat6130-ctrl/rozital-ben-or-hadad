/* GET /api/content  -> התוכן העדכני מהריפו + sha לכל קובץ
 * PUT /api/content  -> שמירה: אימות, commit לכל קובץ שהשתנה, sha חדש
 *
 * הקריאה היא מהריפו (ולא מהבנייה) כדי שהפאנל תמיד יערוך את הגרסה
 * האחרונה שנשמרה, גם אם Vercel עדיין באמצע פרסום. */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allow, error, json, readJson } from "./_lib/http";
import { getSession } from "./_lib/session";
import { GitHubError, readFile, writeFile } from "./_lib/github";
import { savePayloadSchema } from "./_lib/schema";

const FILES = {
  site: "src/content/site.json",
  services: "src/content/services.json",
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allow(req, res, "GET", "PUT")) return;
  const session = getSession(req);
  if (!session) return error(res, 401, "לא מחוברת");

  try {
    if (req.method === "GET") {
      const [site, services] = await Promise.all([readFile(FILES.site), readFile(FILES.services)]);
      return json(res, 200, {
        site: JSON.parse(site.text),
        services: JSON.parse(services.text),
        shas: { site: site.sha, services: services.sha },
      });
    }

    const parsed = savePayloadSchema.safeParse(await readJson(req));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return error(res, 400, `תוכן לא תקין: ${issue.path.join(".")} - ${issue.message}`);
    }
    const { message, site, services, shas } = parsed.data;
    if (!site && !services) return error(res, 400, "אין מה לשמור");

    const author = { name: session.name, email: `${session.username}@rozital-admin.local` };
    const commitMessage = `[פאנל] ${message}`;
    const result: Record<string, { sha: string; commitUrl: string }> = {};

    // שני הקבצים נשמרים בזה אחר זה כדי שכל אחד יקבל commit משלו בהיסטוריה
    if (site) {
      const out = await writeFile(FILES.site, JSON.stringify(site, null, 2) + "\n", shas.site, commitMessage, author);
      result.site = { sha: out.sha, commitUrl: out.commitUrl };
    }
    if (services) {
      const out = await writeFile(FILES.services, JSON.stringify(services, null, 2) + "\n", shas.services, commitMessage, author);
      result.services = { sha: out.sha, commitUrl: out.commitUrl };
    }
    return json(res, 200, { ok: true, saved: result, by: session.name });
  } catch (e) {
    if (e instanceof GitHubError) return error(res, e.status, e.message);
    console.error(e);
    return error(res, 500, "שגיאה בשרת");
  }
}
