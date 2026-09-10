import { useRef, useState } from "react";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import { ZoomIcon } from "./Icons";
import AddCard from "@/cms/AddCard";
import { useEditing } from "@/cms/editing";
import { prepareImage } from "@/cms/image";
import { api } from "@/cms/api";
import { cmsImage } from "@/cms/paths";
import { insertItem } from "@/cms/store";
import { asset, cn } from "@/lib/utils";
import type { ServiceMotion } from "@/data/services";

type Props = {
  images: { src: string; alt: string }[];
  motion?: ServiceMotion;
  className?: string;
  /** נתיב מערך הגלריה בתוכן, למשל "services.3.gallery" - מפעיל עריכה בפאנל */
  cmsPath?: string;
};

/**
 * גלריית תמונות עם פריסה משתנה (התמונה הראשונה גדולה יותר)
 * ופתיחה בלייטבוקס בלחיצה.
 */
/** מפצל את התמונות לשלשות - כל שלשה היא בלוק גריד עצמאי (גדולה + שתי קטנות),
 *  כדי שגובה השורות של שלשה אחת לא ישפיע על השלשה שאחריה. */
function chunkIntoTriples<T>(items: T[]): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    groups.push(items.slice(i, i + 3));
  }
  return groups;
}

export default function ImageGallery({ images, motion = "calm", className, cmsPath }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const reveal = motion === "calm" ? "calm" : "pop";
  const groups = chunkIntoTriples(images);
  const editing = useEditing();
  const manageable = editing && Boolean(cmsPath);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addRef = useRef<HTMLInputElement>(null);

  /* ההוספה מעלה ישר מכאן ולא פותחת דיאלוג: הפעולה היא צעד אחד ("בחרי
     תמונה"), ודיאלוג היה מוסיף לחיצה בלי להוסיף מידע. */
  async function addImage(file: File) {
    if (!cmsPath) return;
    setError(null);
    setBusy(true);
    try {
      const image = await prepareImage(file);
      const { path } = await api.uploadImage({
        name: image.name,
        contentType: image.contentType,
        base64: image.base64,
      });
      insertItem(cmsPath, { src: path, alt: "" }, images.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ההעלאה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn(className)}>
      <div className="space-y-3 sm:space-y-4">
        {groups.map((group, g) => (
          <div key={group[0].src} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {group.map((image, j) => {
              const i = g * 3 + j;
              // תמונה שנשארה לבד בשלשה האחרונה מוצגת ממורכזת ובגודל מתון,
              // ובלי חיתוך - כדי שגם פלייר או תמונה לגובה ייראו במלואם
              const alone = group.length === 1;
              return (
                <Reveal
                  key={image.src}
                  variant={reveal}
                  delay={j * 90}
                  className={cn(
                    j === 0 &&
                      (alone
                        ? "col-span-2 mx-auto w-full max-w-lg md:col-span-3"
                        : "col-span-2 md:row-span-2"),
                    // הגדולה תופסת 2x2 משבצות, ולכן ריבועית בדסקטופ - אחרת תמונת
                    // פורטרט גבוהה מותחת את השורות ופותחת רווחים בין הקטנות
                    alone
                      ? "aspect-[4/3]"
                      : j === 0
                        ? "aspect-[4/3] md:aspect-square"
                        : "aspect-square",
                  )}
                >
                  {/* ‼️ התיוג לעריכה על הכפתור ולא על ה-img: שכבת אייקון
                      ההגדלה שמתחתיה פרוסה absolute inset-0 מעל התמונה,
                      ולחיצת עכבר אמיתית פוגעת בה ולא בתמונה. תיוג על
                      ה-img גרם ללחיצה לפתוח הגדלה במקום עריכה. */}
                  <button
                    type="button"
                    {...(cmsPath ? cmsImage(`${cmsPath}.${i}`) : {})}
                    onClick={() => setActive(i)}
                    aria-label={`הגדלת התמונה: ${image.alt}`}
                    className={cn(
                      "group relative block h-full w-full overflow-hidden rounded-2xl shadow-soft ring-1 ring-line/60 transition-shadow duration-300 hover:shadow-card",
                      alone && "bg-accent-soft/25",
                    )}
                  >
                    <img
                      src={asset(image.src)}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "h-full w-full transition-transform duration-700 ease-out group-hover:scale-105",
                        alone ? "object-contain" : "object-cover",
                      )}
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-accent-dark/0 transition-colors duration-300 group-hover:bg-accent-dark/35">
                      <ZoomIcon className="h-9 w-9 scale-75 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        ))}
      </div>

      {manageable && (
        <div className="mt-3 sm:mt-4">
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <AddCard
            compact
            label={busy ? "מעלה תמונה..." : "הוספת תמונה לגלריה"}
            hint="התמונה מוקטנת ונדחסת אוטומטית ל-WebP לפני ההעלאה"
            onClick={() => !busy && addRef.current?.click()}
          />
          <input
            ref={addRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void addImage(file);
            }}
          />
        </div>
      )}

      <Lightbox
        images={images}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </div>
  );
}
