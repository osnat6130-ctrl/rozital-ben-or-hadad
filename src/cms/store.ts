/* ============================================================================
   החנות של מצב העריכה
   ----------------------------------------------------------------------------
   העיקרון: התוכן של האתר חי באובייקטים שמיוצאים מ-src/data (services,
   siteContent). כל הדפים קוראים מהם בזמן רינדור. מצב העריכה משנה את
   האובייקטים האלה *במקום* (in place) - ולכן לא צריך לשנות אף דף, ואף
   קומפוננטה לא צריכה לדעת שקיים פאנל.

   "נתיב" (path) מזהה ערך בתוכן: "services.2.heroTitle",
   "site.contact.steps.1.text". הרישא קובעת באיזה קובץ הוא נשמר.
   ========================================================================== */
import { useSyncExternalStore } from "react";
import { services } from "@/data/services";
import { siteContent } from "@/data/site";

export type ContentFile = "site" | "services";

type Snapshot = { site: unknown; services: unknown };

const roots: Record<ContentFile, unknown> = { site: siteContent, services };

let original: Snapshot | null = null;
let shas: { site?: string; services?: string } = {};
const dirty = new Set<string>();
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** מספר גרסה שעולה בכל שינוי - לשימוש בקומפוננטות שצריכות להתעדכן */
export function useCmsVersion() {
  return useSyncExternalStore(subscribe, () => version);
}

export function useDirtyCount() {
  return useSyncExternalStore(subscribe, () => dirty.size);
}

/* ---------- ניווט לפי נתיב ---------- */

function splitPath(path: string): [ContentFile, string[]] {
  const [file, ...rest] = path.split(".");
  if (file !== "site" && file !== "services") throw new Error(`נתיב לא תקין: ${path}`);
  return [file, rest];
}

