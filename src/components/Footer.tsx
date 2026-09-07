import { Link } from "react-router-dom";
import Logo from "./Logo";
import { PhoneIcon, WhatsappIcon, MailIcon } from "./Icons";
import { navItems, site, telLink, whatsappLink } from "@/data/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-brand-dark text-white/80">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr] md:gap-10 md:py-12">
        {/* מותג */}
        <div>
          <Logo variant="horizontal" withTagline invert />
          <p className="mt-4 max-w-sm text-[0.94rem] leading-snug text-white/70">
            הרצאות להורים / אחים / צוותי חינוך / בתי ספר, סדנאות יוגה צחוק ופעילות בת מצווה -
            בהנחיה אישית, מקצועית ומלאת שמחה.
          </p>
        </div>

        {/* ניווט */}
        <nav aria-label="ניווט בתחתית האתר">
          <h2 className="mb-2 font-display text-base font-bold text-white">מפת האתר</h2>
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-block py-1 text-white/75 transition-colors duration-200 hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* יצירת קשר */}
        <div>
          <h2 className="mb-2 font-display text-base font-bold text-white">דברו איתי</h2>
          <ul className="space-y-2">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-white/80 transition-colors hover:text-gold"
              >
                <WhatsappIcon className="h-5 w-5 text-whatsapp" />
                וואטסאפ
              </a>
            </li>
            <li>
              <a
                href={telLink}
                className="inline-flex items-center gap-2.5 text-white/80 transition-colors hover:text-gold"
              >
                <PhoneIcon className="h-5 w-5" />
                <span dir="ltr">{site.phone.display}</span>
              </a>
            </li>
            {site.email && (
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2.5 text-white/80 transition-colors hover:text-gold"
                >
                  <MailIcon className="h-5 w-5" />
                  {site.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-center text-sm text-white/55 sm:flex-row sm:text-right">
          {/* בס"ד ראשון בסדר ה-DOM, ולכן בעברית הוא נמצא בקצה הימני */}
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
            <span>בס"ד</span>
            <p>
              © {year} {site.name}. כל הזכויות שמורות.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="/accessibility" className="transition-colors hover:text-gold">
              הצהרת נגישות
            </Link>
            <a
              href="https://wa.me/972556825885"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="שליחת הודעה בוואטסאפ לאוסנת בניסטי"
              className="inline-flex items-center gap-2 border-b border-white/25 pb-0.5 text-white transition-colors hover:text-gold"
            >
              {site.credit.text}
              <WhatsappIcon className="h-4 w-4 text-whatsapp" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
