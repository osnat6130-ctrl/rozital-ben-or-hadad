import Seo from "@/components/Seo";
import HomeHero from "@/components/HomeHero";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import AboutPreview from "@/components/AboutPreview";
import Reasons from "@/components/Reasons";
import CTASection from "@/components/CTASection";
import { services } from "@/data/services";
import { home } from "@/data/site";
import { cms } from "@/cms/paths";
import { useCmsVersion } from "@/cms/store";

/* ‼️ אין כאן JSON-LD.
   הנתונים המובנים נכתבים לתוך ה-HTML בבנייה (scripts/prerender.mjs),
   ולכן הם מגיעים לכל סורק - גם למי שלא מריץ JavaScript. הגרסה שנוספה
   כאן בזמן ריצה יצרה בלוק שני על אותו עמוד, שמתאר את אותו דבר בפחות
   פירוט. בלוק אחד, במקום אחד. */

export default function Home() {
  /* מאזין לשינויי מצב העריכה, אחרת עריכה ושחזור לא מתעדכנים בדף */
  useCmsVersion();

  return (
    <>
      <Seo
        title={home.seo.title}
        description={home.seo.description}
        path="/"
      />

      <HomeHero />

      {/* --- התחומים --- */}
      <section id="services" className="section scroll-mt-24" aria-labelledby="services-title">
        <div className="container">
          <SectionTitle
            title={
              <span id="services-title" {...cms("site.home.servicesTitle")}>
                {home.servicesTitle}
              </span>
            }
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-7 xl:grid-cols-4">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        </div>
      </section>

      <AboutPreview />
      <Reasons />

      <CTASection
        title={home.cta.title}
        text={home.cta.text}
        button={home.cta.button}
        cmsPath="site.home.cta"
        className="bg-brand-soft"
      />
    </>
  );
}
