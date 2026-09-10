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

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }

  return next();
};
