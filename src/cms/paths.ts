/* עזרי נתיבים לתיוג אלמנטים ניתנים לעריכה, ולתיאור שינויים בעברית
 * (להודעות ה-commit ולמסך ההיסטוריה). */
import { services } from "@/data/services";

export type CmsType = "text" | "image" | "video";

/** פרופס לפיזור על האלמנט שמציג את הערך: <h1 {...cms("services.0.heroTitle")}> */
export function cms(path: string, type: CmsType = "text") {
  return type === "text" ? { "data-cms": path } : { "data-cms": path, "data-cms-type": type };
}

/**
 * פרופס לתמונה ניתנת לעריכה.
 *
 * path מצביע על מה שנשמר בתוכן: או מחרוזת נתיב תמונה
 * ("site.about.image"), או פריט גלריה שהוא אובייקט { src, alt }
 * ("services.3.gallery.5"). העורך מזהה את הצורה לבד.
 *
 * altPath נדרש רק כשהתמונה היא מחרוזת ותיאור התמונה יושב במפתח נפרד
 * ("site.about.imageAlt") - תיאור התמונה הוא תוכן, וגם הוא צריך להיות
 * ניתן לעריכה בגלל נגישות.
 */
export function cmsImage(path: string, altPath?: string) {
  return {
    "data-cms": path,
    "data-cms-type": "image" as const,
    ...(altPath ? { "data-cms-alt": altPath } : {}),
  };
}

/** האינדקס של תחום במערך - לבניית נתיבים כמו services.2.heroTitle */
export function serviceIndex(id: string): number {
  const i = services.findIndex((s) => s.id === id);
  if (i < 0) throw new Error(`תחום לא קיים: ${id}`);
  return i;
}

/* ---------- תיאור שינויים בעברית ---------- */

const FIELD_LABELS: Record<string, string> = {
  heroTitle: "כותרת ה-Hero",
  heroTitleHighlight: "ההדגשה בכותרת",
  heroSubtitle: "טקסט ה-Hero",
  heroEyebrow: "כותרת העל",
  heroTagline: "משפט המפתח",
  heroCta: "כפתור ה-Hero",
  heroPrimaryCta: "כפתור ה-Hero",
  heroBanner: "הבאנר",
  title: "כותרת",
  text: "טקסט",
  intro: "פתיח",
  paragraphs: "פסקה",
  bullets: "נקודה",
  cta: "כפתור",
  button: "כפתור",
  ctaNote: "הערת הכפתור",
  cardTitle: "כותרת הכרטיס",
  cardText: "טקסט הכרטיס",
  navLabel: "שם הלשונית",
  label: "תווית",
  testimonials: "המלצה",
  testimonialsTitle: "כותרת ההמלצות",
  videosTitle: "כותרת הסרטונים",
  spotlight: "אזור ההעצמה",
  banner: "הבאנר",
  sections: "סעיף",
  steps: "שלב",
  story: "פסקה",
  credentials: "הכשרה",
  principles: "עיקרון",
  reasons: "סיבה",
  certificates: "תעודה",
  tagline: "סלוגן",
  phone: "טלפון",
  email: "אימייל",
  gallery: "תמונה בגלריה",
  src: "תמונה",
  alt: "תיאור תמונה",
  servicesTitle: "כותרת התחומים",
  reasonsTitle: "כותרת הסיבות",
  panelTitle: "כותרת הפאנל",
  panelText: "טקסט הפאנל",
  topicsLabel: "כותרת הנושאים",
  eyebrow: "כותרת העל",
  titleHighlight: "ההדגשה בכותרת",
  previewTitle: "כותרת",
  previewText: "טקסט",
  previewCta: "כפתור",
  pageIntro: "תת-כותרת",
  seo: "SEO",
  galleryTitle: "כותרת הגלריה",
  serviceCardCta: "כפתור בכרטיס",
  heroWhatsappCta: "כפתור הוואטסאפ",
  phoneLabel: "תווית הטלפון",
  form: "טופס הפנייה",
  nameLabel: "תווית השם",
  namePlaceholder: "טקסט מנחה לשם",
  phonePlaceholder: "טקסט מנחה לטלפון",
  topicLabel: "תווית הנושא",
  otherTopic: 'הנושא "אחר"',
  messageLabel: "תווית ההודעה",
  messagePlaceholder: "טקסט מנחה להודעה",
  submit: "כפתור השליחה",
  note: "הערה מתחת לכפתור",
  opened: "הודעה אחרי שליחה",
  openedLink: "קישור לפתיחה ידנית",
  display: "תצוגת הטלפון",
  dial: "מספר לחיוג",
  whatsapp: "מספר וואטסאפ",
  name: "שם האתר",
  shortName: "שם מקוצר",
  serviceArea: "אזור השירות",
  whatsappDefaultMessage: "הודעת וואטסאפ ברירת מחדל",
  imageAlt: "תיאור התמונה",
  description: "תיאור",
};

const SITE_PAGES: Record<string, string> = {
  site: "הגדרות כלליות",
  home: "דף הבית",
  reasons: "דף הבית",
  about: "אודות",
  aboutPage: "אודות",
  certificates: "אודות",
  contact: "צור קשר",
  nav: "התפריט",
};

/** "services.2.sections.1.paragraphs.0" -> { page: "הורים וילדים", field: "סעיף 2, פסקה 1" } */
export function describePath(path: string): { page: string; field: string } {
  const parts = path.split(".");
  let page: string;
  let keys: string[];
  if (parts[0] === "services") {
    page = services[Number(parts[1])]?.navLabel ?? "תחום";
    keys = parts.slice(2);
  } else {
    page = SITE_PAGES[parts[1]] ?? "האתר";
    keys = parts.slice(2);
    // site.site.heroTitle וכדומה שייכים לדף הבית
    if (parts[1] === "site" && /^hero/.test(keys[0] ?? "")) page = "דף הבית";
  }
  const words: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (/^\d+$/.test(key)) continue;
    const next = keys[i + 1];
    const label = FIELD_LABELS[key] ?? key;
    const word = next !== undefined && /^\d+$/.test(next) ? `${label} ${Number(next) + 1}` : label;
    /* "cta.button" ו-"spotlight.banner.button" מתרגמים שניהם ל"כפתור",
       ואז יוצא "כפתור, כפתור". מדלגים על חזרה רצופה. */
    if (words[words.length - 1] !== word) words.push(word);
  }
  return { page, field: words.join(", ") || "תוכן" };
}

/** הודעה קריאה לשינויים - מוגבלת ל-200 תווים (הסכמה בשרת) */
export function describeChanges(paths: string[]): string {
  const byPage = new Map<string, string[]>();
  for (const path of paths) {
    const { page, field } = describePath(path);
    const list = byPage.get(page) ?? [];
    if (!list.includes(field)) list.push(field);
    byPage.set(page, list);
  }
  const count = paths.length;
  const head = count === 1 ? "עדכון טקסט אחד" : `עדכון ${count} טקסטים`;
  const details = [...byPage].map(([page, fields]) => `${page} (${fields.join(", ")})`).join("; ");
  const message = `${head}: ${details}`;
  return message.length > 200 ? message.slice(0, 197) + "..." : message;
}
