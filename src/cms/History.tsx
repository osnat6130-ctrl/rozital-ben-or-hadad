/* ============================================================================
   מסך ההיסטוריה והשחזור
   ----------------------------------------------------------------------------
   מציג את הגרסאות של התוכן (היסטוריית ה-git של src/content), ומאפשר
   לשחזר גרסה שלמה או שדה בודד.

   שחזור לא מוחק כלום: הוא טוען את הערכים הישנים כשינויים שלא נשמרו,
   כדי שאפשר יהיה לראות אותם באתר, לבטל, או לשמור אותם כגרסה חדשה.
   ========================================================================== */
import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type CommitSummary } from "./api";
import { diffVersions, type FieldChange } from "./diff";
import { describePath } from "./paths";
import { getSnapshot, restoreSnapshot, setValue } from "./store";

type Props = { onClose: () => void; onRestored: () => void };

type Detail = {
  sha: string;
  /** שינויי תוכן אמיתיים - שדות שקיימים בשתי הגרסאות והערך שלהם שונה,
   *  או שדות שהיו אז ונמחקו מאז (למשל המלצה שהוסרה). אלה בני-שחזור. */
  changes: FieldChange[];
  /** שדות שנוספו למבנה אחרי הגרסה הזאת. "שחזור" שלהם פירושו למחוק שדה
   *  שהאתר צריך עכשיו - ולכן הם לא מוצגים כשינויים ולא ניתנים לשחזור. */
  addedSince: number;
  version: { site: unknown | null; services: unknown | null };
};

const dateFormat = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const relative = new Intl.RelativeTimeFormat("he", { numeric: "auto" });

/* הנתונים העבריים של הדפדפן מוסיפים את הספרה בסוגריים ליחיד ולזוגי:
   "לפני שעה (1)", "לפני שעתיים (2)", "לפני דקה (1)". הניסוח עצמו תקין
   ומספר לא צריך להופיע פעמיים, ולכן מסירים את הזנב. */
const tidy = (text: string) => text.replace(/\s*\(\d+\)\s*$/, "");

function timeAgo(iso: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 30],
    ["month", 12],
  ];
  let value = seconds;
  for (const [unit, step] of units) {
    if (Math.abs(value) < step) return tidy(relative.format(-Math.round(value), unit));
    value /= step;
  }
  return tidy(relative.format(-Math.round(value), "year"));
}

/** הצגה קריאה של ערך: מקצרים טקסט ארוך, ומסמנים "אין ערך" */
function preview(value: unknown): string {
  if (value === undefined) return "(לא היה קיים)";
  if (value === null) return "(ריק)";
  const text = String(value);
  if (!text.trim()) return "(ריק)";
  return text.length > 140 ? text.slice(0, 137) + "..." : text;
}

