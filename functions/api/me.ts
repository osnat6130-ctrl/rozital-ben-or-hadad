/* GET /api/me - מי מחוברת (או 401). האתר קורא לזה כדי להחליט אם להציג
 * את סרגל העריכה - ורק אז טוען את קוד העריכה. */
import type { Env } from "../../server/env";
import { error, json } from "../../server/http";
import { getSession } from "../../server/session";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await getSession(env, request);
  if (!session) return error(401, "לא מחוברת");
  return json(200, { name: session.name, username: session.username });
};