export function getValue(path: string): unknown {
  const [file, keys] = splitPath(path);
  let node: unknown = roots[file];
  for (const key of keys) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

export function setValue(path: string, value: unknown) {
  const [file, keys] = splitPath(path);
  let node: unknown = roots[file];
  for (const key of keys.slice(0, -1)) {
    node = (node as Record<string, unknown>)[key];
    if (node === null || typeof node !== "object") throw new Error(`נתיב לא קיים: ${path}`);
  }
  (node as Record<string, unknown>)[keys[keys.length - 1]] = value;

  const before = original ? getFrom(original[file], keys) : undefined;
  if (JSON.stringify(before) === JSON.stringify(value)) dirty.delete(path);
  else dirty.add(path);
  emit();
}

function getFrom(root: unknown, keys: string[]): unknown {
  let node = root;
  for (const key of keys) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

/* ---------- סנכרון עם הריפו ---------- */

/** מעדכן אובייקט קיים במקום כך שיהיה זהה למקור - בלי להחליף את
 *  הרפרנס (כי כל הדפים מחזיקים אותו). */
function assignDeep(target: unknown, source: unknown) {
  if (Array.isArray(target) && Array.isArray(source)) {
    target.length = source.length;
    source.forEach((item, i) => {
      if (item && typeof item === "object" && target[i] && typeof target[i] === "object") assignDeep(target[i], item);
      else target[i] = structuredClone(item);
    });
    return;
  }
  if (target && typeof target === "object" && source && typeof source === "object") {
    const t = target as Record<string, unknown>;
    const s = source as Record<string, unknown>;
    for (const key of Object.keys(t)) if (!(key in s)) delete t[key];
    for (const [key, value] of Object.entries(s)) {
      if (value && typeof value === "object" && t[key] && typeof t[key] === "object") assignDeep(t[key], value);
      else t[key] = structuredClone(value);
    }
  }
}

/** נקרא כשנכנסים למצב עריכה: התוכן העדכני מהריפו הופך לבסיס */
export function loadFromRepo(data: { site: unknown; services: unknown; shas: typeof shas }) {
  assignDeep(roots.site, data.site);
  assignDeep(roots.services, data.services);
  original = { site: structuredClone(data.site), services: structuredClone(data.services) };
  shas = { ...data.shas };
  dirty.clear();
  emit();
}

/** התוכן הנוכחי (כולל שינויים לא שמורים) - להשוואה מול גרסה מההיסטוריה */
export function getSnapshot(): { site: unknown; services: unknown } {
  return { site: roots.site, services: roots.services };
}

/** התוכן כפי שנטען מהריפו, בלי השינויים שלא נשמרו */
export function getOriginal(): { site: unknown; services: unknown } | null {
  return original;
}

/** אוסף את הנתיבים שבהם שני עצים נבדלים, ברמת השדה הבודד */
function collectDiffPaths(a: unknown, b: unknown, prefix: string, out: Set<string>) {
  const leaf = (v: unknown) => v === null || typeof v !== "object";
  if (leaf(a) || leaf(b)) {
    if (JSON.stringify(a) !== JSON.stringify(b)) out.add(prefix);
    return;
  }
  const keys = new Set([
    ...Object.keys(a as Record<string, unknown>),
    ...Object.keys(b as Record<string, unknown>),
  ]);
  for (const key of keys) {
    collectDiffPaths(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
      `${prefix}.${key}`,
      out,
    );
  }
}

/** מחשב מחדש אילו שדות שונים מהגרסה שנטענה מהריפו.
 *  נדרש אחרי שחזור גרסה שלמה, שיכול להוסיף ולהסיר שדות ולא רק לשנות. */
function recomputeDirty() {
  dirty.clear();
  if (!original) return;
  collectDiffPaths(original.site, roots.site, "site", dirty);
  collectDiffPaths(original.services, roots.services, "services", dirty);
}

/**
 * ממזג גרסה היסטורית לתוך התוכן הנוכחי: הערכים הישנים מנצחים, אבל
 * מפתחות שקיימים רק בגרסה הנוכחית נשמרים.
 *
 * ‼️ זה העיקר, ולא החלפה מלאה. האתר מוסיף שדות תוכן לאורך הזמן
 * (galleryTitle, טקסטים של הטופס וכו'), והקוד קורא אותם ישירות. החלפה
 * בגרסה ישנה הייתה מוחקת אותם - והדף קורס עם "reading 'display' of
 * undefined" במקום פשוט להציג טקסט ישן.
 *
 * מערכים נלקחים במלואם מהגרסה הישנה, כי זו המשמעות של שחזור עבורם:
 * המלצה שנמחקה חוזרת, ותמונה שנוספה מאז יוצאת.
 */
function mergeRestore(target: unknown, source: unknown): unknown {
  if (source === null || typeof source !== "object") return structuredClone(source);

  if (Array.isArray(source)) {
    /* חייבים לשנות את המערך במקום ולא להחזיר חדש: כל הדפים מחזיקים את
       אותו רפרנס ל-services, ומערך חדש פשוט לא היה מגיע לאף אחד. */
    if (!Array.isArray(target)) return structuredClone(source);
    target.length = source.length;
    source.forEach((item, i) => {
      target[i] = mergeRestore(target[i], item);
    });
    return target;
  }

  if (target === null || typeof target !== "object" || Array.isArray(target)) return structuredClone(source);

  const t = target as Record<string, unknown>;
  const s = source as Record<string, unknown>;
  for (const [key, value] of Object.entries(s)) t[key] = mergeRestore(t[key], value);
  return t;
}

/**
 * מחזיר את התוכן לגרסה מההיסטוריה - כשינויים שלא נשמרו.
 * כלומר: אפשר לראות את התוצאה באתר, לבטל, או לשמור אותה כגרסה חדשה.
 * שחזור לא מוחק היסטוריה - הוא יוצר commit חדש שמחזיר את התוכן הישן.
 */
export function restoreSnapshot(data: { site?: unknown | null; services?: unknown | null }) {
  if (data.site !== null && data.site !== undefined) mergeRestore(roots.site, data.site);
  if (data.services !== null && data.services !== undefined) mergeRestore(roots.services, data.services);
  recomputeDirty();
  emit();
}

export function discardChanges() {
  if (!original) return;
  assignDeep(roots.site, original.site);
  assignDeep(roots.services, original.services);
  dirty.clear();
  emit();
}

export function getDirtyPaths(): string[] {
  return [...dirty];
}

/** מה לשלוח לשמירה: רק הקבצים שהשתנו, עם ה-sha שנקרא */
export function buildSavePayload(message: string) {
  const files = new Set(getDirtyPaths().map((p) => splitPath(p)[0]));
  return {
    message,
    ...(files.has("site") ? { site: roots.site } : {}),
    ...(files.has("services") ? { services: roots.services } : {}),
    shas: {
      ...(files.has("site") ? { site: shas.site } : {}),
      ...(files.has("services") ? { services: shas.services } : {}),
    },
  };
}

/** אחרי שמירה מוצלחת: מה שנשמר הוא הבסיס החדש */
export function markSaved(saved: Partial<Record<ContentFile, { sha: string }>>) {
  if (saved.site) shas.site = saved.site.sha;
  if (saved.services) shas.services = saved.services.sha;
  original = { site: structuredClone(roots.site), services: structuredClone(roots.services) };
  dirty.clear();
  emit();
}
