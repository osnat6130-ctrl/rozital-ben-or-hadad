/* POST /api/login  { username, password }
 * מצליח -> 200 { name, username } + עוגיית התחברות. נכשל -> 401 (אחרי השהיה קצרה). */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { allow, error, json, readJson, sleep } from "./_lib/http";
import { authenticate } from "./_lib/auth";
import { createToken, setSessionCookie } from "./_lib/session";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allow(req, res, "POST")) return;

  let body: { username?: unknown; password?: unknown };
  try {
    body = await readJson(req);
  } catch {
    return error(res, 400, "בקשה לא תקינה");
  }
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) return error(res, 400, "צריך שם משתמש וסיסמה");

  const user = authenticate(username, password);
  if (!user) {
    await sleep(600); // מאט ניחושים
    return error(res, 401, "שם משתמש או סיסמה שגויים");
  }

  setSessionCookie(res, createToken({ username: user.username, name: user.name }));
  return json(res, 200, { name: user.name, username: user.username });
}
