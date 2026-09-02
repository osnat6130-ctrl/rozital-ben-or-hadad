import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import ServiceTheme from "@/components/ServiceTheme";
import SectionTitle from "@/components/SectionTitle";
import ImageGallery from "@/components/ImageGallery";
import HeroMedia from "@/components/HeroMedia";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import { CheckIcon, PhoneIcon, WhatsappIcon } from "@/components/Icons";
import { getService, type Service, type ServiceSection } from "@/data/services";
import { site, telLink, whatsappLink } from "@/data/site";
import { asset } from "@/lib/utils";

type Props = { id: Service["id"] };

/** רשימת נקודות עם וי בצבע התחום */
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
            <CheckIcon className="h-4 w-4" />
          </span>
          <span className="leading-relaxed text-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionBody({ section }: { section: ServiceSection }) {
  return (
    <>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-lg leading-relaxed text-muted">
          {paragraph}
        </p>
      ))}
      {section.bullets && <Bullets items={section.bullets} />}
    </>
  );
}

export default function ServicePage({ id }: Props) {
  const service = getService(id);
  const reveal = service.motion === "calm" ? "calm" : "pop";

  const [first, ...rest] = service.sections;
  const middle = rest.slice(0, -1);
  const last = rest[rest.length - 1];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seo.description,
    serviceType: service.cardTitle,
    provider: {
      "@type": "Person",
      name: site.name,
      telephone: site.phone.dial,
      url: site.url,
    },
    areaServed: "IL",
  };

  return (
    <ServiceTheme theme={service.theme}>
      <Seo
        title={service.seo.title}
        description={service.seo.description}
        path={service.path}
        image={service.heroImage}
        jsonLd={jsonLd}
      />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-accent-wash pb-14 pt-10 md:pb-20 md:pt-14">
        <span
          aria-hidden
          className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/12 blur-3xl"
        />

        <div className="container relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-right">
            <Reveal>
              {/* כותרת עליונה קטנה מעל כותרת ה-Hero. אופציונלי - מוצגת
                  רק בתחומים שהוגדר להם (כרגע רק ביוגה צחוק). */}
              {service.heroEyebrow && (
                <span className="mb-3 inline-flex items-center gap-2.5 font-display text-sm font-bold text-accent">
                  <span aria-hidden className="h-px w-6 bg-accent" />
                  {service.heroEyebrow}
                </span>
              )}

              {/* כשיש משפט מפתח מתחת (כרגע רק בצרכים מיוחדים), שם השירות
                  משמש ככותרת מקדימה קטנה - כדי לא להכביד עם שתי כותרות
                  גדולות ברצף. בתחומים בלי משפט מפתח (יוגה צחוק, בת מצווה)
                  הוא בגודל של כותרת ה-Hero הכהה בדף הבית. */}
              <h1
                className={
                  service.heroTagline
                    ? "text-sm font-bold leading-snug text-accent-dark sm:text-base"
                    : "text-[2.4rem] font-bold leading-[1.2] text-accent-dark sm:text-5xl lg:text-[3.4rem]"
                }
              >
                {service.heroTitle}
              </h1>

              {/* משפט המפתח של התחום. מעוצב ככותרת אך אינו h1 נוסף,
                  כדי לא לשבור את היררכיית הכותרות של העמוד. */}
              {service.heroTagline && (
                <p className="mt-3 font-display text-4xl font-extrabold leading-[1.15] text-accent sm:text-5xl">
                  {service.heroTagline}
                </p>
              )}
            </Reveal>

            <Reveal delay={100}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted lg:mx-0 lg:text-xl">
                {service.heroSubtitle}
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href={whatsappLink(`היי רוזיטל, הגעתי דרך האתר ואשמח לשמוע פרטים על ${service.cardTitle} :)`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full sm:w-auto"
                >
                  <WhatsappIcon className="h-5 w-5" />
                  שלחו וואטסאפ
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal variant={reveal} delay={140}>
            <HeroMedia
              image={service.heroImage}
              video={service.heroVideo}
              alt={service.title}
              className="w-full rounded-[2rem] shadow-lift"
            />
          </Reveal>
        </div>
      </section>

      {/* ================= "למי זה מתאים" =================
          קומפוזיציה שונה בכוונה מזו של ה-Hero: באנר רוחב, כותרת ממורכזת,
          וקהלי היעד ככרטיסים - במקום עוד פיצול טקסט/תמונה. */}
      <section className="section bg-accent-soft/40" aria-labelledby="service-intro">
        <div className="container">
          <Reveal variant={reveal}>
            <div className="relative overflow-hidden rounded-[2rem] shadow-card">
              <img
                src={asset(service.bannerImage)}
                alt={service.title}
                loading="lazy"
                decoding="async"
                width={1400}
                height={613}
                className="aspect-[16/7] w-full object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-accent-dark/35 via-transparent to-transparent"
              />
            </div>
          </Reveal>

          <Reveal variant={reveal} delay={100} className="mx-auto mt-12 max-w-2xl text-center">
            <h2 id="service-intro" className="text-3xl text-accent-dark sm:text-4xl">
              {first.title}
            </h2>
            {first.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-lg leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </Reveal>

          {first.bullets && (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {first.bullets.map((item, i) => (
                <Reveal as="li" key={item} variant={reveal} delay={i * 90}>
                  <div className="flex h-full flex-col items-center rounded-2xl bg-surface p-6 text-center shadow-soft ring-1 ring-line/60 transition-transform duration-500 md:hover:-translate-y-1.5">
                    <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-dark">
                      <CheckIcon className="h-6 w-6" />
                    </span>
                    <p className="font-display font-bold leading-snug text-ink">{item}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ================= סעיפי אמצע ================= */}
      {middle.length > 0 && (
        <section className="section">
          <div className="container grid gap-6 md:grid-cols-2 md:gap-7">
            {middle.map((section, i) => (
              <Reveal key={section.title} variant={reveal} delay={i * 120}>
                <article className="card h-full p-8 md:p-9">
                  <h2 className="text-2xl text-accent-dark">{section.title}</h2>
                  <SectionBody section={section} />
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ================= סעיף מודגש ================= */}
      {last && (
        <section className="section" aria-labelledby="service-highlight">
          <div className="container">
            <Reveal variant={reveal}>
              <div className="relative overflow-hidden rounded-[2rem] bg-accent px-7 py-12 text-center text-white md:px-16 md:py-16">
                <span
                  aria-hidden
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-12 -left-6 h-48 w-48 rounded-full bg-gold/20"
                />
                <h2 id="service-highlight" className="relative text-3xl text-white sm:text-4xl">
                  {last.title}
                </h2>
                {last.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="relative mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/90"
                  >
                    {paragraph}
                  </p>
                ))}
                {last.bullets && (
                  <ul className="relative mx-auto mt-6 grid max-w-2xl gap-3 text-right sm:grid-cols-2">
                    {last.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-gold" />
                        <span className="text-white/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ================= גלריה ================= */}
      <section className="section pt-0" aria-labelledby="gallery-title">
        <div className="container">
          <SectionTitle
            title={<span id="gallery-title">איך זה נראה במפגש</span>}
          />
          <ImageGallery
            images={service.gallery}
            motion={service.motion}
            className="mt-10"
          />
        </div>
      </section>

      {/* ================= המלצות =================
          מוצג רק בתחומים שיש להם המלצות אמיתיות */}
      {service.testimonials && service.testimonials.length > 0 && (
        <section className="section pt-0" aria-labelledby="testimonials-title">
          <div className="container">
            <SectionTitle
              title={
                <span id="testimonials-title">
                  {service.testimonialsTitle ?? "מה אומרים אחרי המפגש"}
                </span>
              }
            />
            <Testimonials
              items={service.testimonials}
              motion={service.motion}
              image={service.testimonialsImage}
            />
          </div>
        </section>
      )}

      {/* ================= יצירת קשר ================= */}
      <section id="contact" className="section scroll-mt-24 bg-accent-soft/45" aria-labelledby="form-title">
        <div className="container">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 id="form-title" className="text-3xl text-accent-dark sm:text-4xl">
              {service.cta.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">{service.cta.text}</p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href={whatsappLink(`היי רוזיטל, אשמח לפרטים על ${service.cardTitle} :)`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full sm:w-auto"
              >
                <WhatsappIcon className="h-5 w-5" />
                שלחו וואטסאפ
              </a>
              <a href={telLink} className="btn-outline w-full sm:w-auto">
                <PhoneIcon className="h-5 w-5" />
                <span dir="ltr">{site.phone.display}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {!service.hideBottomCta && (
        <CTASection
          title="רוצה לשמוע עוד על הפעילות?"
          text="אני כאן לכל שאלה - בלי התחייבות ובלי לחץ."
          whatsappMessage={`היי רוזיטל, אשמח לשמוע עוד על ${service.cardTitle} :)`}
        />
      )}
    </ServiceTheme>
  );
}
