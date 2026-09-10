/* ============================================================================
   עורך תמונות וגלריה
   ----------------------------------------------------------------------------
   נפתח בלחיצה על תמונה במצב עריכה. שני מצבים, לפי מה שיושב בתוכן:

   - תמונה בודדת: החלפה + תיאור לנגישות
   - פריט בגלריה: אותו דבר, ובנוסף הוספה, הסרה ושינוי סדר

   ההעלאה יוצרת commit מיד (התמונה צריכה כתובת אמיתית כדי להיראות),
   אבל *הנתיב בתוכן* נשמר כשינוי לא-שמור - כך שאפשר לבטל, וההתנהגות
   זהה לעריכת טקסט.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";
import { prepareImage } from "./image";
import { describePath } from "./paths";
import { getValue, insertItem, moveItem, removeItem, setValue } from "./store";
import { asset } from "@/lib/utils";

type Props = {
  /** הנתיב שנלחץ: "site.about.image" או "services.3.gallery.5" */
  path: string;
  /** נתיב תיאור התמונה, כשהוא יושב במפתח נפרד */
  altPath?: string;
  onClose: () => void;
  onChanged: () => void;
};

type GalleryItem = { src: string; alt?: string };

const isGalleryItem = (v: unknown): v is GalleryItem =>
  typeof v === "object" && v !== null && typeof (v as GalleryItem).src === "string";

/** "services.3.gallery.5" -> { arrayPath: "services.3.gallery", index: 5 } */
function splitIndexed(path: string): { arrayPath: string; index: number } | null {
  const match = path.match(/^(.*)\.(\d+)$/);
  if (!match) return null;
  const arrayPath = match[1];
  if (!Array.isArray(getValue(arrayPath))) return null;
  return { arrayPath, index: Number(match[2]) };
}

