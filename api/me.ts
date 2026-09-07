/* GET /api/me - מי מחוברת (או 401). האתר קורא לזה כדי להחליט אם להציג
 * את סרגל העריכה - ורק אז טוען את קוד העריכה. */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allow, error, json } from "./_lib/http";
import { getSession } from "./_lib/session";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allow(req, res, "GET")) return;
  const session = getSession(req);
  if (!session) return error(res, 401, "לא מחוברת");
  return json(res, 200, { name: session.name, username: session.username });
}
