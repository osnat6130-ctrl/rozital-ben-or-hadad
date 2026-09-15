import { pendingUpload } from "@/cms/pending";

/** מחבר class names ומסנן ערכים ריקים (תחליף קליל ל-clsx) */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** מוסיף לנתיב קובץ סטטי (כמו "/images/x.jpg") את בסיס האתר.
 *  ‼️ חובה לעטוף בזה כל תמונה/וידאו שנטענים מ-public - האתר רץ תחת
 *     תת-נתיב ב-GitHub Pages (למשל /rozital-ben-or-hadad/), ונתיב
 *     שמתחיל ב-"/" בלי זה מצביע בטעות לשורש הדומיין.
 *
 *  ‼️ קובץ שהועלה מהפאנל לפני דקה עוד לא מוגש מהאתר, ולכן הוא מוצג
 *     מהעותק שנשאר בדפדפן - אחרת המשתמשת רואה מלבן ריק במקום התמונה
 *     שהיא בדיוק העלתה. ההסבר המלא ב-src/cms/pending.ts. לגולשת רגילה
 *     המפה תמיד ריקה, וזו בדיקה אחת על Map. */
export function asset(path: string) {
  return pendingUpload(path) ?? import.meta.env.BASE_URL + path.replace(/^\//, "");
}
