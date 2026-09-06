import Reveal from "./Reveal";
import { ArrowIcon, WhatsappIcon } from "./Icons";
import { services } from "@/data/services";
import { site, whatsappLink } from "@/data/site";
import { asset } from "@/lib/utils";

/* ============================================================================
   Hero של דף הבית - "אור בין הידיים"
   ----------------------------------------------------------------------------
   רקע טורקיז בהיר בגוון הלוגו, ומסגרת פורטרט אורגנית שמצטטת
   את קשת הנורה שבלוגו. הפלטה מוגדרת בנפרד כמשתני --hero-* ב-src/index.css.
   ========================================================================== */

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-hero text-hero-ink">
      {/* שכבת הרקע: מדרון טורקיז + זוהר עדין מאחורי הפורטרט */}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-bl from-hero-2 to-hero"
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 55% at 78% 30%, hsl(var(--brand-light) / 0.14), transparent 68%)",
        }}
      />

      <div className="container relative grid items-center gap-12 pb-20 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28 lg:pt-36">
        {/* ---------------- טקסט ---------------- */}
        <div className="order-1 text-center lg:text-right">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2.5 font-display text-sm font-bold text-brand">
              <span aria-hidden className="h-px w-6 bg-brand" />
              {site.tagline}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="font-serif text-[2.4rem] font-bold leading-[1.2] text-hero-ink sm:text-5xl lg:text-[3.4rem]">
              הרצאות, סדנאות ופעילויות <span className="text-gold-dark">שמדליקות אור</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-[46ch] text-lg leading-[1.85] text-hero-muted lg:mx-0">
              {site.heroSubtitle}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#services"
                className="btn-gold w-full sm:w-auto"
              >
                מה מתאים לנו?
                <ArrowIcon className="h-5 w-5" />
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full sm:w-auto"
              >
                <WhatsappIcon className="h-5 w-5" />
                שלחו וואטסאפ 🙂
              </a>
            </div>
          </Reveal>

          {/* שלושת התחומים, כל אחד עם נקודת הצבע שלו */}
          <Reveal delay={320}>
            <ul className="mt-11 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-hero-ink/12 pt-6 lg:justify-start">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center gap-2.5 text-sm font-semibold text-hero-muted"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: `hsl(${service.theme.accent})` }}
                  />
                  {service.navLabel}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ---------------- ויזואל ---------------- */}
        <Reveal variant="pop" delay={200} className="order-2 relative">
          <div className="relative mx-auto aspect-square w-full max-w-[400px] lg:ms-auto lg:me-0 lg:max-w-[460px]">
            <span
              aria-hidden
              className="absolute -inset-[6%] blur-md"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--gold) / 0.16), transparent 70%)",
              }}
            />
            <div className="relative h-full w-full animate-morph overflow-hidden border border-gold/35 shadow-[0_30px_70px_-20px_hsl(193_60%_20%/0.35)]">
              <img
                src={asset(site.heroImage)}
                alt={`${site.name} - ${site.tagline}`}
                width={1000}
                height={1000}
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.endsWith(site.heroFallbackImage))
                    img.src = asset(site.heroFallbackImage);
                }}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
