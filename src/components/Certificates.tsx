import { useRef, useState } from "react";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import { ZoomIcon } from "./Icons";
import AddCard from "@/cms/AddCard";
import { api } from "@/cms/api";
import { useEditing } from "@/cms/editing";
import { prepareImage } from "@/cms/image";
import { rememberUpload } from "@/cms/pending";
import { cms, cmsImage } from "@/cms/paths";
import { insertItem, moveItem, removeItem } from "@/cms/store";
import { certificates } from "@/data/site";
import { asset } from "@/lib/utils";

const PATH = "site.certificates";

/**
 * תעודות ההסמכה של רוזיטל - רשת תמונות שנפתחות בלייטבוקס בלחיצה.
 *
 * ‼️ התמונות של התעודות המקוריות הוכנו על ידי
 *    scripts/prepare-certificates.mjs, שגם מסתיר את מספר תעודת הזהות
 *    בתעודות שכוללות אותו. תעודה שמתווספת מהפאנל לא עוברת דרך שם -
 *    לכן ההערה בכרטיס ההוספה מזכירה לבדוק שאין ת"ז בתמונה.
 */
export default function Certificates() {
  const [active, setActive] = useState<number | null>(null);
  const editing = useEditing();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addRef = useRef<HTMLInputElement>(null);

  /* ‼️ תעודה בלי שם לא מוצגת לגולשת.
     "הוספת תעודה" מעלה את התמונה ומשאירה את השם ריק, כדי שלא יישמר
     טקסט ממלא מקום שיכול להגיע לאתר. עד שהשם ימולא הכרטיס מוסתר
     מגולשים - אבל **מוצג בעריכה** עם הערה ברורה, כדי שזה לא ייעלם
     בשקט ורוזיטל לא תחשוב שההוספה נכשלה.

     האינדקס המקורי נשמר ליד הפריט: הסינון משנה מקומות, ונתיב עריכה
     שנבנה לפי המקום ברשימה המסוננת היה מצביע על תעודה אחרת. */
  const visible = certificates
    .map((cert, index) => ({ cert, index }))
    .filter(({ cert }) => editing || cert.title.trim().length > 0);

  const images = visible.map(({ cert }) => ({ src: cert.src, alt: cert.title }));

  /* ההוספה מעלה את התמונה קודם ורק אז מוסיפה את הפריט, כמו בגלריה:
     כך אין רגע שבו יש בתוכן תעודה עם src ריק. */
  async function addCertificate(file: File) {
    setError(null);
    setBusy(true);
    try {
      const image = await prepareImage(file);
      const { path } = await api.uploadImage({
        name: image.name,
        contentType: image.contentType,
        base64: image.base64,
      });
      rememberUpload(path, image.dataUrl); // ראו src/cms/pending.ts
      insertItem(PATH, { src: path, title: "", issuer: "", meta: "" }, certificates.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ההעלאה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-12">
      {editing && error && (
        <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ cert, index: i }, position) => {
          const incomplete = !cert.title.trim();
          return (
            <Reveal key={i} delay={position * 90} className="flex">
              <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-line/70">
                {/* ‼️ כפתור ההגדלה הוא אלמנט נפרד מפקדי הניהול שמתחתיו.
                    הוא היה עוטף את כל הכרטיס, וכפתור בתוך כפתור הוא HTML
                    לא חוקי - הדפדפן היה מפרק אותו, ו"הסרה" לא הייתה
                    נלחצת בכלל. */}
                <button
                  type="button"
                  onClick={() => setActive(position)}
                  aria-label={`הגדלת התעודה: ${cert.title || "תעודה"}`}
                  className="group block text-right"
                >
                  {/* התיוג על העוטף ולא על ה-img - שכבת האייקון מכסה את התמונה */}
                  <span
                    {...cmsImage(`${PATH}.${i}.src`)}
                    className="relative block overflow-hidden bg-brand-soft/40"
                  >
                    <img
                      src={asset(cert.src)}
                      alt={cert.title}
                      loading="lazy"
                      decoding="async"
                      className="h-56 w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-brand-dark/0 transition-colors duration-300 group-hover:bg-brand-dark/30">
                      <ZoomIcon className="h-9 w-9 scale-75 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                    </span>
                  </span>
                </button>

                <div className="flex flex-1 flex-col p-5">
                  <span
                    {...cms(`${PATH}.${i}.title`)}
                    className="font-display font-bold leading-snug text-brand-dark"
                  >
                    {cert.title}
                  </span>
                  <span {...cms(`${PATH}.${i}.issuer`)} className="mt-1.5 text-sm text-muted">
                    {cert.issuer}
                  </span>
                  {(cert.meta || editing) && (
                    <span {...cms(`${PATH}.${i}.meta`)} className="mt-2 text-sm font-semibold text-brand">
                      {cert.meta}
                    </span>
                  )}

                  {editing && incomplete && (
                    <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                      צריך למלא את שם התעודה, אחרת היא לא תופיע באתר לגולשים.
                    </p>
                  )}

                  {editing && (
                    <div
                      data-cms-toolbar
                      className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3"
                    >
                      <button
                        type="button"
                        onClick={() => moveItem(PATH, i, i - 1)}
                        disabled={i === 0}
                        aria-label="להזיז את התעודה אחורה"
                        className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(PATH, i, i + 1)}
                        disabled={i === certificates.length - 1}
                        aria-label="להזיז את התעודה קדימה"
                        className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white disabled:opacity-30"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("להסיר את התעודה? אפשר לבטל לפני שמירה.")) removeItem(PATH, i);
                        }}
                        className="ms-auto rounded-full px-2.5 py-1 text-xs font-bold text-red-700 transition-colors hover:bg-red-50"
                      >
                        הסרה
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}

        {/* כרטיס ההוספה הוא פריט ברשת, ולכן הוא מתיישב ליד התעודות
            כשיש מקום בשורה ולא מתחתן. */}
        {editing && (
          <AddCard
            label={busy ? "מעלה תמונה..." : "הוספת תעודה"}
            hint="בוחרים תמונה של התעודה, ואז לוחצים על השם וההסמכה וממלאים. לוודא שלא מופיע מספר ת״ז בתמונה."
            onClick={() => !busy && addRef.current?.click()}
          />
        )}
      </div>

      {editing && (
        <input
          ref={addRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void addCertificate(file);
          }}
        />
      )}

      <Lightbox images={images} index={active} onClose={() => setActive(null)} onNavigate={setActive} />
    </div>
  );
}
