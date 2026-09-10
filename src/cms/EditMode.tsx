/* ============================================================================
   מצב העריכה על האתר החי
   ----------------------------------------------------------------------------
   נטען רק אחרי כניסה. מציג סרגל צף, ובמצב "עריכה" הופך כל אלמנט עם
   data-cms לניתן לעריכה במקום (contentEditable). כל שינוי נכתב לאובייקטי
   התוכן (ראו store.ts), ו"שמירה ופרסום" שולח לשרת שיוצר commit.
   ========================================================================== */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "./api";
import { setEditingFlag } from "./editing";
import { setAdminFlag } from "./gate";
import { describeChanges } from "./paths";
import {
  buildSavePayload,
  discardChanges,
  getDirtyPaths,
  getValue,
  loadFromRepo,
  markSaved,
  setValue,
  useDirtyCount,
} from "./store";
import "./cms.css";

const EDITING_KEY = "rz-editing";

/* שני המסכים נטענים רק כשנפתחים - הם לא נחוצים כדי לערוך טקסט */
const History = lazy(() => import("./History"));
const ImageEditor = lazy(() => import("./ImageEditor"));
const VideoEditor = lazy(() => import("./VideoEditor"));

type Status =
  | { kind: "loading" }
  | { kind: "ready"; name: string }
  | { kind: "saving"; name: string }
  | { kind: "saved"; name: string; at: number }
  | { kind: "error"; name: string; message: string };

