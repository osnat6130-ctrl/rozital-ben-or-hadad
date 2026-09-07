/* אימות סיסמה מול רשימת המשתמשות שבמשתנה הסביבה ADMIN_USERS.
 *
 * הסיסמאות לא נשמרות בשום מקום - רק hash (scrypt) עם salt לכל משתמשת.
 * יצירת hash: node scripts/hash-password.mjs */
import { scryptSync, timingSafeEqual } from "node:crypto";
import { env } from "./env";

export type AdminUser = { username: string; name: string; hash: string };

export function loadUsers(): AdminUser[] {
  const parsed = JSON.parse(env.adminUsers()) as unknown;
  if (!Array.isArray(parsed)) throw new Error("ADMIN_USERS חייב להיות מערך JSON");
  return parsed as AdminUser[];
}

/** פורמט ה-hash: scrypt$<salt-hex>$<key-hex> */
export function hashPassword(password: string, saltHex: string): string {
  const key = scryptSync(password.normalize("NFKC"), Buffer.from(saltHex, "hex"), 64);
  return `scrypt$${saltHex}$${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, saltHex, keyHex] = stored.split("$");
  if (algo !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = scryptSync(password.normalize("NFKC"), Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** מחזיר את המשתמשת אם שם המשתמש והסיסמה נכונים, אחרת null.
 *  בודק תמיד סיסמה (גם כששם המשתמש לא קיים) כדי לא לחשוף בזמן התגובה
 *  אילו שמות משתמש קיימים. */
export function authenticate(username: string, password: string): AdminUser | null {
  const users = loadUsers();
  const user = users.find((u) => u.username === username.trim().toLowerCase());
  const dummy = "scrypt$00$" + "00".repeat(64);
  const ok = verifyPassword(password, user?.hash ?? dummy);
  return ok && user ? user : null;
}
