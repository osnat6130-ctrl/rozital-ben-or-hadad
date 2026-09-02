import { useState } from "react";
import Reveal from "./Reveal";
import Lightbox from "./Lightbox";
import { ZoomIcon } from "./Icons";
import { asset, cn } from "@/lib/utils";
import type { ServiceMotion } from "@/data/services";

type Props = {
  images: { src: string; alt: string }[];
  motion?: ServiceMotion;
  className?: string;
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

export default function ImageGallery({ images, motion = "calm", className }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const reveal = motion === "calm" ? "calm" : "pop";
  const groups = chunkIntoTriples(images);

  return (
    <div className={cn(className)}>
      <div className="space-y-3 sm:space-y-4">
        {groups.map((group, g) => (
          <div key={group[0].src} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {group.map((image, j) => {
              const i = g * 3 + j;
              return (
                <Reveal
                  key={image.src}
                  variant={reveal}
                  delay={j * 90}
                  className={cn(
                    j === 0 && "col-span-2 md:row-span-2",
                    j === 0 ? "aspect-[4/3] md:aspect-auto" : "aspect-square",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`הגדלת התמונה: ${image.alt}`}
                    className="group relative block h-full w-full overflow-hidden rounded-2xl shadow-soft ring-1 ring-line/60 transition-shadow duration-300 hover:shadow-card"
                  >
                    <img
                      src={asset(image.src)}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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

      <Lightbox
        images={images}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </div>
  );
}
