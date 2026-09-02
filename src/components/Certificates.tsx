import { useState } from "react";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import { ZoomIcon } from "./Icons";
import { certificates } from "@/data/site";
import { asset } from "@/lib/utils";

/**
 * תעודות ההסמכה של רוזיטל - רשת תמונות שנפתחות בלייטבוקס בלחיצה.
 *
 * ‼️ התמונות עצמן מוכנות על ידי scripts/prepare-certificates.mjs,
 *    שגם מסתיר את מספר תעודת הזהות בתעודות שכוללות אותו.
 */
export default function Certificates() {
  const [active, setActive] = useState<number | null>(null);
  const images = certificates.map((c) => ({ src: c.src, alt: c.title }));

  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {certificates.map((cert, i) => (
        <Reveal key={cert.src} delay={i * 90}>
          <button
            type="button"
            onClick={() => setActive(i)}
            aria-label={`הגדלת התעודה: ${cert.title}`}
            className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-surface text-right shadow-soft ring-1 ring-line/70 transition-all duration-300 hover:shadow-card md:hover:-translate-y-1"
          >
            <span className="relative block overflow-hidden bg-brand-soft/40">
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

            <span className="flex flex-1 flex-col p-5">
              <span className="font-display font-bold leading-snug text-brand-dark">
                {cert.title}
              </span>
              <span className="mt-1.5 text-sm text-muted">{cert.issuer}</span>
              {cert.meta && (
                <span className="mt-2 text-sm font-semibold text-brand">{cert.meta}</span>
              )}
            </span>
          </button>
        </Reveal>
      ))}

      <Lightbox
        images={images}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </div>
  );
}
