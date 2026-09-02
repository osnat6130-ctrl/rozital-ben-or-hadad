import { useState } from "react";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import { QuoteIcon, ZoomIcon } from "./Icons";
import type { ServiceMotion, Testimonial } from "@/data/services";
import { asset } from "@/lib/utils";

type Props = {
  items: Testimonial[];
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
export default function Testimonials({ items, motion = "calm", image }: Props) {
  const [imageOpen, setImageOpen] = useState(false);
  const reveal = motion === "calm" ? "calm" : "pop";

  return (
    <div className="mt-12 gap-5 [column-fill:_balance] sm:columns-2 lg:columns-3">
      {image && (
        <Reveal variant={reveal} className="mb-5 block break-inside-avoid">
          <button
            type="button"
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

      {items.map((item, i) => (
        <Reveal
          key={item.text}
          variant={reveal}
          delay={(i % 3) * 90}
          className="mb-5 block break-inside-avoid"
        >
          <figure className="relative h-full overflow-hidden rounded-3xl bg-surface p-6 shadow-card ring-1 ring-line/60 sm:p-7">
            <QuoteIcon
              className="absolute -left-1 -top-1 h-14 w-14 text-accent/10"
              aria-hidden
            />
            <blockquote className="relative leading-relaxed text-muted">
              {item.text}
            </blockquote>
            {item.context && (
              <figcaption className="mt-4 flex items-center gap-2 font-display text-sm font-bold text-accent">
                <span aria-hidden className="h-px w-5 bg-accent/50" />
                {item.context}
              </figcaption>
            )}
          </figure>
        </Reveal>
      ))}

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
