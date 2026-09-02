import { asset, cn } from "@/lib/utils";
import { site } from "@/data/site";

/* ============================================================================
   הלוגו של רוזיטל - הקבצים המקוריים
   ----------------------------------------------------------------------------
   הלוגו שהתקבל היה JPEG עם רקע לבן. הרקע הוסר והלוגו פורק לשכבות שקופות
   (PNG עם ערוץ אלפא), כך שהוא יושב נקי על כל רקע - בהיר, כהה או צבעוני:

   public/logo-mark.png      הנורה + הידיים
   public/logo-name.png      "רוזיטל בן אור חדד"
   public/logo-tagline.png   שורת הסלוגן בכתב יד
   public/logo-wordmark.png  השם + הסלוגן יחד
   public/logo-full.png      הלוגו המלא (נורה + טקסט)
   public/logo-original.jpg  הקובץ המקורי, לשמירה

   ‼️ להחלפת הלוגו בעתיד: להחליף את הקבצים האלה ב-public/ באותם שמות.
   אם יתקבל קובץ מקור באיכות גבוהה יותר, אפשר להריץ מחדש את החילוץ:
   node scripts/extract-logo.mjs public/logo-original.jpg public
   ========================================================================== */

type MarkProps = {
  className?: string;
  /** טקסט חלופי. ריק = הסמל דקורטיבי (כשהשם כבר מוצג לידו) */
  alt?: string;
};

export function LogoMark({ className, alt = site.name }: MarkProps) {
  return (
    <img
      src={asset("/logo-mark.png")}
      alt={alt}
      width={178}
      height={240}
      decoding="async"
      aria-hidden={alt === "" || undefined}
      // ‼️ בלי h-full כאן - הגובה מגיע תמיד מה-className של הקורא,
      //    אחרת שתי מחלקות גובה מתנגשות והתמונה נפרסת לגודלה המקורי.
      className={cn("w-auto object-contain", className)}
    />
  );
}

type LogoProps = {
  /** horizontal - הנורה מימין לטקסט (Header/Footer) | stacked - הלוגו המלא */
  variant?: "horizontal" | "stacked";
  className?: string;
  /** שורת הסלוגן בכתב יד מתחת לשם - כמו בלוגו המקורי. ברירת מחדל: מוצגת */
  withTagline?: boolean;
  /** על רקע כהה - הופך את טקסט הלוגו ללבן (הנורה נשארת צהובה) */
  invert?: boolean;
};

export default function Logo({
  variant = "horizontal",
  className,
  withTagline = true,
  invert = false,
}: LogoProps) {
  if (variant === "stacked") {
    return (
      <img
        src={asset("/logo-full.png")}
        alt={site.name}
        width={483}
        height={420}
        decoding="async"
        className={cn("w-auto object-contain", invert && "brightness-0 invert", className)}
      />
    );
  }

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {/* ב-RTL האלמנט הראשון מופיע מימין - כלומר הנורה יושבת מימין לטקסט */}
      <LogoMark className={withTagline ? "h-9 sm:h-10" : "h-8 sm:h-9"} alt="" />

      {/* השם ומתחתיו הסלוגן, ממורכז - בדיוק כמו בלוגו המקורי */}
      <span className="flex flex-col items-center gap-1">
        <img
          src={asset("/logo-name.png")}
          alt={site.name}
          width={579}
          height={65}
          decoding="async"
          className={cn("h-[22px] w-auto object-contain sm:h-6", invert && "brightness-0 invert")}
        />
        {withTagline && (
          <img
            src={asset("/logo-tagline.png")}
            alt={site.tagline}
            width={365}
            height={56}
            loading="lazy"
            decoding="async"
            className={cn("h-[18px] w-auto object-contain sm:h-5", invert && "brightness-0 invert")}
          />
        )}
      </span>
    </span>
  );
}
