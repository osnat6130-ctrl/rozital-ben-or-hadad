import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import { PhoneIcon, WhatsappIcon } from "@/components/Icons";
import { site, telLink, whatsappLink } from "@/data/site";

const sections: { title: string; paragraphs: string[] }[] = [
  {
    title: "המחויבות שלנו לנגישות",
    paragraphs: [
      `אתר ${site.name} נבנה מתוך רצון שכל אדם - כולל אנשים עם מוגבלויות - יוכל לגלוש בו, להבין את התוכן שבו ולפנות אלינו בקלות. אנחנו רואים בנגישות ערך מרכזי, בדיוק כמו שהוא עומד בבסיס העשייה המקצועית שלנו.`,
    ],
  },
  {
    title: "התאמות הנגישות באתר",
    paragraphs: [
      "האתר תוכנן ונבנה תוך התייחסות להנחיות הנגישות הבינלאומיות WCAG 2.1 ברמה AA, ולתקן הישראלי (ת\"י 5568), ובהם:",
    ],
  },
];

const accessibilityFeatures = [
  "מבנה עמודים סמנטי וברור, עם היררכיית כותרות עקבית",
  "טקסט חלופי (alt) לתמונות בעלות משמעות",
  "ניגודיות צבעים נאותה בין טקסט לרקע",
  "אפשרות ניווט מלאה במקלדת, כולל קישור דילוג לתוכן הראשי",
  "מסגרת פוקוס ברורה לכל רכיב אינטראקטיבי",
  "תמיכה בהגדרת \"תנועה מופחתת\" של הדפדפן, המכבה אנימציות למי שבחר בכך",
  "תאימות לתצוגה במגוון גדלי מסך ורמות הגדלה",
];

export default function Accessibility() {
  return (
    <>
      <Seo
        title={`הצהרת נגישות | ${site.name}`}
        description={`הצהרת הנגישות של אתר ${site.name} - ההתאמות שבוצעו, המגבלות הידועות ודרכי יצירת קשר בנושא נגישות.`}
        path="/accessibility"
      />

      <section className="relative overflow-hidden bg-accent-wash pb-14 pt-10 md:pb-16 md:pt-14">
        <span
          aria-hidden
          className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-gold/25 blur-3xl"
        />
        <div className="container relative text-center">
          <Reveal>
            <h1 className="text-4xl sm:text-5xl">הצהרת נגישות</h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
              אנחנו עובדים כל הזמן כדי שהאתר יהיה נגיש וידידותי לכל המשתמשות והמשתמשים.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section pt-12">
        <div className="container">
          <div className="mx-auto max-w-2xl space-y-10">
            {sections.map((section, i) => (
              <Reveal key={section.title} delay={i * 100}>
                <h2 className="text-2xl text-brand-dark">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-lg leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
              </Reveal>
            ))}

            <Reveal delay={200}>
              <ul className="-mt-2 space-y-2.5 text-lg leading-relaxed text-muted">
                {accessibilityFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={260}>
              <h2 className="text-2xl text-brand-dark">מגבלות ידועות</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                למרות המאמצים שהושקעו, ייתכן שיישארו באתר חלקים שאינם נגישים באופן מלא. אם נתקלתם
                בקושי כלשהו, נשמח לדעת ולתקן בהקדם האפשרי.
              </p>
            </Reveal>

            <Reveal delay={320}>
              <h2 className="text-2xl text-brand-dark">פנייה בנושא נגישות</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                נתקלתם בבעיית נגישות באתר, או שיש לכם בקשה להתאמת נגישות? אפשר לפנות אלינו ישירות
                ונטפל בכך בהקדם.
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

            <Reveal delay={380}>
              <p className="border-t border-line pt-6 text-sm text-muted/80">
                הצהרת הנגישות עודכנה לאחרונה בספטמבר 2026.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
