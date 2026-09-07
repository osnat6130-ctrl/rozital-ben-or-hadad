/* משתני הסביבה שהשרת צריך. כולם מוגדרים ב-Vercel (Settings > Environment
 * Variables), ובפיתוח מקומי ב-.env.local. ראו .env.example להסבר על כל אחד. */

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`חסר משתנה סביבה: ${name}`);
  return value;
}

export const env = {
  /** סוד לחתימת עוגיית ההתחברות. מחרוזת אקראית ארוכה (32+ תווים) */
  sessionSecret: () => required("SESSION_SECRET"),
  /** רשימת המשתמשות כ-JSON: [{"username","name","hash"}] - ראו scripts/hash-password.mjs */
  adminUsers: () => required("ADMIN_USERS"),
  /** טוקן GitHub עם הרשאת contents: read/write על הריפו הזה בלבד */
  githubToken: () => required("GITHUB_TOKEN"),
  /** "owner/repo", למשל osnat6130-ctrl/rozital-ben-or-hadad */
  githubRepo: () => required("GITHUB_REPO"),
  /** הענף שאליו הפאנל כותב. בפרודקשן main; לבדיקות אפשר ענף אחר */
  githubBranch: () => process.env.GITHUB_BRANCH || "main",
  /** true בפיתוח מקומי (http) - העוגייה לא מסומנת Secure */
  isLocal: () => process.env.VERCEL !== "1",
};
