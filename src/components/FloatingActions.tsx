import { WhatsappIcon } from "./Icons";
import { whatsappLink } from "@/data/site";

/**
 * כפתור וואטסאפ צף בכל העמודים - בדסקטופ בגודל מלא עם תווית,
 * ובמובייל כפתור עגול קטן יותר בפינה.
 */
export default function FloatingActions() {
  return (
    <>
      {/* --- דסקטופ / טאבלט --- */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שליחת הודעה בוואטסאפ"
        className="group fixed bottom-7 right-7 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-transform duration-300 hover:scale-110 lg:flex"
      >
        <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-whatsapp/50 motion-reduce:hidden" />
        <WhatsappIcon className="h-7 w-7" />
        <span className="pointer-events-none absolute right-[calc(100%+0.75rem)] whitespace-nowrap rounded-full bg-brand-dark px-4 py-2 font-display text-sm font-bold text-white opacity-0 shadow-soft transition-all duration-300 group-hover:opacity-100">
          יש לך שאלה? דברי איתי
        </span>
      </a>

      {/* --- מובייל --- */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שליחת הודעה בוואטסאפ"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift lg:hidden"
      >
        <WhatsappIcon className="h-6 w-6" />
      </a>
    </>
  );
}
