/* השער למצב העריכה.
 *
 * מבקר רגיל: לא קורה כלום - אין בקשה לשרת ואין קוד עריכה שנטען.
 * אחרי כניסה ב-/admin נשמר סימון מקומי, ורק אז נטען (lazy) קוד העריכה,
 * שמאמת את ההתחברות מול השרת. */
import { lazy, Suspense, useSyncExternalStore } from "react";

const FLAG = "rz-admin";
const listeners = new Set<() => void>();

export function hasAdminFlag() {
  try {
    return localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

export function setAdminFlag(on: boolean) {
  try {
    if (on) localStorage.setItem(FLAG, "1");
    else localStorage.removeItem(FLAG);
  } catch {
    /* אחסון חסום - מצב העריכה פשוט לא יופיע */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  /* ‼️ גם לשינוי מטאב אחר.
     בלי זה, התחברות בטאב אחד לא מגיעה לטאבים שהיו פתוחים לפניה: הם
     נשארים בלי סרגל עריכה, לחיצה על תמונה פותחת הגדלה, והמשתמשת רואה
     אתר שלא נותן לערוך - למרות שהיא מחוברת. אירע בפועל.
     אירוע storage נשלח רק לטאבים האחרים, ולכן אין כאן לופ. */
  const onStorage = (e: StorageEvent) => {
    if (e.key === FLAG || e.key === null) l();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const EditMode = lazy(() => import("./EditMode"));

export default function CmsGate() {
  const enabled = useSyncExternalStore(subscribe, hasAdminFlag, () => false);
  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <EditMode />
    </Suspense>
  );
}
