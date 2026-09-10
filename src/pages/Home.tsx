import Seo from "@/components/Seo";
import HomeHero from "@/components/HomeHero";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import AboutPreview from "@/components/AboutPreview";
import Reasons from "@/components/Reasons";
import CTASection from "@/components/CTASection";
import { services } from "@/data/services";
import { home, site } from "@/data/site";
import { cms } from "@/cms/paths";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  slogan: site.tagline,
  url: site.url,
  telephone: site.phone.dial,
  areaServed: "IL",
  availableLanguage: "he",
  makesOffer: services.map((service) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: service.cardTitle },
  })),
};

export default function Home() {
  return (
    <>
      <Seo
        title="רוזיטל בן אור חדד | הרצאות להורים, יוגה צחוק ופעילות בת מצווה"
        description="הרצאות להורים לילדים עם צרכים מיוחדים, סדנאות יוגה צחוק ופעילות בת מצווה. חוויה מקצועית, חמה ומלאת שמחה, מותאמת בדיוק לקהל שלכם."
        path="/"
        jsonLd={jsonLd}
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
