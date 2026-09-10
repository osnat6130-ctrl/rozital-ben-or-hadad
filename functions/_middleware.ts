/* מפנה www לכתובת הראשית, לפני כל שאר הטיפול בבקשה.
 *
 * ‼️ למה זה חשוב ולא רק "מסודר":
 * שתי הכתובות היו מגישות את אותו אתר בלי הפניה ביניהן, והן שני origins
 * שונים בעיני הדפדפן. עוגיות ו-localStorage לא עוברים בין origins, ולכן
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
const ASSET_PATH = /\.(jpe?g|png|webp|gif|svg|ico|mp4|webm|mp3|pdf|woff2?|ttf|txt|xml|json|map)$/i;

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
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
  if (ASSET_PATH.test(url.pathname) && response.headers.get("content-type")?.includes("text/html")) {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return response;
};
