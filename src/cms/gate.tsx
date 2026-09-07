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
  return () => listeners.delete(l);
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
