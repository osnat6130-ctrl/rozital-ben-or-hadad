/* יוצר hash לסיסמה של משתמשת בפאנל הניהול.
 *
 * שימוש:
 *   node scripts/hash-password.mjs <שם-משתמש> "<שם לתצוגה>"
 * הסיסמה מוקלדת בטרמינל (לא נשמרת בהיסטוריה של הפקודות).
 * הפלט הוא רשומת JSON להדבקה במשתנה הסביבה ADMIN_USERS ב-Vercel:
 *   ADMIN_USERS=[{...רשומה 1...},{...רשומה 2...}] */
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

const [, , username, name] = process.argv;
if (!username || !name) {
  console.error('שימוש: node scripts/hash-password.mjs <שם-משתמש> "<שם לתצוגה>"');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question("סיסמה: ", (password) => {
  rl.close();
  if (password.length < 8) {
    console.error("הסיסמה חייבת להיות לפחות 8 תווים");
    process.exit(1);
  }
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), Buffer.from(salt, "hex"), 64).toString("hex");
  const record = { username: username.trim().toLowerCase(), name, hash: `scrypt$${salt}$${key}` };
  console.log("\nרשומה ל-ADMIN_USERS:\n");
  console.log(JSON.stringify(record));
});
