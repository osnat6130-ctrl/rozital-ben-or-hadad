import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import Certificates from "@/components/Certificates";
import CTASection from "@/components/CTASection";
import ServiceTheme from "@/components/ServiceTheme";
import { ArrowIcon } from "@/components/Icons";
import { aboutPage, about, site } from "@/data/site";
import { asset } from "@/lib/utils";
import { cms, cmsImage } from "@/cms/paths";
import { services } from "@/data/services";
import { useCmsVersion } from "@/cms/store";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "מרצה ומנחת סדנאות",
  telephone: site.phone.dial,
  url: `${site.url}/about`,
};

export default function About() {
  /* מאזין לשינויי מצב העריכה, אחרת עריכה ושחזור לא מתעדכנים בדף */
  useCmsVersion();

  return (
    <>
      <Seo
        title={aboutPage.seo.title}
        description={aboutPage.seo.description}
        path="/about"
        jsonLd={jsonLd}
      />

      {/* ================= HERO + הדרך שלי =================
          הסיפור האישי יושב ישירות מתחת לכותרת, באותה עמודת טקסט -
          לא כאזור נפרד בהמשך הדף. */}
      <section className="relative overflow-hidden bg-accent-wash pb-14 pt-10 md:pb-20 md:pt-14">
        <div className="container grid items-center gap-10 md:grid-cols-[1fr_0.85fr] md:items-start md:gap-14">
          <div className="text-center md:text-right">
            <Reveal>
              <h1 {...cms("site.aboutPage.title")} className="text-4xl leading-[1.15] sm:text-5xl">
                {aboutPage.title}
              </h1>
            </Reveal>
            <div className="mt-8 md:mt-10">
              {about.story.map((paragraph, i) => (
                <Reveal key={i} delay={i * 100}>
                  <p
                    {...cms(`site.about.story.${i}`)}
                    className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted md:mx-0"
                  >
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* הרקע המקצועי כתגיות מתחת לסיפור, במקום כרטיס נפרד בהמשך הדף */}
            {about.credentials.length > 0 && (
              <Reveal delay={about.story.length * 100}>
                <ul className="mt-8 flex flex-wrap justify-center gap-2.5 md:justify-start">
                  {about.credentials.map((item, i) => (
                    <li
                      key={i}
                      className="inline-flex items-center rounded-full bg-gold/25 px-4 py-2 shadow-soft ring-1 ring-gold/50"
                    >
                      <span {...cms(`site.about.credentials.${i}`)} className="text-sm font-bold text-brand-dark">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          <Reveal variant="pop" delay={140} className="md:sticky md:top-28">
            <div className="relative mx-auto max-w-sm md:max-w-none">
              <span
                aria-hidden
                className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-gold/40 blur-lg"
              />
              <img
                {...cmsImage("site.about.pageImage", "site.about.imageAlt")}
                src={asset(about.pageImage)}
                alt={about.imageAlt}
                width={900}
                height={1029}
                decoding="async"
                className="relative aspect-[7/8] w-full rounded-[2rem] object-cover shadow-lift"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= תעודות והסמכות ================= */}
      <section className="section" aria-labelledby="certificates-title">
        <div className="container">
          <SectionTitle
            title={
              <span id="certificates-title" {...cms("site.aboutPage.certificatesTitle")}>
                {aboutPage.certificatesTitle}
              </span>
            }
          />
          <Certificates />
        </div>
      </section>

      {/* ================= מה מנחה אותי בעשייה ================= */}
      <section className="section pt-0" aria-labelledby="principles-title">
        <div className="container">
          <SectionTitle
            title={
              <span id="principles-title" {...cms("site.aboutPage.principlesTitle")}>
                {aboutPage.principlesTitle}
              </span>
            }
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {about.principles.map((principle, i) => (
              <Reveal key={i} delay={i * 110}>
                <div className="card h-full p-8 text-center">
                  <h3 {...cms(`site.about.principles.${i}.title`)} className="text-xl">
                    {principle.title}
                  </h3>
                  <p {...cms(`site.about.principles.${i}.text`)} className="mt-3 leading-relaxed text-muted">
                    {principle.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= התחומים ================= */}
      <section className="section bg-brand-soft" aria-labelledby="about-services-title">
        <div className="container">
          <SectionTitle
            title={
              <span id="about-services-title" {...cms("site.aboutPage.servicesTitle")}>
                {aboutPage.servicesTitle}
              </span>
            }
            subtitle={<span {...cms("site.aboutPage.servicesSubtitle")}>{aboutPage.servicesSubtitle}</span>}
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={i * 110}>
                <ServiceTheme theme={service.theme} className="h-full">
                  <Link
                    to={service.path}
                    className="group flex h-full flex-col rounded-3xl bg-surface p-7 shadow-card ring-1 ring-line/70 transition-all duration-500 md:hover:-translate-y-1.5"
                  >
                    <span className="mb-4 h-1.5 w-12 rounded-full bg-accent" aria-hidden />
                    <h3 {...cms(`services.${i}.cardTitle`)} className="text-xl text-accent-dark">
                      {service.cardTitle}
                    </h3>
                    <p {...cms(`services.${i}.cardText`)} className="mt-3 flex-1 leading-relaxed text-muted">
                      {service.cardText}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 font-display font-bold text-accent">
                      <span {...cms("site.aboutPage.serviceCardCta")}>{aboutPage.serviceCardCta}</span>
                      <ArrowIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1.5" />
                    </span>
                  </Link>
                </ServiceTheme>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title={aboutPage.cta.title}
        text={aboutPage.cta.text}
        button={aboutPage.cta.button}
        cmsPath="site.aboutPage.cta"
      />
    </>
  );
}
