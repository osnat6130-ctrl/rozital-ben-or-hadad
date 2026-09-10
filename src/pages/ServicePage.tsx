import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import ServiceTheme from "@/components/ServiceTheme";
import SectionTitle from "@/components/SectionTitle";
import ImageGallery from "@/components/ImageGallery";
import HeroMedia from "@/components/HeroMedia";
import AddVideoTile from "@/cms/AddVideoTile";
import Testimonials from "@/components/Testimonials";
import { CheckIcon, PhoneIcon, WhatsappIcon } from "@/components/Icons";
import { getService, type Service, type ServiceSection } from "@/data/services";
import { cms, cmsImage, serviceIndex } from "@/cms/paths";
import { site, telLink, whatsappLink } from "@/data/site";
import { asset } from "@/lib/utils";
import { useCmsVersion } from "@/cms/store";
import { useEditing } from "@/cms/editing";

type Props = { id: Service["id"] };

/** רשימת נקודות עם וי בצבע התחום */
function Bullets({ items, path }: { items: string[]; path: string }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
            <CheckIcon className="h-4 w-4" />
          </span>
          <span {...cms(`${path}.${i}`)} className="leading-relaxed text-muted">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** מספר הטורים ברשת הסרטונים, לפי מספר הפריטים שיוצגו בה.
 *  ‼️ נגזר ולא קבוע: רשת של 3 טורים עם שני סרטונים משאירה טור ריק
 *  ומצרה את הסרטונים בלי סיבה, ורשת של 2 טורים דוחפת את כרטיס ההוספה
 *  לשורה נפרדת. הגזירה שומרת על שורה מלאה בשני המצבים. */
function videoColumns(count: number): string {
  if (count <= 1) return "mx-auto max-w-sm grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

function SectionBody({ section, path }: { section: ServiceSection; path: string }) {
  return (
    <>
      {section.paragraphs?.map((paragraph, i) => (
        <p
          key={i}
          {...cms(`${path}.paragraphs.${i}`)}
          className="mt-0 text-lg leading-snug text-muted first-of-type:mt-3"
        >
          {paragraph}
        </p>
      ))}
      {section.bullets && <Bullets items={section.bullets} path={`${path}.bullets`} />}
    </>
  );
}

export default function ServicePage({ id }: Props) {
  /* מאזין לשינויי מצב העריכה, אחרת עריכה ושחזור לא מתעדכנים בדף */
  useCmsVersion();
  const editing = useEditing();

  const service = getService(id);
  /* בסיס הנתיבים לעריכה, למשל services.2.heroTitle */
  const p = `services.${serviceIndex(id)}`;
  const reveal = service.motion === "calm" ? "calm" : "pop";

  const [first, ...rest] = service.sections;
  const middle = rest.slice(0, -1);
  const last = rest[rest.length - 1];


  return (
    <ServiceTheme theme={service.theme}>
      <Seo
        title={service.seo.title}
        description={service.seo.description}
        path={service.path}
        image={service.heroImage}
      />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-accent-wash pb-14 pt-10 md:pb-20 md:pt-14">
        <span
          aria-hidden
          className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/12 blur-3xl"
        />

        {/* תמונת רוחב מקבלת עמודה רחבה יותר מהטקסט. בתמונת פורטרט
            משאירים חצי-חצי, אחרת ה-Hero נעשה גבוה מדי. */}
        <div
          className={`container relative grid items-center gap-10 ${
            service.heroPortrait
              ? "lg:grid-cols-2 lg:gap-16"
              : "lg:grid-cols-[1fr_1.3fr] lg:gap-10"
          }`}
        >
          <div className="text-center lg:text-right">
            <Reveal>
              {/* כותרת עליונה קטנה מעל כותרת ה-Hero. אופציונלי - מוצגת
                  רק בתחומים שהוגדר להם (כרגע רק ביוגה צחוק). */}
              {service.heroEyebrow && (
                <span className="mb-3 inline-flex items-center gap-2.5 font-display text-sm font-bold text-accent">
                  <span aria-hidden className="h-px w-6 bg-accent" />
                  <span {...cms(`${p}.heroEyebrow`)}>{service.heroEyebrow}</span>
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
                <span {...cms(`${p}.heroTitle`)}>{service.heroTitle}</span>
              </h1>

              {/* משפט המפתח של התחום. מעוצב ככותרת אך אינו h1 נוסף,
                  כדי לא לשבור את היררכיית הכותרות של העמוד. */}
              {service.heroTagline && (
                <p
                  {...cms(`${p}.heroTagline`)}
                  className="mt-3 font-display text-4xl font-bold leading-[1.15] text-accent sm:text-5xl"
                >
                  {service.heroTagline}
                </p>
              )}
            </Reveal>

            <Reveal delay={100}>
              {[service.heroSubtitle].flat().map((paragraph, i) => (
                <p
                  key={i}
                  {...cms(
                    Array.isArray(service.heroSubtitle) ? `${p}.heroSubtitle.${i}` : `${p}.heroSubtitle`,
                  )}
                  className={`mx-auto max-w-xl text-lg leading-relaxed text-muted lg:mx-0 lg:text-xl ${i === 0 ? "mt-6" : "mt-4"}`}
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal delay={180}>
              {service.heroCtaNote && (
                <div className="mt-6 flex flex-col items-center lg:w-64 lg:items-center">
                  <p className="font-display font-bold text-ink">{service.heroCtaNote}</p>
                </div>
              )}
              <div
                className={`flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start ${service.heroCtaNote ? "mt-2" : "mt-8"}`}
              >
                <a
                  href={whatsappLink(`היי רוזיטל, הגעתי דרך האתר ואשמח לשמוע פרטים על ${service.cardTitle} :)`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full sm:w-auto"
                >
                  <span {...cms(`${p}.heroCta`)}>{service.heroCta ?? "שלחו וואטסאפ"}</span>
                  <WhatsappIcon className="h-5 w-5" />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal variant={reveal} delay={140}>
            <HeroMedia
              image={service.heroImage}
              video={service.heroVideo}
              portrait={service.heroPortrait}
              alt={service.title}
              className="w-full rounded-[2rem] shadow-lift"
              cmsPath={`${p}.heroImage`}
            />
          </Reveal>
        </div>
      </section>

      {/* ================= באנר שכנוע מתחת ל-Hero =================
          רקע חצוי חד בלי ריפוד משלו: החצי העליון בצבע הרקע של הדף (מה
          שרואים בתחתית ה-Hero), והתחתון בגוון של האזור הבא ("למי זה מתאים").
          כך הבאנר "רוכב" על התפר בין שני האזורים. */}
      {service.heroBanner && (
        <section
          className="bg-[linear-gradient(to_bottom,hsl(var(--background))_0,hsl(var(--background))_50%,hsl(var(--accent-soft)_/_0.4)_50%,hsl(var(--accent-soft)_/_0.4)_100%)]"
          aria-labelledby="service-hero-banner"
        >
          <div className="container">
            <Reveal variant={reveal}>
              <div className="flex flex-col items-center gap-5 rounded-[2rem] bg-accent px-6 py-7 text-center text-white shadow-card md:flex-row md:justify-between md:px-9 md:text-right">
                <div>
                  <h2
                    id="service-hero-banner"
                    {...cms(`${p}.heroBanner.title`)}
                    className="text-2xl text-white"
                  >
                    {service.heroBanner.title}
                  </h2>
                  {service.heroBanner.paragraphs?.map((paragraph, i) => (
                    <p
                      key={i}
                      {...cms(`${p}.heroBanner.paragraphs.${i}`)}
                      className="mt-3 max-w-2xl leading-relaxed text-white/90"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                <a
                  href={whatsappLink(`היי רוזיטל, הגעתי דרך האתר ואשמח לשמוע פרטים על ${service.cardTitle} :)`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full shrink-0 sm:w-auto"
                >
                  <span {...cms(`${p}.heroBanner.button`)}>{service.heroBanner.button}</span>
                  <WhatsappIcon className="h-5 w-5" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      )}
      {/* ================= אזור מודגש מתחת ל-Hero =================
          מוצג רק בתחומים שהוגדר להם spotlight (כרגע: קבוצת העצמה לאחים) */}
      {service.spotlight && (
        <section className="pb-2 pt-8 md:pb-3 md:pt-12" aria-labelledby="service-spotlight">
          <div className="container">
            <Reveal variant={reveal}>
              <div className="relative overflow-hidden rounded-[2rem] bg-surface p-8 shadow-card ring-1 ring-line/60 md:p-12">
                <span
                  aria-hidden
                  className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-soft/60 blur-2xl"
                />
                <div className="relative grid gap-8 md:grid-cols-2 md:gap-12">
                  <div>
                    <h2
                      id="service-spotlight"
                      {...cms(`${p}.spotlight.title`)}
                      className="text-3xl text-accent-dark sm:text-4xl"
                    >
                      {service.spotlight.title}
                    </h2>
                    {service.spotlight.paragraphs?.map((paragraph, i) => (
                      <p
                        key={i}
                        {...cms(`${p}.spotlight.paragraphs.${i}`)}
                        className="mt-4 text-lg leading-relaxed text-muted"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {service.spotlight.bullets && (
                    <div className="md:pt-2">
                      <Bullets items={service.spotlight.bullets} path={`${p}.spotlight.bullets`} />
                    </div>
                  )}
                </div>
                {service.spotlight.images && (
                  <ImageGallery
                    images={service.spotlight.images}
                    motion={service.motion}
                    className="relative mt-10"
                    cmsPath={`${p}.spotlight.images`}
                  />
                )}
                {service.spotlight.testimonials && service.spotlight.testimonials.length > 0 && (
                  <div className="relative mt-12">
                    <h3
                      {...cms(`${p}.spotlight.testimonialsTitle`)}
                      className="text-center text-2xl text-accent-dark sm:text-3xl"
                    >
                      {service.spotlight.testimonialsTitle}
                    </h3>
                    <Testimonials
                      items={service.spotlight.testimonials}
                      motion={service.motion}
                      cmsPath={`${p}.spotlight.testimonials`}
                    />
                  </div>
                )}
                {service.spotlight.banner && (
                  <div className="relative mt-8 flex flex-col items-center gap-5 rounded-2xl bg-accent px-6 py-7 text-center text-white md:flex-row md:justify-between md:px-9 md:text-right">
                    <div>
                      <h3 {...cms(`${p}.spotlight.banner.title`)} className="text-2xl text-white">
                        {service.spotlight.banner.title}
                      </h3>
                      {service.spotlight.banner.paragraphs?.map((paragraph, i) => (
                        <p
                          key={i}
                          {...cms(`${p}.spotlight.banner.paragraphs.${i}`)}
                          className="mt-3 max-w-2xl leading-relaxed text-white/90"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <a
                      href={whatsappLink(`היי רוזיטל, הגעתי דרך האתר ואשמח לשמוע פרטים על ${service.spotlight.title} :)`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp w-full shrink-0 sm:w-auto"
                    >
                      <span {...cms(`${p}.spotlight.banner.button`)}>{service.spotlight.banner.button}</span>
                      <WhatsappIcon className="h-5 w-5" />
                    </a>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ================= "למי זה מתאים" =================
          קומפוזיציה שונה בכוונה מזו של ה-Hero: באנר רוחב, כותרת ממורכזת,
          וקהלי היעד ככרטיסים - במקום עוד פיצול טקסט/תמונה. */}
      <section
        className={`section bg-accent-soft/40 ${service.spotlight ? "pt-8 md:pt-12" : ""}`}
        aria-labelledby="service-intro"
      >
        <div className="container">
          <Reveal variant={reveal}>
            {/* בתחום שהוגדר לו bannerVideo מוצג נגן במקום תמונת הרוחב.
                אין שכבת גרדיאנט מעל וידאו - היא מכהה את התמונה וחוסמת את הכפתורים. */}
            {service.bannerVideo ? (
              <div
                {...cms(`${p}.bannerVideo`, "video")}
                className="mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-[2rem] bg-black shadow-card"
              >
                <video
                  src={asset(service.bannerVideo)}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={service.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
            <div className="relative overflow-hidden rounded-[2rem] shadow-card">
              <img
                {...cmsImage(`${p}.bannerImage`)}
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
            )}
          </Reveal>

          <Reveal variant={reveal} delay={100} className="mx-auto mt-12 max-w-2xl text-center">
            <h2
              id="service-intro"
              {...cms(`${p}.sections.0.title`)}
              className="text-3xl text-accent-dark sm:text-4xl"
            >
              {first.title}
            </h2>
            {first.paragraphs?.map((paragraph, i) => (
              <p
                key={i}
                {...cms(`${p}.sections.0.paragraphs.${i}`)}
                className="mt-4 text-lg leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          {first.bullets && (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {first.bullets.map((item, i) => (
                <Reveal as="li" key={i} variant={reveal} delay={i * 90}>
                  <div className="flex h-full flex-col items-center rounded-2xl bg-surface p-6 text-center shadow-soft ring-1 ring-line/60 transition-transform duration-500 md:hover:-translate-y-1.5">
                    <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-dark">
                      <CheckIcon className="h-6 w-6" />
                    </span>
                    <p {...cms(`${p}.sections.0.bullets.${i}`)} className="font-display font-bold leading-snug text-ink">
                      {item}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ================= סעיפי אמצע ================= */}
      {middle.length > 0 && (
        <section className="section pb-0">
          <div className="container grid gap-6 md:grid-cols-2 md:gap-7">
            {middle.map((section, i) => (
              <Reveal key={i} variant={reveal} delay={i * 120}>
                <article className="card h-full p-8 md:p-9">
                  <h2 {...cms(`${p}.sections.${i + 1}.title`)} className="text-2xl text-accent-dark">
                    {section.title}
                  </h2>
                  <SectionBody section={section} path={`${p}.sections.${i + 1}`} />
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
              <div className="relative overflow-hidden rounded-[2rem] bg-accent px-7 py-10 text-center text-white md:px-16 md:py-12">
                <span
                  aria-hidden
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-12 -left-6 h-48 w-48 rounded-full bg-gold/20"
                />
                <h2
                  id="service-highlight"
                  {...cms(`${p}.sections.${service.sections.length - 1}.title`)}
                  className="relative text-3xl text-white sm:text-4xl"
                >
                  {last.title}
                </h2>
                {last.paragraphs?.map((paragraph, i) => (
                  <p
                    key={i}
                    {...cms(`${p}.sections.${service.sections.length - 1}.paragraphs.${i}`)}
                    className="relative mx-auto mt-0 max-w-2xl text-lg leading-normal text-white/90 first-of-type:mt-4"
                  >
                    {paragraph}
                  </p>
                ))}
                {last.bullets && (
                  <ul className="relative mx-auto mt-6 grid max-w-2xl gap-3 text-right sm:grid-cols-2">
                    {last.bullets.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-gold" />
                        <span
                          {...cms(`${p}.sections.${service.sections.length - 1}.bullets.${i}`)}
                          className="text-white/90"
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {last.cta && (
                  <>
                    {last.ctaNote && (
                      <p
                        {...cms(`${p}.sections.${service.sections.length - 1}.ctaNote`)}
                        className="relative mt-5 font-display text-lg font-bold text-ink"
                      >
                        {last.ctaNote}
                      </p>
                    )}
                    <a
                      href={whatsappLink(`היי רוזיטל, הגעתי דרך האתר ואשמח לשריין מקום ל${service.cardTitle} :)`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp relative mt-3"
                    >
                      <span {...cms(`${p}.sections.${service.sections.length - 1}.cta`)}>{last.cta}</span>
                      <WhatsappIcon className="h-5 w-5" />
                    </a>
                  </>
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
            title={
              <span id="gallery-title" {...cms(`${p}.galleryTitle`)}>
                {service.galleryTitle}
              </span>
            }
          />
          <ImageGallery
            images={service.gallery}
            motion={service.motion}
            className="mt-10"
            cmsPath={`${p}.gallery`}
          />
        </div>
      </section>

      {/* ================= סרטון =================
          מוצג רק בתחומים שהוגדר להם סרטון */}
      {service.videos && service.videos.length > 0 && (
        <section
          className="section pt-0"
          aria-label={service.videosTitle ? undefined : "סרטונים מהסדנה"}
          aria-labelledby={service.videosTitle ? "service-videos" : undefined}
        >
          <div className="container">
            {service.videosTitle && (
              <Reveal variant={reveal} className="mx-auto mb-8 max-w-2xl text-center">
                <h2
                  id="service-videos"
                  {...cms(`${p}.videosTitle`)}
                  className="text-3xl text-accent-dark sm:text-4xl"
                >
                  {service.videosTitle}
                </h2>
              </Reveal>
            )}
            <Reveal variant={reveal} className="mx-auto max-w-3xl">
              {/* כל סרטון מקבל את היחס שלו מהמידות שבתוכן. סרטוני טלפון
                  נבדלים ביניהם ביחס, ומסגרת אחידה הייתה יוצרת פסים שחורים.
                  items-start כדי ששניים בגבהים שונים יתחילו באותו קו. */}
              {/* מספר הטורים נגזר ממספר הפריטים, כדי שהשורה תהיה מלאה
                  בשני המצבים: לגולשת שרואה רק סרטונים, ולעורכת שרואה
                  גם את כרטיס ההוספה. 3 טורים לכל היותר - סרטוני פורטרט
                  נעשים צרים מדי מעבר לזה. */}
              <div
                className={`grid items-start gap-4 sm:gap-5 ${videoColumns(
                  service.videos.length + (editing ? 1 : 0),
                )}`}
              >
                {service.videos.map((clip, i) => (
                  /* התיוג על העוטף ולא על ה-video: לנגן יש פקדים משלו
                     שתופסים את הלחיצה, ובמצב עריכה הם מנוטרלים (ראו
                     cms.css) כדי שהלחיצה תפתח את עורך הסרטונים. */
                  <div
                    key={clip.src}
                    {...cms(`${p}.videos.${i}`, "video")}
                    style={{ aspectRatio: clip.width && clip.height ? `${clip.width} / ${clip.height}` : "9 / 16" }}
                    className="w-full overflow-hidden rounded-2xl bg-black shadow-card"
                  >
                    <video
                      src={asset(clip.src)}
                      controls
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
                {/* פריט ברשת ולא שורה מתחתיה, כדי שיישב ליד הסרטון
                    כשיש עמודה פנויה */}
                <AddVideoTile cmsPath={`${p}.videos`} count={service.videos.length} />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ================= המלצות =================
          מוצג רק בתחומים שיש להם המלצות אמיתיות */}
      {service.testimonials && service.testimonials.length > 0 && (
        <section className="section pt-0" aria-labelledby="testimonials-title">
          <div className="container">
            <SectionTitle
              title={
                <span id="testimonials-title">
                  <span {...cms(`${p}.testimonialsTitle`)}>
                    {service.testimonialsTitle ?? "מה אומרים אחרי המפגש"}
                  </span>
                </span>
              }
            />
            <Testimonials
              items={service.testimonials}
              motion={service.motion}
              image={service.testimonialsImage}
              cmsPath={`${p}.testimonials`}
            />
          </div>
        </section>
      )}

      {/* ================= יצירת קשר ================= */}
      <section id="contact" className="section scroll-mt-24 bg-accent-soft/45" aria-labelledby="form-title">
        <div className="container">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 id="form-title" {...cms(`${p}.cta.title`)} className="text-3xl text-accent-dark sm:text-4xl">
              {service.cta.title}
            </h2>
            <p {...cms(`${p}.cta.text`)} className="mt-4 text-lg leading-relaxed text-muted">
              {service.cta.text}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href={whatsappLink(`היי רוזיטל, אשמח לפרטים על ${service.cardTitle} :)`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full sm:w-auto"
              >
                <span {...cms(`${p}.cta.button`)}>{service.cta.button ?? "שלחו וואטסאפ"}</span>
                <WhatsappIcon className="h-5 w-5" />
              </a>
              <a href={telLink} className="btn-primary w-full sm:w-auto">
                <PhoneIcon className="h-5 w-5" />
                <span dir="ltr">{site.phone.display}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

    </ServiceTheme>
  );
}
