import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { PhoneIcon, WhatsappIcon } from "@/components/Icons";
import { privacy as p, site, telLink, whatsappLink } from "@/data/site";
import { cms } from "@/cms/paths";
import { useCmsVersion } from "@/cms/store";

/**
 * מדיניות פרטיות.
 *
 * ‼️ מה שכתוב כאן הוא מה שהאתר באמת עושה, ולא נוסח כללי מהאינטרנט:
 * טופס יצירת הקשר **לא שולח שום דבר לשרת** - הוא פותח וואטסאפ עם
 * הטקסט מוכן (src/components/WhatsappForm.tsx, window.open). אין
 * עוגיות פרסום, וה-CSP ב-public/_headers חוסם סקריפט של גורם שלישי.
 * העוגייה היחידה היא עוגיית ההתחברות לפאנל.
 *
 * הטקסט עצמו יושב ב-src/content/site.json כדי שיהיה עריך מהפאנל.
 */
export default function Privacy() {
  /* מאזין לשינויי מצב העריכה, אחרת עריכה ושחזור לא מתעדכנים בדף */
  useCmsVersion();

  return (
    <>
      <Seo title={p.seo.title} description={p.seo.description} path="/privacy" />

      <section className="relative overflow-hidden bg-accent-wash pb-14 pt-10 md:pb-16 md:pt-14">
        <span aria-hidden className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-brand/15 blur-3xl" />
        <div className="container relative text-center">
          <Reveal>
            <h1 {...cms("site.privacy.title")} className="text-4xl sm:text-5xl">
              {p.title}
            </h1>
            <p
              {...cms("site.privacy.intro")}
              className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted"
            >
              {p.intro}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section pt-12">
        <div className="container">
          <div className="mx-auto max-w-2xl space-y-10">
            {p.sections.map((section, i) => (
              <Reveal key={i} delay={i * 80}>
                <h2
                  {...cms(`site.privacy.sections.${i}.title`)}
                  className="text-2xl text-brand-dark"
                >
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph, j) => (
                  <p
                    key={j}
                    {...cms(`site.privacy.sections.${i}.paragraphs.${j}`)}
                    className="mt-4 text-lg leading-relaxed text-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </Reveal>
            ))}

            <Reveal delay={p.sections.length * 80}>
              <h2 {...cms("site.privacy.contactTitle")} className="text-2xl text-brand-dark">
                {p.contactTitle}
              </h2>
              <p {...cms("site.privacy.contact")} className="mt-4 text-lg leading-relaxed text-muted">
                {p.contact}
              </p>
              <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
                <a
                  href={whatsappLink("היי רוזיטל, יש לי שאלה בנושא פרטיות באתר :)")}
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

            <Reveal delay={p.sections.length * 80 + 60}>
              <p
                {...cms("site.privacy.updated")}
                className="border-t border-line pt-6 text-sm text-muted/80"
              >
                {p.updated}
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
