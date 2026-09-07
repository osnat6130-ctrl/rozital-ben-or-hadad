/* עזרי HTTP קטנים לפונקציות ב-Vercel. עובדים גם בשרת הפיתוח המקומי
 * (scripts/dev-api.mjs), ולכן קריאת גוף הבקשה לא מסתמכת על req.body בלבד. */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(JSON.stringify(body));
}

export function error(res: VercelResponse, status: number, message: string) {
  json(res, status, { error: message });
}

/** קורא JSON מגוף הבקשה. Vercel כבר מפענח ל-req.body; מקומית קוראים מהזרם. */
export async function readJson<T = unknown>(req: VercelRequest): Promise<T> {
  if (req.body !== undefined && req.body !== null && req.body !== "") {
    return (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as T;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return (raw ? JSON.parse(raw) : {}) as T;
}

/** מאפשר רק את המתודות הנתונות; אחרת 405 */
export function allow(req: VercelRequest, res: VercelResponse, ...methods: string[]) {
  if (methods.includes(req.method ?? "")) return true;
  res.setHeader("Allow", methods.join(", "));
  error(res, 405, "שיטה לא נתמכת");
  return false;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
