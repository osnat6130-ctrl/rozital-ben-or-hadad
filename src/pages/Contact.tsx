import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import WhatsappForm from "@/components/WhatsappForm";
import { LogoMark } from "@/components/Logo";
import { MailIcon, PhoneIcon } from "@/components/Icons";
import { site, telLink } from "@/data/site";

export default function Contact() {
  return (
    <>
      <Seo
        title={`צרו קשר עם רוזיטל בן אור חדד | ${site.tagline}`}
        description="רוצים לשמוע פרטים על הרצאה, סדנת יוגה צחוק או פעילות בת מצווה? אפשר להשאיר פרטים, לשלוח הודעה בוואטסאפ או פשוט להתקשר."
        path="/contact"
      />

      <section className="relative overflow-hidden bg-accent-wash pb-14 pt-10 md:pb-16 md:pt-14">
        <span
          aria-hidden
          className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-gold/25 blur-3xl"
        />
        <div className="container relative text-center">
          <Reveal>
            <h1 className="text-4xl sm:text-5xl">בואו נדבר</h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
              יש שאלה? רוצים לשמוע פרטים או לבדוק תאריך? אשמח לשמוע מכם - ואחזור אליכם בהקדם.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section pt-12">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            {/* --- טופס פנייה - נפתח בוואטסאפ עם ההודעה מוכנה --- */}
            <Reveal>
              <WhatsappForm />
            </Reveal>

            {/* --- דרכי יצירת קשר ישירות --- */}
            <div className="space-y-4">
              <Reveal delay={80}>
                <a
                  href={telLink}
                  className="group flex items-center gap-4 rounded-3xl bg-surface p-6 shadow-card ring-1 ring-line/70 transition-all duration-300 md:hover:-translate-y-1"
                >
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <PhoneIcon className="h-7 w-7" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold text-brand-dark">
                      טלפון
                    </span>
                    <span className="text-muted" dir="ltr">
                      {site.phone.display}
                    </span>
                  </span>
                </a>
              </Reveal>

              {site.email && (
                <Reveal delay={200}>
                  <a
                    href={`mailto:${site.email}`}
                    className="group flex items-center gap-4 rounded-3xl bg-surface p-6 shadow-card ring-1 ring-line/70 transition-all duration-300 md:hover:-translate-y-1"
                  >
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/25 text-brand-dark">
                      <MailIcon className="h-7 w-7" />
                    </span>
                    <span>
                      <span className="block font-display text-lg font-bold text-brand-dark">
                        אימייל
                      </span>
                      <span className="text-muted">{site.email}</span>
                    </span>
                  </a>
                </Reveal>
              )}

              <Reveal delay={240}>
                <div className="flex flex-col items-center rounded-3xl bg-brand-soft/60 p-8 text-center">
                  <LogoMark className="h-20" />
                  <p className="mt-4 font-display text-lg font-bold text-brand-dark">
                    {site.tagline}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