export default function EditMode() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  /* דלוק כברירת מחדל. מי שהתחברה לפאנל התחברה כדי לערוך, וברירת מחדל
     כבויה שלחה אותה ללחוץ על תמונה ולקבל הגדלה במקום עריכה - בלי שום
     רמז שחסר צעד. כיבוי מפורש נשמר לאורך הסשן ("0"). */
  const [editing, setEditing] = useState(() => sessionStorage.getItem(EDITING_KEY) !== "0");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [imageEdit, setImageEdit] = useState<{ path: string; altPath?: string } | null>(null);
  const [videoEdit, setVideoEdit] = useState<string | null>(null);
  const dirtyCount = useDirtyCount();
  const activeRef = useRef<{ el: HTMLElement; path: string; before: string } | null>(null);

  /* --- אימות התחברות וטעינת התוכן העדכני מהריפו --- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me();
        const content = await api.content();
        if (cancelled) return;
        loadFromRepo(content);
        setStatus({ kind: "ready", name: me.name });
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          setAdminFlag(false); // ההתחברות פגה - השער ייסגר
          return;
        }
        setStatus({ kind: "error", name: "", message: e instanceof Error ? e.message : "שגיאה" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* --- מחלקה על html + אזהרה לפני יציאה עם שינויים --- */
  useEffect(() => {
    document.documentElement.classList.toggle("cms-editing", editing);
    sessionStorage.setItem(EDITING_KEY, editing ? "1" : "0");
    /* קומפוננטות שמנהלות רשימות (המלצות) צריכות להציג פקדי הוספה
       והסרה רק בעריכה, ולכן הדגל נחשף להן דרך חנות קטנה */
    setEditingFlag(editing);
    return () => {
      document.documentElement.classList.remove("cms-editing");
      setEditingFlag(false);
    };
  }, [editing]);

  useEffect(() => {
    if (!dirtyCount) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyCount]);

  /* --- עריכה במקום --- */
  const commit = useCallback(() => {
    const active = activeRef.current;
    if (!active) return;
    activeRef.current = null;
    const { el, path, before } = active;
    el.removeAttribute("contenteditable");
    const value = el.innerText.replace(/ /g, " ").trim();
    if (!value) {
      el.textContent = before; // לא מאפשרים שדה ריק
      return;
    }
    if (value !== before) setValue(path, value);
  }, []);

  const cancel = useCallback(() => {
    const active = activeRef.current;
    if (!active) return;
    activeRef.current = null;
    active.el.removeAttribute("contenteditable");
    active.el.textContent = active.before;
  }, []);

  useEffect(() => {
    if (!editing) return;

    const onClick = (e: MouseEvent) => {
      const clicked = e.target as HTMLElement;
      let target = clicked.closest<HTMLElement>("[data-cms]");

      /* רשת ביטחון: תמונה עטופה בכפתור עם שכבה שפרוסה מעליה
         (absolute inset-0) - לחיצת עכבר פוגעת בשכבה, שאינה צאצא של
         התמונה, ואז closest לא מוצא כלום והלחיצה משתחררת לכפתור. זה
         גרם ללחיצה על תמונה בגלריה לפתוח הגדלה במקום עריכה.
         התיוג הועבר לעוטפים, וזה מכסה גם מקרים עתידיים. */
      if (!target) {
        const container = clicked.closest<HTMLElement>("button, a, figure, [data-cms-scope]");
        const inside = container?.querySelector<HTMLElement>('[data-cms-type="image"], [data-cms]');
        if (inside) target = inside;
      }
      // לחיצה בתוך הסרגל או מחוץ לאלמנט ניתן לעריכה
      if (!target || target.closest("[data-cms-toolbar]")) {
        if (activeRef.current && !(e.target as HTMLElement).closest("[data-cms-toolbar]")) commit();
        return;
      }
      // בזמן עריכה קישורים וכפתורים לא פועלים
      e.preventDefault();
      e.stopPropagation();
      if (activeRef.current?.el === target) return;
      if (activeRef.current) commit();

      const type = target.dataset.cmsType ?? "text";

      /* תמונה נערכת בדיאלוג ולא במקום: צריך בורר קבצים, תיאור לנגישות,
         ובגלריה גם הוספה, הסרה וסידור. */
      if (type === "image") {
        if (activeRef.current) commit();
        setImageEdit({ path: target.dataset.cms!, altPath: target.dataset.cmsAlt });
        return;
      }
      if (type === "video") {
        if (activeRef.current) commit();
        setVideoEdit(target.dataset.cms!);
        return;
      }
      if (type !== "text") return;

      const path = target.dataset.cms!;
      const current = getValue(path);
      const before = typeof current === "string" ? current : target.innerText.trim();
      target.setAttribute("contenteditable", "plaintext-only");
      if (!target.isContentEditable) target.setAttribute("contenteditable", "true");
      activeRef.current = { el: target, path, before };
      target.focus();
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };

    const onKey = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commit();
      }
    };

    const onBlur = (e: FocusEvent) => {
      if (activeRef.current && e.target === activeRef.current.el) commit();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("blur", onBlur, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("blur", onBlur, true);
      if (activeRef.current) commit();
    };
  }, [editing, commit, cancel]);

  /* --- פעולות הסרגל --- */
  const name = status.kind === "loading" ? "" : status.name;

  async function save() {
    if (status.kind !== "ready" && status.kind !== "saved" && status.kind !== "error") return;
    commit();
    const paths = getDirtyPaths();
    if (!paths.length) return;
    setStatus({ kind: "saving", name });
    try {
      const result = await api.save(buildSavePayload(describeChanges(paths)));
      markSaved(result.saved);
      setStatus({ kind: "saved", name, at: Date.now() });
    } catch (e) {
      const message =
        e instanceof ApiError && e.status === 409
          ? "מישהי אחרת שמרה בינתיים. רעננו את הדף, והשינויים שלכן יצטרכו להיעשות שוב."
          : e instanceof Error
            ? e.message
            : "השמירה נכשלה";
      setStatus({ kind: "error", name, message });
    }
  }

  function discard() {
    if (!dirtyCount) return;
    if (!confirm(`לבטל ${dirtyCount} שינויים שלא נשמרו?`)) return;
    cancel();
    discardChanges();
    // הדף מציג את הערכים מהאובייקטים - רענון קל של הנתיב מחזיר את הטקסטים
    navigate(0);
  }

  async function logout() {
    if (dirtyCount && !confirm("יש שינויים שלא נשמרו. לצאת בכל זאת?")) return;
    setEditing(false);
    await api.logout().catch(() => undefined);
    setAdminFlag(false);
  }

  if (status.kind === "loading") return null;

  return (
    <>
    <div
      data-cms-toolbar
      dir="rtl"
      className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-3 pointer-events-none print:hidden"
    >
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-full bg-ink/95 px-3 py-2 text-sm text-white shadow-lift ring-1 ring-white/15 backdrop-blur">
        <span className="hidden px-2 font-display font-bold sm:inline">שלום, {name}</span>

        {/* כשהמצב כבוי הכפתור הוא קריאה לפעולה בולטת ולא תווית סתמית:
            "מצב עריכה" לא אמר לאף אחת שצריך ללחוץ, ובלי הלחיצה לחיצה על
            תמונה פותחת הגדלה במקום עריכה. */}
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`rounded-full px-4 py-1.5 font-display font-bold transition-colors ${
            editing ? "bg-gold text-brand-dark" : "bg-whatsapp text-white hover:opacity-90"
          }`}
          aria-pressed={editing}
        >
          {editing ? "מצב עריכה: פועל" : "התחלת עריכה"}
        </button>

        {!editing && (
          <span className="hidden text-xs text-white/70 sm:inline">
            כדי לערוך טקסט או תמונה - צריך להדליק
          </span>
        )}

        {dirtyCount > 0 && (
          <span className="rounded-full bg-white/10 px-3 py-1.5">
            {dirtyCount === 1 ? "שינוי אחד" : `${dirtyCount} שינויים`}
          </span>
        )}

        <button
          type="button"
          onClick={save}
          disabled={!dirtyCount || status.kind === "saving"}
          className="rounded-full bg-whatsapp px-4 py-1.5 font-display font-bold text-white transition-opacity disabled:opacity-40"
        >
          {status.kind === "saving" ? "שומרת..." : "שמירה ופרסום"}
        </button>

        {dirtyCount > 0 && (
          <button type="button" onClick={discard} className="rounded-full px-3 py-1.5 hover:bg-white/10">
            ביטול
          </button>
        )}

        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/10"
        >
          היסטוריה
        </button>

        <button type="button" onClick={logout} className="rounded-full px-3 py-1.5 text-white/70 hover:bg-white/10">
          יציאה
        </button>

        {status.kind === "saved" && (
          <span className="basis-full text-center text-xs text-gold sm:basis-auto sm:text-start">
            נשמר. האתר מתעדכן תוך כדקה
          </span>
        )}
        {status.kind === "error" && (
          <span className="basis-full text-center text-xs text-red-300 sm:basis-auto sm:text-start">
            {status.message}
          </span>
        )}
      </div>
    </div>

    {/* ‼️ הדיאלוגים אחים של הסרגל ולא צאצאים שלו.
        למעטפת הסרגל יש pointer-events-none (כדי שהיא לא תחסום את הדף
        מסביב לכפתורים), וזה עובר בירושה. כשהם היו בתוכה, אף כפתור
        בתוכם לא קיבל לחיצות עכבר: הדיאלוג נפתח ונראה תקין, ולא הגיב
        לכלום. בדיקות שהשתמשו ב-element.click() לא גילו את זה, כי קליק
        תכנותי מדלג על pointer-events. */}
      {imageEdit && (
        <Suspense fallback={null}>
          <ImageEditor
            path={imageEdit.path}
            altPath={imageEdit.altPath}
            onClose={() => setImageEdit(null)}
            onChanged={() => undefined}
            onSave={save}
            dirtyCount={dirtyCount}
            saving={status.kind === "saving"}
          />
        </Suspense>
      )}

      {videoEdit && (
        <Suspense fallback={null}>
          <VideoEditor
            path={videoEdit}
            onClose={() => setVideoEdit(null)}
            onSave={save}
            dirtyCount={dirtyCount}
            saving={status.kind === "saving"}
          />
        </Suspense>
      )}

      {historyOpen && (
        <Suspense fallback={null}>
          <History
            onClose={() => setHistoryOpen(false)}
            /* שחזור טוען ערכים ישנים כשינויים לא-שמורים. מדליקים את מצב
               העריכה כדי שהיא תראה מיד מה השתנה ותוכל לאשר או לבטל. */
            onRestored={() => setEditing(true)}
          />
        </Suspense>
      )}
    </>
  );
}
