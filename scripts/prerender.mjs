/* ============================================================================
   עמוד HTML אמיתי לכל נתיב: תגיות, תוכן, נתונים מובנים, סייטמאפ ו-llms.txt
   ----------------------------------------------------------------------------
   ‼️ הבעיה שזה פותר:
   האתר הוא SPA. גם התגיות (title, description, canonical, og) וגם **כל
   הטקסט** נוצרים ב-JavaScript אחרי הטעינה, ולכן ה-HTML הגולמי הוא
   בפועל <div id="root"></div> ריק.

   מי שלא מריץ JavaScript רואה עמוד ריק, ואלה בדיוק הסורקים שחשובים כאן:
   - וואטסאפ, פייסבוק וטוויטר קוראים HTML גולמי בלבד. כל קישור פנימי
     שנשלח בוואטסאפ הציג את הכותרת, התיאור והתמונה של דף הבית.
   - ChatGPT, Perplexity ו-Claude מביאים את הדף ולא מריצים JavaScript.
     בלי טקסט ב-HTML הם לא יודעים על האתר הזה שום דבר.
   גוגל כן מריץ JavaScript ולכן בסוף ראה את התוכן, אבל הוא היחיד.

   באתר שבו וואטסאפ הוא ערוץ ההמרה המרכזי, זה לא ניואנס.

   הפתרון: אחרי הבנייה נכתב עמוד HTML לכל נתיב, ובו התגיות הנכונות שלו,
   הנתונים המובנים שלו, והטקסט שלו כ-HTML אמיתי.

   ‼️ למה התוכן הוא <div id="prerendered"> ולא בתוך #root:
   React כאן עושה createRoot().render() ולא הידרציה, כלומר הוא מוחק את
   מה שיש ב-#root. תוכן שהיה נכנס לשם היה נראה למשתמשת כהבהוב של טקסט
   בלי עיצוב עד שה-JavaScript נטען. במקום זה יש אזור נפרד, שמוסתר
   ב-CSS (`#prerendered { display: none }` ב-src/index.css) ונחשף שוב
   ב-<noscript> למי שאין לו JavaScript בכלל. הסתרה ב-CSS ולא בסקריפט
   כי ה-CSP שלנו אוסר סקריפט inline.

   הסייטמאפ, ה-llms.txt וכותרות ה-X-Route נוצרים מאותה רשימת נתיבים,
   כדי שהם לא יוכלו להתפצל ממנה.
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const site = JSON.parse(fs.readFileSync("src/content/site.json", "utf8"));
const services = JSON.parse(fs.readFileSync("src/content/services.json", "utf8"));

const ORIGIN = site.site.url.replace(/\/$/, "");
const DEFAULT_OG = `${ORIGIN}/logo-original.jpg`;
const S = site.site;

const escapeHtml = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** JSON-LD בתוך <script> - נסגר על "</" ולא על מרכאות, ולכן זה מה שנוטרל */
const jsonLdSafe = (data) => JSON.stringify(data).replace(/</g, "\\u003c");

const absolute = (relative) => `${ORIGIN}${relative}`;

/* ‼️ לתמונת שיתוף מעדיפים את התאום ה-JPEG אם הוא קיים.
   כל התמונות באתר הן WebP (ראו scripts/to-webp.mjs), אבל התמיכה של
   וואטסאפ ב-WebP בתצוגה מוקדמת של קישור לא עקבית - והתוצאה היא קישור
   בלי תמונה, בערוץ ההמרה המרכזי של האתר. הסקריפט משאיר עותק JPEG
   בדיוק לתמונות האלה, וזה המקום שבו הוא נבחר. */
