import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { MailIcon, PhoneIcon, WhatsappIcon } from "./Icons";
import { telLink, whatsappLink } from "@/data/site";

type Props = {
  title: string;
  text?: string;
  /** יעד הכפתור "השאירי פרטים" - עוגן בעמוד או קישור לעמוד צור קשר */
  formTarget?: string;
  /** הודעת וואטסאפ מותאמת לתחום */
  whatsappMessage?: string;
  /** דריסה אופציונלית של צבע הרקע (ברירת מחדל bg-accent-soft) */
  className?: string;
  /** דריסה אופציונלית לטקסט כפתור "התקשרי עכשיו" */
  callLabel?: string;
  /** דריסה אופציונלית לטקסט כפתור "השאירי פרטים" */
  formLabel?: string;
};

export default function CTASection({
  title,
  text,
  formTarget = "#contact",
  whatsappMessage,
  className = "bg-accent-soft",
  callLabel = "התקשרי עכשיו",
  formLabel = "השאירי פרטים",
}: Props) {
  const isAnchor = formTarget.startsWith("#");

  return (
    <section className={`section relative overflow-hidden ${className}`} aria-labelledby="cta-title">
      {/* עיטורים רכים ברקע */}
      <span
        aria-hidden
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/25 blur-2xl"
      />
      <span
        aria-hidden
        className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
      />

      <div className="container relative text-center">
        <Reveal>
          <h2 id="cta-title" className="text-3xl text-accent-dark sm:text-4xl">
            {title}
          </h2>
          {text && (
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted">{text}</p>
          )}
        </Reveal>

        <Reveal delay={120} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={whatsappLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full sm:w-auto"
          >
            <WhatsappIcon className="h-5 w-5" />
            שלחו וואטסאפ
          </a>

          <a href={telLink} className="btn-primary w-full sm:w-auto">
            <PhoneIcon className="h-5 w-5" />
            {callLabel}
          </a>

          {isAnchor ? (
            <a href={formTarget} className="btn-outline w-full sm:w-auto">
              <MailIcon className="h-5 w-5" />
              {formLabel}
            </a>
          ) : (
            <Link to={formTarget} className="btn-outline w-full sm:w-auto">
              <MailIcon className="h-5 w-5" />
              {formLabel}
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
