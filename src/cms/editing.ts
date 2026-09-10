/* ============================================================================
   האם מצב העריכה דלוק
   ----------------------------------------------------------------------------
   עד כה קומפוננטות רק פיזרו תכונות data-cms ולא ידעו דבר על הפאנל, וזה
   הספיק לעריכת טקסט במקום. רשימות הן מקרה אחר: כדי להוסיף או להסיר
   פריט צריך פקד שמופיע רק בעריכה, ולכן הקומפוננטה כן צריכה לדעת.

   חנות קטנה ונפרדת מ-store.ts, כדי שקומפוננטה שרק צריכה את הדגל הזה
   לא תגרור את כל לוגיקת התוכן. לגולשת רגילה זה מנוי למשתנה שנשאר false.
   ========================================================================== */
import { useSyncExternalStore } from "react";

let editing = false;
const listeners = new Set<() => void>();

/** נקרא מ-EditMode כשהמצב מתחלף */
export function setEditingFlag(value: boolean) {
  if (editing === value) return;
  editing = value;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** true רק כשמשתמשת מחוברת הדליקה את מצב העריכה */
export function useEditing(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => editing,
    () => false,
  );
}
