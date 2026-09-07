/* POST /api/logout - מוחק את עוגיית ההתחברות */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allow, json } from "./_lib/http";
import { clearSessionCookie } from "./_lib/session";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allow(req, res, "POST")) return;
  clearSessionCookie(res);
  return json(res, 200, { ok: true });
}
