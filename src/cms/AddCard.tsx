/* ============================================================================
   כרטיס "הוספה" למצב עריכה
   ----------------------------------------------------------------------------
   אותו דפוס לכל הרשימות באתר - המלצות, גלריה, סרטונים - כדי שלא יהיו
   שלוש דרכים שונות להוסיף פריט.

   data-cms-toolbar עליו: הוא בתוך אזור עריכה, והמטפל הגלובלי מתעלם
   ממה שמסומן כך - אחרת הלחיצה עליו הייתה נתפסת כניסיון לערוך טקסט.
   ========================================================================== */

type Props = {
  label: string;
  hint?: string;
  onClick: () => void;
  /** compact - שורת הוספה נמוכה, לרשת שבה כרטיס בגובה מלא ייראה חריג */
  compact?: boolean;
  className?: string;
};

export default function AddCard({ label, hint, onClick, compact = false, className = "" }: Props) {
  return (
    <button
      type="button"
      data-cms-toolbar
      onClick={onClick}
      className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-accent/50 bg-accent-soft/20 text-center transition-colors hover:border-accent hover:bg-accent-soft/40 ${
        compact ? "px-4 py-5" : "px-6 py-8"
      } ${className}`}
    >
      <span className="font-display text-base font-bold text-accent-dark sm:text-lg">+ {label}</span>
      {hint && <span className="text-xs leading-relaxed text-muted">{hint}</span>}
    </button>
  );
}
