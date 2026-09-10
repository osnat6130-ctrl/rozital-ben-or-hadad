/* אימות התוכן שמגיע מהפאנל לפני שהוא נכתב לריפו.
 *
 * הסכמה מכוונת להיות "רשת ביטחון" ולא העתק של הטיפוסים: היא מוודאת
 * שהמבנה תקין ושכל הערכים הם טקסט/מספר/בוליאני/מערכים ואובייקטים של
 * אלה - כדי שטעות בפאנל לא תשבור את הבנייה. הטיפוסים המלאים ב-src/data. */
import { z } from "zod";

const serviceIds = ["lectures", "laughter-yoga", "parents-kids", "bat-mitzvah"] as const;

/** ערך תוכן: פרימיטיב, או מערך/אובייקט של ערכי תוכן (עד עומק סביר) */
const leaf = z.union([z.string().max(5000), z.number(), z.boolean()]);
const contentValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([leaf, z.array(contentValue).max(200), z.record(z.string().max(60), contentValue)]),
);

/* ‼️ נתיב מדיה, ולא סתם מחרוזת.
   הנתיבים האלה נכנסים ל-HTML של העמודים בבנייה (scripts/prerender.mjs)
   ול-src של תגיות. מחרוזת חופשית אפשרה לשמור נתיב שסוגר את התכונה
   ופותח <script>, כלומר להפוך "עריכת תוכן" ל"קוד שרץ אצל כל מבקר".
   כאן נחסם בשורש: נתיב פנימי בלבד, בלי מרכאות, בלי סוגריים משולשים,
   ובלי scheme חיצוני. */
const mediaPath = z
  .string()
  .min(1)
  .max(500)
  .regex(/^\/[A-Za-z0-9._~\-/]+$/, "נתיב תמונה או סרטון חייב להיות נתיב פנימי תקין");

const media = z.object({ src: mediaPath, alt: z.string().max(300).optional() }).passthrough();

export const serviceSchema = z
  .object({
    id: z.enum(serviceIds),
    path: z.string().regex(/^\/[a-z-]+$/),
    navLabel: z.string().min(1).max(60),
    title: z.string().min(1).max(200),
    cardTitle: z.string().min(1).max(200),
    cardText: z.string().min(1).max(600),
    heroTitle: z.string().min(1).max(200),
    heroSubtitle: z.union([z.string().max(2000), z.array(z.string().max(2000)).max(10)]),
    motion: z.enum(["calm", "joyful", "festive"]),
    theme: z.object({ accent: z.string(), accentDark: z.string(), accentSoft: z.string() }),
    cardImage: z.string().min(1),
    heroImage: z.string().min(1),
    bannerImage: z.string().min(1),
    gallery: z.array(media).max(60),
    sections: z.array(z.record(z.string(), contentValue)).max(20),
    cta: z.object({ title: z.string(), text: z.string(), button: z.string().optional() }),
    seo: z.object({ title: z.string().max(120), description: z.string().max(400) }),
  })
  .catchall(contentValue);

export const servicesSchema = z
  .array(serviceSchema)
  .length(serviceIds.length)
  .refine((list) => new Set(list.map((s) => s.id)).size === list.length, "מזהי תחומים חייבים להיות ייחודיים");

export const siteSchema = z
  .object({
    site: z.record(z.string(), contentValue),
    nav: z.array(z.object({ label: z.string().min(1).max(40), to: z.string().regex(/^\/[a-z-]*$/) })).max(12),
    home: z.record(z.string(), contentValue),
    about: z.record(z.string(), contentValue),
    aboutPage: z.record(z.string(), contentValue),
    contact: z.record(z.string(), contentValue),
    certificates: z.array(z.record(z.string(), contentValue)).max(30),
    reasons: z.array(z.record(z.string(), contentValue)).max(10),
    accessibility: z.record(z.string(), contentValue),
  })
  /* ‼️ strict נשאר במכוון: הוא מה שמונע כתיבת מפתחות שרירותיים לקובץ
     התוכן. המחיר הוא שכל מפתח חדש ב-site.json חייב להתווסף גם כאן -
     אחרת כל שמירה שנוגעת בקובץ נדחית ב-400. זה קרה בפועל כשנוסף
     accessibility ולא נרשם כאן, והמסלול נשבר בשקט עד שנבדק. */
  .strict();

export const savePayloadSchema = z.object({
  /** תיאור קריא של השינוי - נכנס להודעת ה-commit ולהיסטוריה בפאנל */
  message: z.string().min(2).max(200),
  site: siteSchema.optional(),
  services: servicesSchema.optional(),
  /** ה-sha של כל קובץ כפי שנקרא - להגנה מדריסה */
  shas: z.object({ site: z.string().optional(), services: z.string().optional() }),
});

export type SavePayload = z.infer<typeof savePayloadSchema>;
