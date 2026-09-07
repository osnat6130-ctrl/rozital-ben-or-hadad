/* ============================================================================
   התחומים של רוזיטל - טיפוסים ומעטפת מעל קובץ התוכן
   ----------------------------------------------------------------------------
   ‼️ התוכן עצמו חי ב-src/content/services.json - זה הקובץ שפאנל הניהול
      עורך. כאן רק הטיפוסים ופונקציות העזר. אין לערוך טקסטים בקובץ הזה.
   ========================================================================== */
import servicesJson from "@/content/services.json";

export type ServiceMotion = "calm" | "joyful" | "festive";

export type ServiceSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  /** תווית לכפתור וואטסאפ בסוף הסעיף. נתמך כרגע בסעיף המודגש (האחרון) בלבד */
  cta?: string;
  /** שורה קצרה מעל החץ והכפתור, למשל "להרשמה לחצו כאן:" */
  ctaNote?: string;
};

/** המלצה אמיתית שהתקבלה מרוזיטל.
 *  ‼️ הטקסטים הועתקו כלשונם מהודעות שנשלחו אליה - אין לשנות את הניסוח.
 *  "context" הוא תיאור ניטרלי של הכותב, ורק כשהוא עולה מפורשות מהטקסט. */
export type Testimonial = {
  text: string;
  context?: string;
};

export type ServiceId = "lectures" | "laughter-yoga" | "parents-kids" | "bat-mitzvah";

export type Service = {
  id: ServiceId;
  path: string;
  navLabel: string;
  /** כותרת מלאה */
  title: string;
  /** כותרת קצרה לכרטיס בדף הבית */
  cardTitle: string;
  cardText: string;
  heroTitle: string;
  /** כותרת עליונה קטנה מעל כותרת ה-Hero. אופציונלי - מוצגת רק בתחומים שהוגדר להם */
  heroEyebrow?: string;
  /** משפט מפתח מתחת לכותרת ה-Hero. אופציונלי - מוצג רק בתחומים שהוגדר להם */
  heroTagline?: string;
  /** פסקה אחת, או כמה פסקאות */
  heroSubtitle: string | string[];
  /** תווית כפתור הוואטסאפ ב-Hero. ברירת מחדל: "שלחו וואטסאפ" */
  heroCta?: string;
  /** שורה קצרה + חץ קופץ מעל כפתור ה-Hero, שמסמנים שצריך ללחוץ עליו */
  heroCtaNote?: string;
  /** עוצמת האנימציות בדף - נקבעת לפי אופי התחום */
  motion: ServiceMotion;
  /** גווני התחום (HSL, ללא פסיקים) */
  theme: { accent: string; accentDark: string; accentSoft: string };
  cardImage: string;
  heroImage: string;
  /** תמונת ה-Hero לאורך (3:4) במקום לרוחב - כשהתמונה היא פורטרט */
  heroPortrait?: boolean;
  /** סרטון אופציונלי ל-Hero. התמונה משמשת כפוסטר ומוצגת ראשונה */
  heroVideo?: string;
  /** באנר שכנוע מיד מתחת ל-Hero, עם כפתור וואטסאפ. מוצג רק בתחומים שהוגדר להם */
  heroBanner?: { title: string; paragraphs?: string[]; button: string };
  /** תמונת רוחב לאזור "למי זה מתאים" - יחס 16:7 */
  bannerImage: string;
  /** סרטון שמחליף את תמונת הרוחב באזור "למי זה מתאים".
   *  bannerImage ממשיך לשמש כתמונת הפוסטר לפני הניגון. */
  bannerVideo?: string;
  gallery: { src: string; alt: string }[];
  /** סרטונים באזור משלהם אחרי הגלריה (עם כפתורי ניגון, בלי ניגון אוטומטי).
   *  שניים ומעלה מוצגים זה לצד זה בדסקטופ, ואחד מתחת לשני במובייל. */
  videos?: { src: string }[];
  /** כותרת מעל הסרטונים. בלעדיה האזור מוצג בלי כותרת */
  videosTitle?: string;
  /** המלצות אמיתיות. האזור מוצג רק בתחומים שיש להם המלצות */
  testimonials?: Testimonial[];
  /** כותרת אזור ההמלצות. ברירת מחדל: "מה אומרים אחרי המפגש" */
  testimonialsTitle?: string;
  /** תמונה נוספת באזור ההמלצות (למשל דף משוב בכתב יד), עם לחיצה להגדלה */
  testimonialsImage?: { src: string; alt: string };
  /** אזור מודגש מיד מתחת ל-Hero, לפעילות ייחודית בתחום. מוצג רק בתחומים שהוגדר להם */
  spotlight?: ServiceSection & {
    images?: { src: string; alt: string }[];
    /** המלצות שמתייחסות לפעילות הזו ספציפית (במקום באזור ההמלצות הכללי של הדף) */
    testimonials?: Testimonial[];
    /** באנר קריאה לפעולה בתחתית האזור, עם כפתור וואטסאפ */
    banner?: { title: string; paragraphs?: string[]; button: string };
  };
  sections: ServiceSection[];
  /** אזור יצירת הקשר בתחתית הדף. button - תווית כפתור הוואטסאפ (ברירת מחדל: "שלחו וואטסאפ") */
  cta: { title: string; text: string; button?: string };
  seo: { title: string; description: string };
};

/** ארבעת התחומים, בסדר שבו הם מופיעים בתפריט ובדף הבית */
export const services = servicesJson as unknown as Service[];

export function getService(id: ServiceId): Service {
  const service = services.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}
