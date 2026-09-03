import { Link } from "react-router-dom";
import Logo from "./Logo";
import { PhoneIcon, WhatsappIcon, MailIcon } from "./Icons";
import { navItems, site, telLink, whatsappLink } from "@/data/site";
import { services } from "@/data/services";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-brand-dark text-white/80">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:gap-12 md:py-16">
        {/* מותג */}
        <div>
          <Logo variant="horizontal" withTagline invert />
          <p className="mt-5 max-w-sm text-[0.98rem] leading-relaxed text-white/70">
            הרצאות להורים / אחים / צוותי חינוך / בתי ספר, סדנאות יוגה צחוק ופעילות בת מצווה -
            בהנחיה אישית, מקצועית ומלאת שמחה.
          </p>
        </div>

        {/* ניווט */}
        <nav aria-label="ניווט בתחתית האתר">
          <h2 className="mb-4 font-display text-lg font-bold text-white">מפת האתר</h2>
          <ul className="space-y-2.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-block py-1.5 text-white/75 transition-colors duration-200 hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* יצירת קשר */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-white">דברו איתי</h2>
          <ul className="space-y-3">
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

          <ul className="mt-6 space-y-2 text-sm text-white/55">
            {services.map((s) => (
              <li key={s.id}>
                <Link to={s.path} className="inline-block py-1 transition-colors hover:text-gold">
                  {s.cardTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-center text-sm text-white/55 sm:flex-row sm:text-right">
          <p>
            © {year} {site.name}. כל הזכויות שמורות.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="/accessibility" className="transition-colors hover:text-gold">
              הצהרת נגישות
            </Link>
            <p className="inline-flex items-center gap-2 text-white/45">
              {site.credit.url ? (
                <a
                  href={site.credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold"
                >
                  {site.credit.text}
                </a>
              ) : (
                site.credit.text
              )}
              <a
                href="https://wa.me/972556825885"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="שליחת הודעה בוואטסאפ לאוסנת בניסטי"
                className="text-whatsapp transition-colors hover:text-gold"
              >
                <WhatsappIcon className="h-4 w-4" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
