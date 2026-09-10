import { useState } from "react";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import { QuoteIcon, ZoomIcon } from "./Icons";
import type { ServiceMotion, Testimonial } from "@/data/services";
import { asset } from "@/lib/utils";
import { cms, cmsImage } from "@/cms/paths";
import AddCard from "@/cms/AddCard";
import { useEditing } from "@/cms/editing";
import { insertItem, moveItem, removeItem } from "@/cms/store";

type Props = {
  items: Testimonial[];
  /** נתיב התוכן של המערך, למשל "services.0.testimonials" */
  cmsPath?: string;
  motion?: ServiceMotion;
  /** תמונה נוספת להצגה כקלף בתוך הרשת (למשל דף משוב בכתב יד), עם לחיצה להגדלה */
  image?: { src: string; alt: string };
};

/**
 * המלצות אמיתיות שהתקבלו מרוזיטל.
 *
 * הפריסה היא עמודות CSS ולא רשת: ההמלצות שונות מאוד באורכן (מכמה מילים
 * ועד פסקה שלמה), ובעמודות כל כרטיס תופס בדיוק את הגובה שלו - בלי
 * חורים לבנים שנוצרים ברשת כשכל השורה מתיישרת לכרטיס הארוך ביותר.
 */
export default function Testimonials({ items, motion = "calm", image, cmsPath }: Props) {
  const [imageOpen, setImageOpen] = useState(false);
  const reveal = motion === "calm" ? "calm" : "pop";
  const editing = useEditing();
  /** פקדי ניהול הרשימה מופיעים רק בעריכה, ורק כשיש נתיב תוכן */
  const manageable = editing && Boolean(cmsPath);

  /* ‼️ המלצה ריקה לא מוצגת לגולשת.
     "הוספת המלצה" יוצרת פריט ריק שממתין להדבקת הטקסט האמיתי. אם הוא
     יישמר לפני שהוקלד בו משהו, גולשת לא תראה כרטיס ריק - היא פשוט לא
     תראה אותו. בעריכה הוא כן מוצג, כדי שאפשר יהיה למלא או להסיר.

     ‼️ האינדקס המקורי נשמר ליד הפריט: הסינון משנה מקומות, ונתיב עריכה
     שנבנה לפי מקום ברשימה המסוננת היה מצביע על המלצה אחרת. */
  const visible = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => manageable || item.text.trim().length > 0);

  return (
    <div className="mt-12 gap-5 [column-fill:_balance] sm:columns-2 lg:columns-3">
      {image && (
        <Reveal variant={reveal} className="mb-5 block break-inside-avoid">
          {/* התיוג על הכפתור ולא על ה-img - שכבת האייקון מכסה את התמונה */}
          <button
            type="button"
            {...(cmsPath ? cmsImage(`${cmsPath.replace(/\.testimonials$/, "")}.testimonialsImage`) : {})}
            onClick={() => setImageOpen(true)}
            aria-label={`הגדלת התמונה: ${image.alt}`}
            className="group relative block w-full overflow-hidden rounded-3xl shadow-card ring-1 ring-line/60"
          >
            <img
              src={asset(image.src)}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-accent-dark/0 transition-colors duration-300 group-hover:bg-accent-dark/35">
              <ZoomIcon className="h-9 w-9 scale-75 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
            </span>
          </button>
        </Reveal>
      )}

      {visible.map(({ item, index: i }, position) => (
        <Reveal
          key={i}
          variant={reveal}
          delay={(i % 3) * 90}
          className="mb-5 block break-inside-avoid"
        >
          <figure className="relative h-full overflow-hidden rounded-3xl bg-surface p-6 shadow-card ring-1 ring-line/60 sm:p-7">
            <QuoteIcon
              className="absolute -left-1 -top-1 h-14 w-14 text-accent/10"
              aria-hidden
            />
            <blockquote
              {...(cmsPath ? cms(`${cmsPath}.${i}.text`) : {})}
              className="relative leading-relaxed text-muted"
            >
              {/* ריק נשאר ריק. הטקסט המנחה מגיע מ-CSS (::before), כי טקסט
                  אמיתי כאן היה נשמר כתוכן ההמלצה אם לוחצים ולא מקלידים -
                  העריכה קוראת את innerText, ו-::before לא נכלל בו. */}
              {item.text}
            </blockquote>
            {item.context && (
              <figcaption className="mt-4 flex items-center gap-2 font-display text-sm font-bold text-accent">
                <span aria-hidden className="h-px w-5 bg-accent/50" />
                {item.context}
              </figcaption>
            )}

            {manageable && (
              <div data-cms-toolbar className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => moveItem(cmsPath!, i, i - 1)}
                  disabled={i === 0}
                  aria-label="להזיז את ההמלצה אחורה"
                  className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(cmsPath!, i, i + 1)}
                  disabled={position === visible.length - 1}
                  aria-label="להזיז את ההמלצה קדימה"
                  className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-dark transition-colors hover:bg-brand hover:text-white disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("להסיר את ההמלצה? אפשר לבטל לפני שמירה.")) removeItem(cmsPath!, i);
                  }}
                  className="ms-auto rounded-full px-2.5 py-1 text-xs font-bold text-red-700 transition-colors hover:bg-red-50"
                >
                  הסרה
                </button>
              </div>
            )}
          </figure>
        </Reveal>
      ))}

      {manageable && (
        <div className="mb-5 block break-inside-avoid">
          <AddCard
            label="הוספת המלצה"
            hint="נוצר כרטיס ריק. לוחצים עליו ומדביקים את ההמלצה כלשונה."
            onClick={() => insertItem(cmsPath!, { text: "" }, items.length)}
          />
        </div>
      )}

      {image && (
        <Lightbox
          images={[image]}
          index={imageOpen ? 0 : null}
          onClose={() => setImageOpen(false)}
          onNavigate={() => {}}
        />
      )}
    </div>
  );
}
