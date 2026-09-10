/* ============================================================================
   עורך סרטונים
   ----------------------------------------------------------------------------
   נפתח בלחיצה על סרטון במצב עריכה. שני מצבים, לפי מה שיושב בתוכן:

   - סרטון בודד (bannerVideo): החלפה, והסרה שמחזירה את תמונת הרוחב
   - סרטון במערך (videos): החלפה, הסרה, סידור והוספה

   סרטונים לא נדחסים - אין דרך מעשית לעשות את זה בדפדפן. לכן המגבלה
   היא גודל הקובץ, והמסך אומר את זה במפורש במקום להיכשל בשקט.

   המידות (width/height) נקראות מהסרטון ונשמרות בתוכן, כי אזור
   הסרטונים נותן לכל אחד את היחס שלו - סרטוני טלפון נבדלים ביניהם,
   ומסגרת אחידה יוצרת פסים שחורים.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";
import { formatBytes, prepareVideo, VIDEO_WARN_BYTES } from "./image";
import { describePath } from "./paths";
import { getValue, insertItem, moveItem, removeItem, setValue } from "./store";
import { asset } from "@/lib/utils";

type Props = {
  /** "services.1.bannerVideo" או "services.3.videos.0" */
  path: string;
  onClose: () => void;
  onSave: () => Promise<void> | void;
  dirtyCount: number;
  saving: boolean;
};

type Clip = { src: string; width?: number; height?: number };

const isClip = (v: unknown): v is Clip =>
  typeof v === "object" && v !== null && typeof (v as Clip).src === "string";

/** "services.3.videos.0" -> { arrayPath: "services.3.videos", index: 0 } */
function splitIndexed(path: string): { arrayPath: string; index: number } | null {
  const match = path.match(/^(.*)\.(\d+)$/);
  if (!match) return null;
  if (!Array.isArray(getValue(match[1]))) return null;
  return { arrayPath: match[1], index: Number(match[2]) };
}

