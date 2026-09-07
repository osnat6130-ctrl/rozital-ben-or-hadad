/* עוגיית התחברות חתומה (HMAC-SHA256) - בלי מסד נתונים ובלי ספריות.
 *
 * מבנה: base64url(payload).base64url(signature)
 * payload = { u: username, n: שם לתצוגה, exp: תפוגה }
 * העוגייה HttpOnly, SameSite=Lax, ובפרודקשן גם Secure. */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { env } from "./env";

export const COOKIE_NAME = "rz_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // שבוע

export type Session = { username: string; name: string; exp: number };

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", env.sessionSecret()).update(payload).digest("base64url");
}

export function createToken(session: Omit<Session, "exp">): string {
  const payload = b64url(
    JSON.stringify({ u: session.username, n: session.name, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    if (typeof data.u !== "string" || typeof data.n !== "string") return null;
    return { username: data.u, name: data.n, exp: data.exp };
  } catch {
    return null;
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function getSession(req: VercelRequest): Session | null {
  return verifyToken(parseCookies(req.headers.cookie)[COOKIE_NAME]);
}

function cookieAttributes(maxAge: number) {
  const secure = env.isLocal() ? "" : "; Secure";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttributes(MAX_AGE_SECONDS)}`);
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; ${cookieAttributes(0)}`);
}
