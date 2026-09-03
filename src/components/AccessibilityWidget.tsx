import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AccessibilityIcon, CloseIcon } from "./Icons";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "a11y-prefs";
const MAX_FONT_STEP = 3;

type Prefs = {
  fontStep: number;
  contrast: boolean;
  underline: boolean;
  reduceMotion: boolean;
};

const defaultPrefs: Prefs = {
  fontStep: 0,
  contrast: false,
  underline: false,
  reduceMotion: false,
};

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs;
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return defaultPrefs;
  }
}

function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* אחסון חסום (למשל דפדפן פרטי) - לא קריטי, פשוט לא נשמר */
  }
}

/** מפעילה בפועל את ההתאמות על ה-html, כדי שישפיעו על כל האתר */
function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  root.style.fontSize = prefs.fontStep ? `${100 + prefs.fontStep * 12}%` : "";
  root.classList.toggle("a11y-contrast", prefs.contrast);
  root.classList.toggle("a11y-underline-links", prefs.underline);
  root.classList.toggle("a11y-reduce-motion", prefs.reduceMotion);
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-2xl bg-brand-soft/60 px-4 py-3 text-right transition-colors hover:bg-brand-soft"
    >
      <span className="font-display text-[0.95rem] font-bold text-brand-dark">{label}</span>
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-accent" : "bg-ink/20",
        )}
      >
        <span
          className={cn(
            "absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-300",
            checked ? "-translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  // אתחול עצל - טוען את ההעדפות השמורות כבר ברינדור הראשון,
  // כדי שלא "ירוצו" מול ה-effect שמחיל ושומר בכל שינוי.
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const panelRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    applyPrefs(prefs);
    savePrefs(prefs);
  }, [prefs]);

  // סגירת הפאנל במעבר בין עמודים, וב-Escape
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const changeFontStep = (delta: number) =>
    setPrefs((p) => ({ ...p, fontStep: Math.min(MAX_FONT_STEP, Math.max(0, p.fontStep + delta)) }));

  const reset = () => setPrefs(defaultPrefs);

  return (
    <>
      {/* --- כפתור צף: דסקטופ / טאבלט --- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="פתיחת תפריט התאמות נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        className="fixed bottom-7 left-7 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-brand-dark text-white shadow-lift transition-transform duration-300 hover:scale-110 lg:flex"
      >
        <AccessibilityIcon className="h-7 w-7" />
      </button>

      {/* --- כפתור צף: מובייל --- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="פתיחת תפריט התאמות נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        className="fixed bottom-[86px] left-3 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark text-white shadow-lift lg:hidden"
      >
        <AccessibilityIcon className="h-5 w-5" />
      </button>

      {/* --- הפאנל --- */}
      <div
        id="a11y-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="התאמות נגישות"
        className={cn(
          "fixed bottom-24 left-3 z-50 w-[calc(100%-1.5rem)] max-w-xs origin-bottom-left rounded-3xl bg-surface p-5 shadow-lift ring-1 ring-line/70 transition-all duration-300 sm:left-7",
          "lg:bottom-24",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-brand-dark">התאמות נגישות</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="סגירת תפריט הנגישות"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand-dark transition-colors hover:bg-brand hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between rounded-2xl bg-brand-soft/60 px-4 py-3">
            <span className="font-display text-[0.95rem] font-bold text-brand-dark">גודל טקסט</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeFontStep(-1)}
                disabled={prefs.fontStep === 0}
                aria-label="הקטנת גודל הטקסט"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface font-bold text-brand-dark shadow-soft transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
              >
                א−
              </button>
              <button
                type="button"
                onClick={() => changeFontStep(1)}
                disabled={prefs.fontStep === MAX_FONT_STEP}
                aria-label="הגדלת גודל הטקסט"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface font-bold text-brand-dark shadow-soft transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
              >
                א+
              </button>
            </div>
          </div>

          <Toggle
            label="ניגודיות גבוהה"
            checked={prefs.contrast}
            onChange={() => setPrefs((p) => ({ ...p, contrast: !p.contrast }))}
          />
          <Toggle
            label="הדגשת קישורים"
            checked={prefs.underline}
            onChange={() => setPrefs((p) => ({ ...p, underline: !p.underline }))}
          />
          <Toggle
            label="עצירת אנימציות"
            checked={prefs.reduceMotion}
            onChange={() => setPrefs((p) => ({ ...p, reduceMotion: !p.reduceMotion }))}
          />
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-4 w-full rounded-2xl border-2 border-accent px-4 py-2.5 font-display text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-white"
        >
          איפוס ההתאמות
        </button>

        <Link
          to="/accessibility"
          onClick={() => setOpen(false)}
          className="mt-4 block text-center text-sm font-bold text-accent underline-offset-2 hover:underline"
        >
          לצפייה בהצהרת הנגישות המלאה
        </Link>
      </div>
    </>
  );
}
