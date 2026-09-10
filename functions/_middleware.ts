/* מפנה כל כתובת שאינה הכתובת הראשית, ומחזיר 404 אמיתי על נתיב שלא קיים.
 *
 * ‼️ למה ההפניה חשובה ולא רק "מסודרת":
 * כמה כתובות היו מגישות את אותו אתר בלי הפניה ביניהן, והן origins שונים
 * בעיני הדפדפן. עוגיות ו-localStorage לא עוברים בין origins, ולכן
 * התחברות לפאנל ב-rozital.co.il פשוט לא קיימת ב-www.rozital.co.il:
 * המשתמשת מחוברת, רואה אתר בלי סרגל עריכה, ולחיצה על תמונה פותחת הגדלה
 * במקום עריכה. רענון קשיח לא עוזר, כי אין מה לרענן - זה דפדפן אחר
 * מבחינת האחסון. זה קרה בפועל.
 *
 * בנוסף זה מונע תוכן כפול בגוגל: הכתובת הקנונית באתר היא בלי www.
 *
 * 301 ולא 302 - ההעדפה קבועה, ומנועי חיפוש צריכים להעביר את הדירוג. */

const CANONICAL_HOST = "rozital.co.il";

/** נתיבים שהם קובץ ולא עמוד. לא אמורים ליפול ל-catch-all של ה-SPA. */
const ASSET_PATH = /\.(jpe?g|png|webp|gif|svg|ico|mp4|webm|mp3|pdf|woff2?|ttf|txt|xml|json|webmanifest|map)$/i;

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  /* ‼️ כל hostname שאינו הקנוני מופנה, ולא רק www.
     קלאודפלייר מגישה כל פריסה גם בכתובת *.pages.dev, וגם בכתובת
     ייחודית לכל commit. אלה עותקים מלאים וזמינים של האתר, גוגל מצא
     אותם, והם תוכן כפול מושלם - עם התוצאה הרעה שכתובת פריסה זמנית
     יכולה להופיע בחיפוש במקום הדומיין האמיתי.
     localhost ו-127.0.0.1 יוצאים מהכלל: אחרת פיתוח מקומי היה מפנה
     את עצמו לאתר החי בכל בקשה. */
  const host = url.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
  if (host !== CANONICAL_HOST && !isLocalHost) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  const response = await next();

  /* ‼️ קובץ שלא קיים חוזר מה-catch-all שב-public/_redirects
     ("/* /index.html 200") כ-200 עם HTML. ל-/images/* מוגדר מטמון של
     שבוע ב-public/_headers, ולכן קלאודפלייר שמר את ה-HTML הזה תחת
     הכתובת של התמונה - לשבוע שלם.

     זה קרה בפועל: הפאנל הפנה את התוכן לתמונה חדשה מיד אחרי ההעלאה,
     הדפדפן ביקש אותה לפני שהבנייה הסתיימה, וה-HTML נתקע במטמון. אחרי
     שהבנייה הסתיימה התמונה הייתה שם - אבל המטמון המשיך להגיש HTML,
     והתמונה נראתה שבורה.

     תשובת 404 עם no-store לא נשמרת במטמון, ולכן הבקשה הבאה מקבלת את
     הקובץ האמיתי ברגע שהוא קיים. */
  const isHtml = response.headers.get("content-type")?.includes("text/html");
  if (ASSET_PATH.test(url.pathname) && isHtml) {
    return notFound("Not found");
  }

  /* ‼️ 404 אמיתי על עמוד שלא קיים.
     ה-catch-all מגיש את דף הבית על כל כתובת, כלומר /שטויות החזיר 200
     עם עמוד תקין. גוגל קורא לזה soft 404: הוא מוסיף את הכתובת לאינדקס,
     מגלה שהתוכן זהה לדף הבית, ומוריד את האמון בכל האתר.

     ההבחנה נעשית דרך הכותרת X-Route, ש-scripts/prerender.mjs כותב
     ב-dist/_headers לכל נתיב אמיתי - מאותה רשימת נתיבים שממנה נבנים
     גם העמודים וגם הסייטמאפ, ולכן היא לא יכולה להתפצל מהם. כתובת
     שאינה נתיב אמיתי לא מקבלת את הכותרת.

     הגוף נשאר ה-HTML של האתר, ולכן המשתמשת רואה את עמוד ה-404 המעוצב
     (src/pages/NotFound.tsx) ולא טקסט חשוף - רק הסטטוס נכון. */
  if (isHtml && response.status === 200 && !url.pathname.startsWith("/api/")) {
    const route = response.headers.get("X-Route");
    const headers = new Headers(response.headers);
    headers.delete("X-Route");
    if (!route) {
      headers.set("Cache-Control", "no-store");
      return new Response(response.body, { status: 404, headers });
    }
    return new Response(response.body, { status: response.status, headers });
  }

  return response;
};

function notFound(message: string): Response {
  return new Response(message, {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
