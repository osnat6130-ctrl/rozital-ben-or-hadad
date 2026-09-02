import { useEffect, useRef, useState } from "react";
import { asset, cn } from "@/lib/utils";

type Props = {
  /** תמונת ה-Hero. מוצגת תמיד, וגם משמשת כתמונת הפוסטר של הסרטון */
  image: string;
  /** סרטון אופציונלי. אם אין - מוצגת התמונה בלבד */
  video?: string;
  alt: string;
  className?: string;
};

/**
 * מדיה ל-Hero של דף שירות: תמונה, ואם הוגדר סרטון - הוא נטען אחריה.
 *
 * למה לא פשוט <video autoplay>?
 * קובץ וידאו שוקל הרבה יותר מתמונה, וטעינה מיידית שלו מעכבת את הצגת הדף.
 * לכן התמונה מוצגת ראשונה (כ-poster), והסרטון מתחיל להיטען רק אחרי
 * שהדף צויר. בנוסף הוא לא נטען כלל כאשר:
 *   - המשתמש ביקש תנועה מופחתת (prefers-reduced-motion)
 *   - הדפדפן מדווח על חיסכון בנתונים או חיבור איטי
 * במקרים האלה נשארת התמונה, עם כפתור הפעלה למי שרוצה לצפות.
 */
export default function HeroMedia({ image, video, alt, className }: Props) {
  const [playing, setPlaying] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!video) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const slowConnection =
      connection?.saveData === true || /(^|-)2g$/.test(connection?.effectiveType ?? "");

    if (reduceMotion || slowConnection) return;

    // המתנה קצרה כדי שהסרטון לא יתחרה עם טעינת הדף עצמו
    const timer = window.setTimeout(() => setAllowed(true), 700);
    return () => window.clearTimeout(timer);
  }, [video]);

  if (!video) {
    return (
      <img
        src={asset(image)}
        alt={alt}
        width={900}
        height={675}
        decoding="async"
        className={cn("aspect-[4/3] w-full object-cover", className)}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video
        ref={videoRef}
        poster={asset(image)}
        src={allowed && video ? asset(video) : undefined}
        autoPlay={allowed}
        muted
        loop
        playsInline
        preload="none"
        aria-label={alt}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="aspect-[4/3] w-full object-cover"
      />

      {/* כפתור הפעלה - מוצג כשהסרטון לא מתנגן (תנועה מופחתת, חיבור איטי,
          או דפדפן שחסם ניגון אוטומטי) */}
      {!playing && (
        <button
          type="button"
          onClick={() => {
            setAllowed(true);
            window.setTimeout(() => videoRef.current?.play(), 50);
          }}
          aria-label="הפעלת הסרטון"
          className="absolute inset-0 flex items-center justify-center bg-accent-dark/15 transition-colors hover:bg-accent-dark/25"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lift transition-transform duration-300 hover:scale-110">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-accent" aria-hidden>
              <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