export default function History({ onClose, onRestored }: Props) {
  const [commits, setCommits] = useState<CommitSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSha, setOpenSha] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    api
      .history()
      .then((r) => setCommits(r.commits))
      .catch((e) => setError(e instanceof Error ? e.message : "טעינת ההיסטוריה נכשלה"));
  }, []);

  /* סגירה ב-Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const openVersion = useCallback(
    async (sha: string) => {
      if (openSha === sha) {
        setOpenSha(null);
        setDetail(null);
        return;
      }
      setOpenSha(sha);
      setDetail(null);
      setLoadingDetail(true);
      setError(null);
      try {
        const version = await api.version(sha);
        const current = getSnapshot();
        /* משווים מול התוכן הנוכחי, ולא מול הגרסה שלפני - כך הרשימה עונה
           ישירות על "מה יקרה אם אשחזר", וזו השאלה שבאמת נשאלת כאן. */
        const all = diffVersions(
          { site: version.site, services: version.services },
          { site: current.site, services: current.services },
        );
        setDetail({
          sha,
          changes: all.filter((c) => c.kind !== "added"),
          addedSince: all.filter((c) => c.kind === "added").length,
          version,
        });
      } catch (e) {
        const message =
          e instanceof ApiError && e.status === 404
            ? "הגרסה לא נמצאה בריפו"
            : e instanceof Error
              ? e.message
              : "טעינת הגרסה נכשלה";
        setError(message);
        setOpenSha(null);
      } finally {
        setLoadingDetail(false);
      }
    },
    [openSha],
  );

  function restoreAll() {
    if (!detail) return;
    const count = detail.changes.length;
    if (!count) return;
    if (!confirm(`להחזיר ${count} שדות לגרסה הזאת? השינויים ייטענו לעריכה ולא יישמרו עד שתלחצי "שמירה ופרסום".`)) {
      return;
    }
    restoreSnapshot(detail.version);
    onRestored();
    onClose();
  }

  /* שחזור שדה בודד נתמך רק כשהשדה קיים בשתי הגרסאות. שדה שנמחק מאז
     (למשל המלצה שהוסרה) דורש שינוי במערך עצמו, וזה מה ש"שחזור הגרסה
     כולה" עושה. */
  function restoreField(change: FieldChange) {
    if (change.kind !== "changed") return;
    setValue(change.path, change.before);
    setDetail({ ...detail!, changes: detail!.changes.filter((c) => c.path !== change.path) });
    onRestored();
  }

  return (
    <div
      data-cms-toolbar
      dir="rtl"
      className="pointer-events-auto fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="היסטוריית שינויים"
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-surface shadow-lift sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">היסטוריית שינויים</h2>
            <p className="mt-0.5 text-sm text-muted">כל שמירה נשמרת לנצח. אפשר לחזור לכל גרסה.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="shrink-0 rounded-full px-3 py-1.5 text-2xl leading-none text-muted transition-colors hover:bg-bg hover:text-ink"
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

          {commits === null && !error && <p className="py-8 text-center text-muted">טוענת...</p>}

          {commits?.length === 0 && <p className="py-8 text-center text-muted">עוד לא נשמרו שינויים.</p>}

          <ol className="space-y-2">
            {commits?.map((commit, i) => {
              const isOpen = openSha === commit.sha;
              return (
                <li key={commit.sha} className="rounded-2xl bg-bg ring-1 ring-line/70">
                  <button
                    type="button"
                    onClick={() => openVersion(commit.sha)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-line/30"
                  >
                    <span className="mt-1 shrink-0 text-lg" aria-hidden>
                      {i === 0 ? "🟢" : "🕘"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-bold text-ink">{commit.message}</span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {commit.author} · {timeAgo(commit.date)} · {dateFormat.format(new Date(commit.date))}
                        {i === 0 && <span className="ms-2 font-bold text-whatsapp">הגרסה באוויר</span>}
                      </span>
                    </span>
                    <span className={`mt-1 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-line/70 px-4 py-3">
                      {loadingDetail && <p className="py-2 text-sm text-muted">משווה לגרסה הנוכחית...</p>}

                      {detail?.sha === commit.sha && detail.changes.length === 0 && (
                        <p className="py-2 text-sm text-muted">
                          התוכן בגרסה הזאת זהה למה שבאתר - אין מה לשחזר.
                          {detail.addedSince > 0 && ` (מאז נוספו ${detail.addedSince} שדות חדשים, שאינם שינוי תוכן.)`}
                        </p>
                      )}

                      {detail?.sha === commit.sha && detail.changes.length > 0 && (
                        <>
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm text-muted">
                              {detail.changes.length === 1
                                ? "שדה אחד שונה מהתוכן הנוכחי"
                                : `${detail.changes.length} שדות שונים מהתוכן הנוכחי`}
                            </p>
                            <button
                              type="button"
                              onClick={restoreAll}
                              className="rounded-full bg-brand px-4 py-1.5 font-display text-sm font-bold text-white transition-colors hover:bg-brand-dark"
                            >
                              שחזור הגרסה כולה
                            </button>
                          </div>

                          <ul className="space-y-3">
                            {detail.changes.slice(0, 60).map((change) => {
                              const { page, field } = describePath(change.path);
                              return (
                                <li key={change.path} className="rounded-xl bg-surface p-3 ring-1 ring-line/60">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-display text-sm font-bold text-brand-dark">
                                      {page} · {field}
                                    </span>
                                    {change.kind === "changed" ? (
                                      <button
                                        type="button"
                                        onClick={() => restoreField(change)}
                                        className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white"
                                      >
                                        שחזור השדה
                                      </button>
                                    ) : (
                                      <span className="rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-brand-dark">
                                        נמחק מאז
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-2 text-sm leading-relaxed text-muted">
                                    <span className="font-bold text-ink">בגרסה הזאת:</span> {preview(change.before)}
                                  </p>
                                  <p className="mt-1 text-sm leading-relaxed text-muted">
                                    <span className="font-bold text-ink">כרגע באתר:</span> {preview(change.after)}
                                  </p>
                                </li>
                              );
                            })}
                          </ul>

                          {detail.changes.length > 60 && (
                            <p className="mt-3 text-sm text-muted">
                              ועוד {detail.changes.length - 60} שדות. "שחזור הגרסה כולה" מחזיר את כולם.
                            </p>
                          )}
                        </>
                      )}

                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs text-muted underline underline-offset-2 hover:text-brand"
                      >
                        לצפייה בגרסה בגיטהאב
                      </a>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
