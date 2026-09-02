import { useCallback, useEffect } from "react";
import { CloseIcon } from "./Icons";
import { asset } from "@/lib/utils";

type Image = { src: string; alt: string };

type Props = {
  images: Image[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

/**
 * תצוגת תמונה מוגדלת.
 * תמיכה מלאה במקלדת: Esc לסגירה, חיצים למעבר בין תמונות (בכיוון RTL).
 */
export default function Lightbox({ images, index, onClose, onNavigate }: Props) {
  const isOpen = index !== null;

  const go = useCallback(
    (step: number) => {
      if (index === null) return;
      onNavigate((index + step + images.length) % images.length);
    },
    [index, images.length, onNavigate],
  );

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // ב-RTL: חץ שמאלה = התמונה הבאה
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "ArrowRight") go(-1);
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, go]);

  if (!isOpen) return null;
  const image = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="תצוגת תמונה מוגדלת"
      className="fixed inset-0 z-[70] flex animate-fade-in items-center justify-center bg-brand-dark/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="סגירת התמונה"
        autoFocus
        className="absolute left-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
      >
        <CloseIcon className="h-6 w-6" />
      </button>

      <figure
        className="max-h-full w-full max-w-4xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={asset(image.src)}
          alt={image.alt}
          className="mx-auto max-h-[76vh] w-auto rounded-2xl object-contain shadow-lift"
        />
        <figcaption className="mt-4 text-sm text-white/80">{image.alt}</figcaption>
      </figure>

      {images.length > 1 && (
        <div
          className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => go(-1)}
            className="rounded-full bg-white/15 px-5 py-2.5 font-display font-bold text-white transition-colors hover:bg-white/30"
          >
            הקודמת
          </button>
          <span className="font-display text-sm text-white/70" dir="ltr">
            {index + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            className="rounded-full bg-white/15 px-5 py-2.5 font-display font-bold text-white transition-colors hover:bg-white/30"
          >
            הבאה
          </button>
        </div>
      )}
    </div>
  );
}
