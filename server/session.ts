/* עוגיית התחברות חתומה (HMAC-SHA256) - בלי מסד נתונים ובלי ספריות.
 *
 * מבנה: base64url(payload).base64url(signature)
 * payload = { u: username, n: שם לתצוגה, k: טביעת אצבע של הסיסמה, exp: תפוגה }
 * העוגייה HttpOnly, SameSite=Lax, ובפרודקשן גם Secure ועם תחילית __Host-. */
import { loadUsers, type AdminUser } from "./auth";
import { b64urlDecodeText, b64urlEncode, hmacSign, timingSafeEqual } from "./crypto";
import { isLocal, requireEnv, type Env } from "./env";

const COOKIE_BASE = "rz_admin";

/* ‼️ "מקומי" נקבע משני תנאים ולא מאחד: גם הסביבה מצהירה LOCAL_DEV,
   וגם החיבור עצמו באמת http. משתנה סביבה שנשאר בטעות בפרודקשן היה
   מוריד את Secure ואת התחילית __Host- בשקט - בלי שגיאה, בלי סימן,
   ועם עוגיית התחברות שנשלחת גם ב-http. */
const localRequest = (env: Env, request: Request) =>
  isLocal(env) && new URL(request.url).protocol === "http:";

/* __Host- : הדפדפן מקבל את העוגייה רק ב-HTTPS, רק מהדומיין המדויק,
   ורק עם Path=/. תת-דומיין לא יכול לדרוס אותה. בפיתוח מקומי (http)
   התחילית לא נתמכת, ולכן השם נגזר מהבקשה. */
export const cookieName = (env: Env, request: Request) =>
  localRequest(env, request) ? COOKIE_BASE : `__Host-${COOKIE_BASE}`;

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // שבוע
/** "זכור אותי". 60 יום ולא 180: עוגייה שנעתקה תקפה עד לתפוגה, ולכן
 *  חצי שנה היה חלון גדול מדי לנוחות שממילא מורגשת גם ב-60. */
const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 60;
const encoder = new TextEncoder();

export const maxAge = (remember: boolean) => (remember ? REMEMBER_MAX_AGE_SECONDS : MAX_AGE_SECONDS);

export type Session = { username: string; name: string; exp: number };

/* ‼️ טביעת אצבע של הסיסמה השמורה, נכנסת לתוך הטוקן ונבדקת בכל בקשה.
   הטוקן חתום וללא צד שרת, כלומר "יציאה" רק מוחקת את העוגייה מהדפדפן -
   עוגייה שנעתקה המשיכה לעבוד עד לתפוגה, ולא הייתה שום דרך לבטל אותה.
   עכשיו החלפת סיסמה ב-ADMIN_USERS משנה את הטביעה ומנתקת מיד כל
   העוגיות הקיימות. זו טביעה ולא הגיבוב עצמו: תוכן ה-payload קריא
   לכל מי שמחזיק את העוגייה, ואסור שיזלוג ממנו חומר לניחוש הסיסמה. */
async function passwordFingerprint(env: Env, hash: string): Promise<string> {
  const signature = await hmacSign(requireEnv(env, "SESSION_SECRET"), `pwd:${hash}`);
  return signature.slice(0, 22);
}

/** תפוגת הטוקן והעוגייה חייבות להיות זהות - אחרת העוגייה תישלח אחרי
 *  שהטוקן שבתוכה כבר פג, וזה נראה כמו התנתקות מקרית. */
export async function createToken(env: Env, user: AdminUser, remember = false): Promise<string> {
  const payload = b64urlEncode(
    JSON.stringify({
      u: user.username,
      n: user.name,
      k: await passwordFingerprint(env, user.hash),
      exp: Date.now() + maxAge(remember) * 1000,
    }),
  );
  return `${payload}.${await hmacSign(requireEnv(env, "SESSION_SECRET"), payload)}`;
}

export async function verifyToken(env: Env, token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await hmacSign(requireEnv(env, "SESSION_SECRET"), payload);
  if (!timingSafeEqual(encoder.encode(signature), encoder.encode(expected))) return null;

  try {
    const data = JSON.parse(b64urlDecodeText(payload));
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    if (typeof data.u !== "string" || typeof data.n !== "string" || typeof data.k !== "string") return null;

    /* הצלבה מול ADMIN_USERS בכל בקשה: משתמשת שנמחקה מנותקת מיד,
       וסיסמה שהוחלפה מבטלת את כל העוגיות שנוצרו לפניה. */
    const user = loadUsers(env).find((u) => u.username === data.u);
    if (!user) return null;
    const fingerprint = await passwordFingerprint(env, user.hash);
    if (!timingSafeEqual(encoder.encode(data.k), encoder.encode(fingerprint))) return null;

    return { username: data.u, name: data.n, exp: data.exp };
  } catch {
    return null;
  }
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    /* ‼️ decodeURIComponent זורק על "%" בודד. בלי ה-try כל בקשה עם
       עוגייה פגומה - גם עוגייה של אתר אחר שנשלחה במקרה - הפילה את
       הפונקציה ל-500 במקום להחזיר 401 שקט. */
    try {
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      continue;
    }
  }
  return out;
}

export function getSession(env: Env, request: Request): Promise<Session | null> {
  const cookies = parseCookies(request.headers.get("Cookie"));
  return verifyToken(env, cookies[cookieName(env, request)]);
}

function cookieAttributes(env: Env, request: Request, maxAge: number): string {
  const secure = localRequest(env, request) ? "" : "; Secure";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function sessionCookie(env: Env, request: Request, token: string, remember = false): string {
  return `${cookieName(env, request)}=${encodeURIComponent(token)}; ${cookieAttributes(env, request, maxAge(remember))}`;
}

export function clearedCookie(env: Env, request: Request): string {
  return `${cookieName(env, request)}=; ${cookieAttributes(env, request, 0)}`;
}
