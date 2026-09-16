import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { PhoneIcon, WhatsappIcon } from "@/components/Icons";
import { accessibility as a, site, telLink, whatsappLink } from "@/data/site";
import { cms } from "@/cms/paths";
import { useCmsVersion } from "@/cms/store";

/**
 * הצהרת נגישות.
 *
 * ‼️ כל הטקסט מגיע מ-src/content/site.json ולא כתוב כאן.
 * קודם הוא היה מקודד בקומפוננטה, ולכן: רוזיטל לא יכלה לתקן בו מילה
 * מהפאנל, והוא גם לא הופיע ב-HTML שהסורקים מקבלים (scripts/prerender.mjs
 * בונה את הטקסט מקובץ התוכן). מסמך שמתיישן - תאריך, רכזת נגישות,
 * רשימת התאמות - חייב להיות עריך בלי מתכנתת.
 */
export default function Accessibility() {
  /* מאזין לשינויי מצב העריכה, אחרת עריכה ושחזור לא מתעדכנים בדף */
  useCmsVersion();

  return (
    <>
      <Seo title={a.seo.title} description={a.seo.description} path="/accessibility" />

      <section className="relative overflow-hidden bg-accent-wash pb-14 pt-10 md:pb-16 md:pt-14">
        <span aria-hidden className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
        <div className="container relative text-center">
          <Reveal>
            <h1 {...cms("site.accessibility.title")} className="text-4xl sm:text-5xl">
              {a.title}
            </h1>
            <p
              {...cms("site.accessibility.intro")}
              className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted"
            >
              {a.intro}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section pt-12">
        <div className="container">
          <div className="mx-auto max-w-2xl space-y-10">
            <Reveal>
              <h2 {...cms("site.accessibility.commitmentTitle")} className="text-2xl text-brand-dark">
                {a.commitmentTitle}
              </h2>
              <p
                {...cms("site.accessibility.commitment")}
                className="mt-4 text-lg leading-relaxed text-muted"
              >
                {a.commitment}
              </p>
            </Reveal>

            <Reveal delay={100}>
              <h2 {...cms("site.accessibility.featuresTitle")} className="text-2xl text-brand-dark">
                {a.featuresTitle}
              </h2>
              <p
                {...cms("site.accessibility.featuresIntro")}
                className="mt-4 text-lg leading-relaxed text-muted"
              >
                {a.featuresIntro}
              </p>
              <ul className="mt-4 space-y-2.5 text-lg leading-relaxed text-muted">
                {a.features.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span {...cms(`site.accessibility.features.${i}`)}>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={160}>
              <h2 {...cms("site.accessibility.limitsTitle")} className="text-2xl text-brand-dark">
                {a.limitsTitle}
              </h2>
              <p {...cms("site.accessibility.limits")} className="mt-4 text-lg leading-relaxed text-muted">
                {a.limits}
              </p>
            </Reveal>

            {/* רכזת נגישות - פרט שהצהרה חייבת לכלול, וחסר כאן עד עכשיו */}
            <Reveal delay={220}>
              <h2 {...cms("site.accessibility.coordinatorTitle")} className="text-2xl text-brand-dark">
                {a.coordinatorTitle}
              </h2>
              <p
                {...cms("site.accessibility.coordinator")}
                className="mt-4 text-lg leading-relaxed text-muted"
              >
                {a.coordinator}
              </p>
            </Reveal>

            <Reveal delay={280}>
              <h2 {...cms("site.accessibility.contactTitle")} className="text-2xl text-brand-dark">
                {a.contactTitle}
              </h2>
              <p {...cms("site.accessibility.contact")} className="mt-4 text-lg leading-relaxed text-muted">
                {a.contact}
              </p>
              <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
                <a
                  href={whatsappLink("היי רוזיטל, נתקלתי בבעיית נגישות באתר ואשמח לספר על כך :)")}
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

            <Reveal delay={340}>
              <p
                {...cms("site.accessibility.updated")}
                className="border-t border-line pt-6 text-sm text-muted/80"
              >
                {a.updated}
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