function shareImage(relative) {
  if (!relative) return null;
  const jpg = relative.replace(/\.webp$/i, ".jpg");
  if (jpg === relative) return relative;
  return fs.existsSync(path.join("public", jpg.replace(/^\//, ""))) ? jpg : relative;
}

/* ‼️ מידות התמונה החברתית, נקראות מהקובץ עצמו.
   בלי og:image:width/height וואטסאפ ופייסבוק צריכים להוריד את התמונה
   כדי לדעת את גודלה, ועד אז הם מציגים תצוגה מוקדמת קטנה בלי תמונה -
   או בלי כלום. עם המידות התצוגה נבנית מיד.
   הקריאה היא מכותרת הקובץ ובלי ספרייה: בנייה בקלאודפלייר לא מתקינה
   כלים לעיבוד תמונה, וזה ממילא רק שני מספרים. */
function imageSize(publicPath) {
  let buffer;
  try {
    buffer = fs.readFileSync(path.join("public", publicPath.replace(/^\//, "")));
  } catch {
    return null;
  }
  // PNG: IHDR מיד אחרי החתימה
  if (buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  // WebP - שלוש הצורות: VP8X (עם תוספות), VP8 (אבד רגיל), VP8L (ללא אבדן)
  if (buffer.length > 30 && buffer.toString("ascii", 0, 4) === "RIFF") {
    const form = buffer.toString("ascii", 12, 16);
    if (form === "VP8X") {
      return { width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1, height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1 };
    }
    if (form === "VP8 ") {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (form === "VP8L") {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  // JPEG: מדלגים ממקטע למקטע עד ל-SOF, שבו יושבים הגובה והרוחב
  if (buffer.length > 4 && buffer.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  return null;
}

/* ---------------------------------------------------------------------------
   נתונים מובנים (schema.org)
   ‼️ זה המקום היחיד שבו הם נבנים. הייתה גרסה שנייה בקומפוננטות
   (src/pages/*.tsx) שנוספה ב-JavaScript, ולכן הגיעה רק לגוגל - ועל
   כל עמוד היו שני בלוקים שמתארים את אותו דבר בפירוט שונה.
   ------------------------------------------------------------------------- */

const person = {
  "@type": "Person",
  name: S.name,
  jobTitle: "מרצה, מדריכת הורים ומנחת יוגה צחוק",
  description: site.about.pageIntro,
  telephone: S.phone.dial,
  url: `${ORIGIN}/about`,
  image: absolute(shareImage(site.about.pageImage)),
  /* ההסמכות מגיעות מקובץ התוכן ולא נכתבות כאן, כדי שעריכה בפאנל
     תעדכן גם את הנתונים המובנים */
  hasCredential: site.about.credentials.map((credential) => ({
    "@type": "EducationalOccupationalCredential",
    name: credential,
  })),
};

const organization = {
  "@type": "ProfessionalService",
  "@id": `${ORIGIN}/#business`,
  name: S.name,
  slogan: S.tagline,
  description: site.home.seo.description,
  url: `${ORIGIN}/`,
  telephone: S.phone.dial,
  image: absolute(shareImage(S.heroImage)),
  logo: DEFAULT_OG,
  /* areaServed נשאר "IL" עד שיוגדר אזור שירות מדויק ב-site.json.
     serviceArea קיים בקובץ התוכן וריק - ברגע שימולא הוא ייכנס לכאן. */
  areaServed: S.serviceArea || "IL",
  availableLanguage: "he",
  founder: person,
  makesOffer: services.map((service) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: service.cardTitle,
      description: service.cardText,
      url: absolute(service.path),
    },
  })),
};

const breadcrumbs = (route, label) => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "דף הבית", item: `${ORIGIN}/` },
    ...(route === "/" ? [] : [{ "@type": "ListItem", position: 2, name: label, item: absolute(route) }]),
  ],
});

const graph = (...nodes) => ({ "@context": "https://schema.org", "@graph": nodes.filter(Boolean) });

/* ---------------------------------------------------------------------------
   הטקסט שנכנס ל-HTML הגולמי
   כותרת H1 אחת, פסקאות, כותרות משנה, רשימות, וקישורים פנימיים לכל
   שאר העמודים - כדי שסורק שמגיע לעמוד אחד ימצא משם את כולם.
   ------------------------------------------------------------------------- */

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);
const paragraphs = (values) => asArray(values).map((text) => `<p>${escapeHtml(text)}</p>`);
const list = (values) =>
  asArray(values).length ? [`<ul>${asArray(values).map((v) => `<li>${escapeHtml(v)}</li>`).join("")}</ul>`] : [];

/** קישורים פנימיים - אותה רשימה שבתפריט האתר */
const internalLinks = () =>
  `<nav aria-label="ניווט באתר"><ul>${site.nav
    .map((item) => `<li><a href="${escapeHtml(item.to)}">${escapeHtml(item.label)}</a></li>`)
    .join("")}</ul></nav>`;

const contactBlock = () =>
  `<p>לפרטים ולהרשמה: <a href="tel:${escapeHtml(S.phone.dial)}">${escapeHtml(S.phone.display)}</a></p>`;

function serviceBody(service) {
  const parts = [`<h1>${escapeHtml(service.heroTitle)}</h1>`, ...paragraphs(service.heroSubtitle)];
  for (const section of service.sections) {
    if (section.title) parts.push(`<h2>${escapeHtml(section.title)}</h2>`);
    parts.push(...paragraphs(section.paragraphs), ...list(section.bullets));
  }
  if (service.testimonials?.length) {
    parts.push(`<h2>${escapeHtml(service.testimonialsTitle || "המלצות")}</h2>`);
    for (const testimonial of service.testimonials) {
      /* ‼️ ההמלצות נכנסות ל-HTML כטקסט ולא כ-Review של schema.org.
         Review דורש author, ולהמלצות כאן אין שם במכוון - חלקן על
         ילדות, והשמות הוסרו. "author: אנונימי" בנתונים מובנים זה
         בדיוק סוג הסימון שגוגל מתייג כספאם. */
      parts.push(
        `<blockquote><p>${escapeHtml(testimonial.text || "")}</p>${
          testimonial.context ? `<footer>${escapeHtml(testimonial.context)}</footer>` : ""
        }</blockquote>`,
      );
    }
  }
  return parts;
}

function homeBody() {
  return [
    `<h1>${escapeHtml(`${S.heroTitle} ${S.heroTitleHighlight}`)}</h1>`,
    ...paragraphs(S.heroSubtitle),
    `<h2>${escapeHtml(site.home.servicesTitle)}</h2>`,
    ...services.map(
      (service) =>
        `<h3><a href="${escapeHtml(service.path)}">${escapeHtml(service.cardTitle)}</a></h3><p>${escapeHtml(
          service.cardText,
        )}</p>`,
    ),
    `<h2>${escapeHtml(site.about.previewTitle)}</h2>`,
    ...paragraphs(site.about.previewText),
    `<h2>${escapeHtml(`${site.home.reasonsTitle} ${site.home.reasonsTitleHighlight}`)}</h2>`,
    ...site.reasons.map((reason) => `<h3>${escapeHtml(reason.title)}</h3><p>${escapeHtml(reason.text)}</p>`),
  ];
}

function aboutBody() {
  return [
    `<h1>${escapeHtml(site.aboutPage.title)}</h1>`,
    ...paragraphs(site.about.pageIntro),
    ...paragraphs(site.about.story),
    `<h2>${escapeHtml(site.aboutPage.principlesTitle)}</h2>`,
    ...site.about.principles.map((p) => `<h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.text)}</p>`),
    `<h2>${escapeHtml(site.aboutPage.certificatesTitle)}</h2>`,
    ...list(site.about.credentials),
  ];
}

function contactBody() {
  return [
    `<h1>${escapeHtml(`${site.contact.title} ${site.contact.titleHighlight}`)}</h1>`,
    ...paragraphs(site.contact.intro),
    ...paragraphs(site.contact.panelText),
    ...site.contact.steps.map((step) => `<h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p>`),
    `<h2>${escapeHtml(site.contact.topicsLabel)}</h2>`,
    ...list(services.map((service) => service.navLabel)),
  ];
}

/* ---------------------------------------------------------------------------
   רשימת הנתיבים. /admin לא כאן במכוון - הוא noindex.
   ------------------------------------------------------------------------- */
const routes = [
  {
    path: "/",
    label: "דף הבית",
    seo: site.home.seo,
    image: S.heroImage,
    priority: "1.0",
    body: homeBody,
    jsonLd: () => graph(organization, person, breadcrumbs("/", "דף הבית")),
  },
  ...services.map((service) => ({
    path: service.path,
    label: service.navLabel,
    seo: service.seo,
    image: service.heroImage,
    priority: "0.9",
    body: () => serviceBody(service),
    jsonLd: () =>
      graph(
        {
          "@type": "Service",
          name: service.title,
          description: service.seo.description,
          serviceType: service.cardTitle,
          url: absolute(service.path),
          image: absolute(shareImage(service.heroImage)),
          provider: { "@id": `${ORIGIN}/#business` },
          areaServed: S.serviceArea || "IL",
        },
        organization,
        breadcrumbs(service.path, service.navLabel),
      ),
  })),
  {
    path: "/about",
    label: "אודות",
    seo: site.aboutPage.seo,
    image: site.about.pageImage,
    priority: "0.8",
    body: aboutBody,
    jsonLd: () => graph({ ...person, mainEntityOfPage: absolute("/about") }, breadcrumbs("/about", "אודות")),
  },
  {
    path: "/contact",
    label: "צרו קשר",
    seo: site.contact.seo,
    image: S.heroImage,
    priority: "0.8",
    body: contactBody,
    jsonLd: () =>
      graph(
        { "@type": "ContactPage", url: absolute("/contact"), about: { "@id": `${ORIGIN}/#business` } },
        organization,
        breadcrumbs("/contact", "צרו קשר"),
      ),
  },
  {
    path: "/accessibility",
    label: "הצהרת נגישות",
    seo: site.accessibility.seo,
    image: null,
    priority: "0.3",
    body: () => [`<h1>${escapeHtml(site.accessibility.seo.title.split("|")[0].trim())}</h1>`],
    jsonLd: () => graph(breadcrumbs("/accessibility", "הצהרת נגישות")),
  },
];

const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

/** מחליף תגית קיימת, או מוסיף אותה לפני </head> אם אין */
function upsert(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `  ${replacement}\n</head>`);
}

function buildPage(route) {
  /* ‼️ כל ערך שנכנס ל-HTML עובר escaping, גם נתיבי תמונות וגם הכתובת.
     הם מגיעים מקובץ התוכן, שהפאנל כותב - כלומר מי שמחוברת לפאנל
     יכולה לשמור נתיב תמונה שסוגר את התכונה ופותח <script>, והבנייה
     הבאה הייתה מפיצה אותו בכל עמוד לכל מבקר. נתיב תמונה לא נראה כמו
     קלט מסוכן, ובדיוק בגלל זה הוא מסוכן. */
  const { path: route_, seo, image } = route;
  const url = escapeHtml(route_ === "/" ? `${ORIGIN}/` : `${ORIGIN}${route_}`);
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const ogPath = shareImage(image) ?? "/logo-original.jpg";
  const ogImage = escapeHtml(absolute(ogPath));

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = upsert(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`);
  html = upsert(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = upsert(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`);
  html = upsert(
    html,
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${description}" />`,
  );
  html = upsert(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = upsert(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${ogImage}" />`);
  html = upsert(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`);
  html = upsert(
    html,
    /<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${description}" />`,
  );
  html = upsert(html, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${ogImage}" />`);

  /* ‼️ התמונה הראשית נטענת מוקדם ובעדיפות גבוהה.
     היא ה-LCP של העמוד, וכל דחייה שלה נמדדת ישירות ב-Core Web Vitals.
     בלי preload הדפדפן מגלה אותה רק אחרי שה-JavaScript בנה את ה-DOM. */
  const head = [];
  const size = imageSize(ogPath);
  if (size) {
    head.push(`<meta property="og:image:width" content="${size.width}" />`);
    head.push(`<meta property="og:image:height" content="${size.height}" />`);
  }
  if (image) head.push(`<link rel="preload" as="image" href="${escapeHtml(image)}" fetchpriority="high" />`);
  head.push(`<script type="application/ld+json">${jsonLdSafe(route.jsonLd())}</script>`);
  html = html.replace("</head>", `    ${head.join("\n    ")}\n  </head>`);

  /* ‼️ התוכן הסטטי. מוסתר ב-CSS למי שיש לו JavaScript (React מציג את
     האתר האמיתי), ונחשף ב-<noscript> למי שאין. בשני המקרים הוא קיים
     ב-HTML הגולמי, וזה כל העניין. */
  const body = [
    '<noscript><style>#prerendered{display:block !important}</style></noscript>',
    '<div id="prerendered">',
    ...route.body(),
    internalLinks(),
    contactBlock(),
    "</div>",
  ].join("\n      ");
  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n      ${body}`);

  return html;
}

let written = 0;
const headerRules = [];
for (const route of routes) {
  const html = buildPage(route);
  if (route.path === "/") {
    fs.writeFileSync(path.join(DIST, "index.html"), html);
  } else {
    /* ‼️ קובץ שטוח <route>.html ולא תיקייה <route>/index.html.
       קלאודפלייר מגישה "foo.html" בכתובת "/foo" כמו שהיא, אבל תיקייה
       גורמת ל-308 שמוסיף לוכסן בסוף: /bat-mitzvah -> /bat-mitzvah/.
       זה היה משנה את הצורה של כל כתובות האתר, סותר את ה-canonical
       שמצהיר בלי לוכסן, ומוסיף הפניה לכל טעינה ישירה. */
    fs.writeFileSync(path.join(DIST, `${route.path.replace(/^\//, "")}.html`), html);
  }
  /* ‼️ כותרת X-Route לכל נתיב אמיתי. זה מה שמאפשר ל-functions/_middleware.ts
     להבדיל בין עמוד קיים לכתובת שלא קיימת: כתובת לא קיימת מוגשת על ידי
     ה-catch-all שב-_redirects, ולכן לא מקבלת את הכותרת הזו ומקבלת 404.
     בלי זה כל שגיאת 404 חזרה כ-200 ("soft 404"), וגוגל מעניש על זה.
     הכותרת נוצרת מאותה רשימת נתיבים של הבנייה, ולכן היא לא יכולה
     להתפצל ממנה. המידלוור מסיר אותה לפני שהתשובה יוצאת. */
  headerRules.push(`${route.path}\n  X-Route: ${route.path}`);
  written++;
}

const headersPath = path.join(DIST, "_headers");
fs.appendFileSync(headersPath, `\n# נוצר על ידי scripts/prerender.mjs - ראו ההסבר שם\n${headerRules.join("\n")}\n`);

/* --- סייטמאפ מאותה רשימה --- */
const today = new Date().toISOString().slice(0, 10);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map(({ path: route, priority }) =>
    [
      "  <url>",
      `    <loc>${route === "/" ? `${ORIGIN}/` : `${ORIGIN}${route}`}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      "    <changefreq>monthly</changefreq>",
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n"),
  ),
  "</urlset>",
  "",
].join("\n");
fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);

/* --- llms.txt ---
   ‼️ קובץ בשורש שמסביר למודלי שפה מה יש באתר ואיפה. הוא לא תקן רשמי
   ולא מובטח שמישהו קורא אותו, אבל הוא זול, והוא הופך "אתר שיווקי בעברית"
   לרשימה ברורה של מה מוצע, למי, ואיך פונים - וזה מה שמצוטט בתשובה. */
const llms = [
  `# ${S.name}`,
  "",
  `> ${S.tagline}. ${site.home.seo.description}`,
  "",
  `- טלפון: ${S.phone.display}`,
  `- אזור שירות: ${S.serviceArea || "ישראל"}`,
  "- שפה: עברית",
  "",
  "## מה מוצע",
  "",
  ...services.map((service) => `- [${service.cardTitle}](${absolute(service.path)}): ${service.cardText}`),
  "",
  "## עמודים",
  "",
  ...routes.map(({ path: route, label, seo }) => `- [${label}](${route === "/" ? `${ORIGIN}/` : absolute(route)}): ${seo.description}`),
  "",
  "## על רוזיטל",
  "",
  site.about.pageIntro,
  "",
  ...site.about.credentials.map((credential) => `- ${credential}`),
  "",
].join("\n");
fs.writeFileSync(path.join(DIST, "llms.txt"), llms);

console.log(`עמודים סטטיים: ${written} (תגיות + תוכן + נתונים מובנים)`);
console.log(`סייטמאפ: ${routes.length} כתובות, lastmod ${today}`);
console.log(`llms.txt: ${llms.split("\n").length} שורות`);