export default function VideoEditor({ path, onClose, onSave, dirtyCount, saving }: Props) {
  const value = getValue(path);
  const indexed = splitIndexed(path);
  const list = indexed && isClip(value) ? indexed : null;
  const items = list ? (getValue(list.arrayPath) as Clip[]) : null;

  /** במערך הנתיב מצביע על האובייקט; בסרטון בודד על המחרוזת עצמה */
  const srcPath = isClip(value) ? `${path}.src` : path;
  const currentSrc = String(getValue(srcPath) ?? "");

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  /** מעלה ומחזיר את הנתיב הציבורי ואת המידות */
  async function upload(file: File, label: string) {
    setError(null);
    setWarning(null);
    setBusy(label);
    try {
      const video = await prepareVideo(file);
      setPreview(video.objectUrl);
      if (video.bytes > VIDEO_WARN_BYTES) {
        setWarning(
          `הסרטון שוקל ${formatBytes(video.bytes)}. הוא יעבוד, אבל יאט את הדף בגלישה סלולרית - ` +
            "כדאי לשקול גרסה קצרה יותר.",
        );
      }
      const { path: publicPath } = await api.uploadImage({
        name: video.name,
        contentType: video.contentType,
        base64: video.base64,
      });
      return { publicPath, width: video.width, height: video.height };
    } catch (e) {
      setPreview(null);
      setError(
        e instanceof ApiError && e.status === 413
          ? e.message
          : e instanceof Error
            ? e.message
            : "ההעלאה נכשלה",
      );
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function replaceVideo(file: File) {
    const result = await upload(file, "מעלה את הסרטון...");
    if (!result) return;
    setValue(srcPath, result.publicPath);
    /* המידות נשמרות רק במערך, שבו לכל סרטון יש יחס משלו */
    if (list) {
      setValue(`${path}.width`, result.width);
      setValue(`${path}.height`, result.height);
    }
  }

  async function addVideo(file: File) {
    if (!list || !items) return;
    const result = await upload(file, "מוסיפה סרטון...");
    if (!result) return;
    insertItem(list.arrayPath, { src: result.publicPath, width: result.width, height: result.height }, items.length);
  }

  function removeVideo() {
    if (list && items) {
      if (!confirm("להסיר את הסרטון? אפשר לבטל לפני שמירה.")) return;
      if (items.length === 1) {
        /* מערך ריק מסתיר את כל האזור - עדיף למחוק את השדה כדי שהתוכן
           יישאר נקי, אבל setValue לא מוחק מפתחות. מערך ריק עושה את
           העבודה, וההצגה מותנית באורך. */
        removeItem(list.arrayPath, list.index);
      } else {
        removeItem(list.arrayPath, list.index);
      }
      onClose();
      return;
    }
    /* סרטון בודד: מרוקנים את הנתיב, והדף חוזר להציג את תמונת הרוחב */
    if (!confirm("להסיר את הסרטון? במקומו תוצג תמונת הרוחב של הדף.")) return;
    setValue(srcPath, "");
    onClose();
  }

  function move(direction: -1 | 1) {
    if (!list || !items) return;
    const to = list.index + direction;
    if (to < 0 || to >= items.length) return;
    moveItem(list.arrayPath, list.index, to);
    onClose();
  }

  const { page, field } = describePath(path);
  const shownSrc = preview ?? (currentSrc ? asset(currentSrc) : "");

  return (
    <div
      data-cms-toolbar
      dir="rtl"
      className="pointer-events-auto fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="עריכת סרטון"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-surface shadow-lift sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              {list ? "סרטון" : "סרטון הבאנר"}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {page} · {field}
              {list && items ? ` · ${list.index + 1} מתוך ${items.length}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(busy) || saving}
            aria-label="סגירה"
            className="shrink-0 rounded-full px-3 py-1.5 text-2xl leading-none text-muted transition-colors hover:bg-bg hover:text-ink disabled:opacity-40"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">
              {error}
            </p>
          )}
          {warning && (
            <p className="mb-4 rounded-xl bg-gold/20 px-4 py-3 text-sm leading-relaxed text-brand-dark">
              {warning}
            </p>
          )}

          <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-black">
            {shownSrc ? (
              <video src={shownSrc} controls playsInline preload="metadata" className="max-h-64 w-full" />
            ) : (
              <p className="p-8 text-center text-white/70">אין סרטון</p>
            )}
          </div>

          {busy && <p className="mt-3 text-center text-sm font-bold text-brand">{busy}</p>}

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => replaceRef.current?.click()}
              disabled={Boolean(busy) || saving}
              className="w-full rounded-full bg-brand px-4 py-2.5 font-display font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {currentSrc ? "החלפת הסרטון" : "בחירת סרטון מהמחשב"}
            </button>
            <input
              ref={replaceRef}
              type="file"
              accept="video/mp4,video/webm"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void replaceVideo(file);
              }}
            />
            <p className="text-center text-xs leading-relaxed text-muted">
              MP4 או WebM, עד 20MB. סרטונים לא נדחסים אוטומטית - סרטון ארוך יאט את הדף,
              ולכן כדאי להעלות קטעים קצרים.
            </p>
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <h3 className="font-display text-sm font-bold text-brand-dark">
              {list ? "אזור הסרטונים" : "הסרטון בדף"}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {list && items && (
                <>
                  <button
                    type="button"
                    onClick={() => move(-1)}
                    disabled={Boolean(busy) || saving || list.index === 0}
                    className="rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white disabled:opacity-40"
                  >
                    להזיז אחורה
                  </button>
                  <button
                    type="button"
                    onClick={() => move(1)}
                    disabled={Boolean(busy) || saving || list.index === items.length - 1}
                    className="rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white disabled:opacity-40"
                  >
                    להזיז קדימה
                  </button>
                  <button
                    type="button"
                    onClick={() => addRef.current?.click()}
                    disabled={Boolean(busy) || saving}
                    className="rounded-full bg-whatsapp px-3.5 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    הוספת סרטון
                  </button>
                  <input
                    ref={addRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) void addVideo(file);
                    }}
                  />
                </>
              )}
              {currentSrc && (
                <button
                  type="button"
                  onClick={removeVideo}
                  disabled={Boolean(busy) || saving}
                  className="rounded-full px-3.5 py-1.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-40"
                >
                  הסרת הסרטון
                </button>
              )}
            </div>
            {!list && (
              <p className="mt-2 text-xs leading-relaxed text-muted">
                בהסרה, במקום הסרטון תוצג שוב תמונת הרוחב של הדף.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p className="min-w-0 flex-1 text-xs text-muted">
            {dirtyCount > 0 ? "השינוי עדיין לא פורסם באתר." : "אין שינויים שממתינים לפרסום."}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={Boolean(busy) || saving}
              className="rounded-full px-4 py-2 text-sm font-bold text-muted transition-colors hover:bg-bg hover:text-ink disabled:opacity-40"
            >
              סגירה
            </button>
            <button
              type="button"
              onClick={async () => {
                await onSave();
                onClose();
              }}
              disabled={dirtyCount === 0 || Boolean(busy) || saving}
              className="rounded-full bg-whatsapp px-5 py-2 font-display text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {saving ? "שומרת..." : "שמירה ופרסום"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
