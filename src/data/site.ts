/* ============================================================================
   הגדרות האתר - טיפוסים ופונקציות עזר מעל קובץ התוכן
   ----------------------------------------------------------------------------
   ‼️ כל הטקסטים, פרטי הקשר והתמונות חיים ב-src/content/site.json - זה
      הקובץ שפאנל הניהול עורך. כאן רק טיפוסים, נגזרות ופונקציות עזר.
   ========================================================================== */
import siteJson from "@/content/site.json";

export type SiteInfo = {
  name: string;
  shortName: string;
  tagline: string;
  heroImage: string;
  heroFallbackImage: string;
  /** כותרת ה-Hero בדף הבית, והמילים שמודגשות בזהב בסופה */
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  /** כפתור הפעולה הראשי ב-Hero (גולל לתחומים) */
  heroPrimaryCta: string;
  /** תווית כפתור הוואטסאפ ב-Hero */
  heroWhatsappCta: string;
  phone: { display: string; dial: string; whatsapp: string };
  url: string;
  email: string;
  serviceArea: string;
  whatsappDefaultMessage: string;
  credit: { text: string };
};

/** כותרת ותיאור לתגיות ה-head. משמש גם את scripts/prerender.mjs */
export type PageSeo = { title: string; description: string };

export type NavItem = { label: string; to: string };

export type HomeContent = {
  servicesTitle: string;
  reasonsTitle: string;
  reasonsTitleHighlight: string;
  /** תווית הכפתור בכרטיסי התחומים (דף הבית ואודות) */
  serviceCardCta: string;
  cta: { title: string; text: string; button: string };
  seo: PageSeo;
};

/** כל הטקסטים של טופס הפנייה - היו מקודדים בקומפוננטה עד שהפאנל דרש אותם */
export type ContactFormContent = {
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  topicLabel: string;
  otherTopic: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  note: string;
  opened: string;
  openedLink: string;
};

export type AboutContent = {
  image: string;
  pageImage: string;
  imageAlt: string;
  previewTitle: string;
  previewText: string;
  /** תווית הכפתור לדף אודות */
  previewCta: string;
  pageIntro: string;
  story: string[];
  credentials: string[];
  principles: { title: string; text: string }[];
};

export type AboutPageContent = {
  title: string;
  certificatesTitle: string;
  principlesTitle: string;
  servicesTitle: string;
  servicesSubtitle: string;
  /** תווית הכפתור בכרטיסי התחומים בדף אודות */
  serviceCardCta: string;
  cta: { title: string; text: string; button: string };
  seo: PageSeo;
};

export type ContactContent = {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  intro: string;
  panelTitle: string;
  panelText: string;
  steps: { title: string; text: string }[];
  topicsLabel: string;
  /** התווית ליד מספר הטלפון בפאנל הכהה */
  phoneLabel: string;
  form: ContactFormContent;
  seo: PageSeo;
};

export type Certificate = { src: string; title: string; issuer: string; meta: string };

export type ReasonIcon = "heart" | "badge" | "spark";
export type Reason = { icon: ReasonIcon; title: string; text: string };

type SiteContent = {
  site: SiteInfo;
  nav: NavItem[];
  home: HomeContent;
  about: AboutContent;
  aboutPage: AboutPageContent;
  contact: ContactContent;
  certificates: Certificate[];
  reasons: Reason[];
  accessibility: { seo: PageSeo };
};

const content = siteJson as unknown as SiteContent;

/** האובייקט המלא - מצב העריכה כותב לתוכו במקום (ראו src/cms/store.ts) */
export const siteContent = content;

export const site = content.site;
export const navItems = content.nav;
export const home = content.home;
export const about = content.about;
export const aboutPage = content.aboutPage;
export const contact = content.contact;
export const certificates = content.certificates;
export const reasons = content.reasons;
export const accessibility = content.accessibility;

/** בונה קישור וואטסאפ עם הודעה מוכנה */
export function whatsappLink(message: string = site.whatsappDefaultMessage) {
  return `https://wa.me/${site.phone.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** בונה קישור חיוג */
export const telLink = `tel:${site.phone.dial}`;
