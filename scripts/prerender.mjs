/* ============================================================================
   תגיות SEO סטטיות לכל עמוד + סייטמאפ
   ----------------------------------------------------------------------------
   ‼️ הבעיה שזה פותר:
   האתר הוא SPA, והתגיות (title, description, canonical, og) נקבעות
   ב-JavaScript אחרי הטעינה. גוגל מריץ JavaScript ולכן בסוף רואה אותן,
   אבל **סורקי הרשתות החברתיות לא** - וואטסאפ, פייסבוק וטוויטר קוראים
   את ה-HTML הגולמי בלבד. התוצאה: כל קישור פנימי שנשלח בוואטסאפ הציג
   את הכותרת, התיאור והתמונה של דף הבית.

   באתר שבו וואטסאפ הוא ערוץ ההמרה המרכזי, זה לא ניואנס.

   הפתרון: אחרי הבנייה נכתב עמוד HTML לכל נתיב, עם התגיות הנכונות שלו,
   ב-dist/<route>/index.html. קלאודפלייר מגישה קובץ סטטי לפני שהיא נופלת
   ל-catch-all של ה-SPA, ולכן הסורק מקבל HTML נכון מיד. React ממשיך
   לעבוד כרגיל אחרי הטעינה.

   הסייטמאפ נוצר מאותה רשימת נתיבים, כדי שהשניים לא יוכלו להתפצל.
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const site = JSON.parse(fs.readFileSync("src/content/site.json", "utf8"));
const services = JSON.parse(fs.readFileSync("src/content/services.json", "utf8"));

const ORIGIN = site.site.url.replace(/\/$/, "");
const DEFAULT_OG = `${ORIGIN}/logo-original.jpg`;

/** כל הנתיבים הציבוריים. /admin לא כאן במכוון - הוא noindex. */
const routes = [
  { path: "/", seo: site.home.seo, image: site.site.heroImage, priority: "1.0" },
  ...services.map((s) => ({
    path: s.path,
    seo: s.seo,
    image: s.heroImage,
    priority: "0.9",
  })),
  { path: "/about", seo: site.aboutPage.seo, image: site.about.pageImage, priority: "0.8" },
  { path: "/contact", seo: site.contact.seo, image: site.site.heroImage, priority: "0.8" },
  { path: "/accessibility", seo: site.accessibility.seo, image: null, priority: "0.3" },
];

const escapeHtml = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

/** מחליף תגית קיימת, או מוסיף אותה לפני </head> אם אין */
function upsert(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `  ${replacement}\n</head>`);
}

function buildPage({ path: route, seo, image }) {
  const url = route === "/" ? `${ORIGIN}/` : `${ORIGIN}${route}`;
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const ogImage = image ? `${ORIGIN}${image}` : DEFAULT_OG;

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
  return html;
}

let written = 0;
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
  written++;
}

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

console.log(`תגיות SEO סטטיות: ${written} עמודים`);
console.log(`סייטמאפ: ${routes.length} כתובות, lastmod ${today}`);