export default function ImageEditor({ path, altPath, onClose, onChanged }: Props) {
  const value = getValue(path);
  const indexed = splitIndexed(path);
  const gallery = indexed && isGalleryItem(value) ? indexed : null;

  /* מצב הגלריה נקרא מחדש בכל רינדור כדי לשקף הוספה והסרה */
  const items = gallery ? (getValue(gallery.arrayPath) as GalleryItem[]) : null;

  const srcPath = isGalleryItem(value) ? `${path}.src` : path;
  const altFieldPath = isGalleryItem(value) ? `${path}.alt` : altPath;

  const currentSrc = String(getValue(srcPath) ?? "");
  const currentAlt = String((altFieldPath ? getValue(altFieldPath) : "") ?? "");

  const [alt, setAlt] = useState(currentAlt);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  /** מעלה קובץ ומחזיר את הנתיב הציבורי, עם דחיסה בדפדפן */
  async function upload(file: File, label: string): Promise<string | null> {
    setError(null);
    setBusy(label);
    try {
      const image = await prepareImage(file);
      setPreview(image.dataUrl);
      const { path: publicPath } = await api.uploadImage({
        name: image.name,
        contentType: image.contentType,
        base64: image.base64,
      });
      return publicPath;
    } catch (e) {
      setPreview(null);
      const message =
        e instanceof ApiError && e.status === 413
          ? e.message
          : e instanceof Error
            ? e.message
            : "ההעלאה נכשלה";
      setError(message);
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function replaceImage(file: File) {
    const publicPath = await upload(file, "מעלה את התמונה...");
    if (!publicPath) return;
    setValue(srcPath, publicPath);
    onChanged();
  }

  async function addToGallery(file: File) {
    if (!gallery || !items) return;
    const publicPath = await upload(file, "מוסיפה תמונה לגלריה...");
    if (!publicPath) return;
    insertItem(gallery.arrayPath, { src: publicPath, alt: "" }, items.length);
    onChanged();
  }

  function saveAlt() {
    if (!altFieldPath || alt === currentAlt) return;
    setValue(altFieldPath, alt);
    onChanged();
  }

  function remove() {
    if (!gallery || !items) return;
    if (items.length <= 1) {
      setError("זו התמונה האחרונה בגלריה - אי אפשר להסיר אותה.");
      return;
    }
    if (!confirm("להסיר את התמונה מהגלריה? אפשר לבטל לפני שמירה.")) return;
    removeItem(gallery.arrayPath, gallery.index);
    onChanged();
    onClose();
  }

  function move(direction: -1 | 1) {
    if (!gallery || !items) return;
    const to = gallery.index + direction;
    if (to < 0 || to >= items.length) return;
    moveItem(gallery.arrayPath, gallery.index, to);
    onChanged();
    onClose();
  }

  const { page, field } = describePath(path);
  const shownSrc = preview ?? asset(currentSrc);

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
        aria-label="עריכת תמונה"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-surface shadow-lift sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              {gallery ? "תמונה בגלריה" : "החלפת תמונה"}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {page} · {field}
              {gallery && items ? ` · ${gallery.index + 1} מתוך ${items.length}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(busy)}
            aria-label="סגירה"
            className="shrink-0 rounded-full px-3 py-1.5 text-2xl leading-none text-muted transition-colors hover:bg-bg hover:text-ink disabled:opacity-40"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* גובה קבוע לתצוגה המקדימה: בלעדיו הדיאלוג "קופץ" כשהתמונה
              מסיימת להיטען, והכפתורים זזים בדיוק כשמכוונים אליהם. */}
          <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-bg ring-1 ring-line/70">
            {shownSrc ? (
              <img src={shownSrc} alt={alt || "התמונה הנוכחית"} className="max-h-64 w-full object-contain" />
            ) : (
              <p className="p-8 text-center text-muted">אין תמונה</p>
            )}
          </div>

          {busy && <p className="mt-3 text-center text-sm font-bold text-brand">{busy}</p>}

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={Boolean(busy)}
              className="w-full rounded-full bg-brand px-4 py-2.5 font-display font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              בחירת תמונה מהמחשב
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void replaceImage(file);
              }}
            />
            <p className="text-center text-xs text-muted">
              התמונה מוקטנת ונדחסת אוטומטית לפני ההעלאה, כדי שהאתר יישאר מהיר
            </p>
          </div>

          {altFieldPath && (
            <div className="mt-5">
              <label className="block">
                <span className="mb-1.5 block font-display text-sm font-bold text-brand-dark">
                  תיאור התמונה
                </span>
                <input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  onBlur={saveAlt}
                  placeholder="למשל: אמא ובת יוצרות יחד בסדנה"
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 outline-none focus:border-accent"
                />
              </label>
              <p className="mt-1.5 text-xs text-muted">
                נקרא בקול על ידי קוראי מסך, ומוצג אם התמונה לא נטענת. חלק מהנגישות של האתר.
              </p>
            </div>
          )}

          {gallery && items && (
            <div className="mt-6 border-t border-line pt-4">
              <h3 className="font-display text-sm font-bold text-brand-dark">הגלריה</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  disabled={Boolean(busy) || gallery.index === 0}
                  className="rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white disabled:opacity-40"
                >
                  להזיז אחורה
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  disabled={Boolean(busy) || gallery.index === items.length - 1}
                  className="rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white disabled:opacity-40"
                >
                  להזיז קדימה
                </button>
                <button
                  type="button"
                  onClick={() => addRef.current?.click()}
                  disabled={Boolean(busy)}
                  className="rounded-full bg-whatsapp px-3.5 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  הוספת תמונה לגלריה
                </button>
                <input
                  ref={addRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void addToGallery(file);
                  }}
                />
                <button
                  type="button"
                  onClick={remove}
                  disabled={Boolean(busy)}
                  className="rounded-full px-3.5 py-1.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-40"
                >
                  הסרת התמונה
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line px-5 py-3">
          <p className="text-xs text-muted">
            השינוי עדיין לא פורסם. לחצי "שמירה ופרסום" בסרגל כדי שיעלה לאתר.
          </p>
        </div>
      </div>
    </div>
  );
}
