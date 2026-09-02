# רוזיטל בן אור חדד - אתר תדמית

אתר תדמיתי בעברית (RTL), ממוקד המרות: להוביל את הגולשת לבחור תחום ולפנות לרוזיטל
בוואטסאפ, בטלפון או דרך הטופס.

**סטאק:** React 18 + TypeScript + Vite + Tailwind CSS + React Router
(אותו סטאק שבו Lovable עובד - כדי שההעברה לשם בסוף תהיה חלקה).

---

## הרצה מקומית

```bash
npm install
```

```bash
npm run dev
```

בנייה לפרודקשן:

```bash
npm run build
```

---

## מבנה הפרויקט

```
src/
├── data/
│   ├── site.ts          ← ‼️ פרטי קשר, סלוגן, אודות, תפריט, "שלוש סיבות"
│   └── services.ts      ← ‼️ כל התוכן של שלושת התחומים (טקסטים, צבעים, תמונות, SEO)
├── components/
│   ├── Layout.tsx           מעטפת: Header + תוכן + Footer + כפתורים צפים
│   ├── Header.tsx           ניווט עליון דביק
│   ├── MobileMenu.tsx       תפריט המבורגר
│   ├── Footer.tsx           פוטר מלא + קרדיט
│   ├── HomeHero.tsx         Hero כהה של דף הבית ("אור בין הידיים")
│   ├── ServiceCard.tsx      כרטיס תחום
│   ├── ServiceTheme.tsx     מחליף את צבע ה-accent לפי התחום
│   ├── SectionTitle.tsx     כותרת אזור
│   ├── AboutPreview.tsx     אזור אודות בדף הבית
│   ├── Reasons.tsx          שלוש סיבות לבחור ברוזיטל
│   ├── CTASection.tsx       אזור הנעה לפעולה
│   ├── ContactForm.tsx      טופס יצירת קשר
│   ├── ImageGallery.tsx     גלריה
│   ├── Lightbox.tsx         תצוגת תמונה מוגדלת
│   ├── FloatingActions.tsx  וואטסאפ צף + סרגל חיוג במובייל
│   ├── Reveal.tsx           אנימציות גלילה
│   ├── HeroMedia.tsx        תמונה או סרטון ב-Hero של דף שירות
│   ├── Seo.tsx              ניהול תגיות head לכל עמוד
│   ├── Logo.tsx             הלוגו (שכבות שקופות מהקובץ המקורי)
│   └── Icons.tsx            אייקונים inline
├── pages/
│   ├── Home.tsx
│   ├── ServicePage.tsx      דף שירות גנרי - משרת את שלושת התחומים
│   ├── About.tsx
│   ├── Contact.tsx
│   └── NotFound.tsx
├── lib/
│   ├── leads.ts         ‼️ שליחת הטופס (כרגע מצב הדגמה)
│   └── utils.ts
└── index.css            ‼️ פלטת הצבעים המרכזית (משתני CSS)
```

**עקרון מרכזי:** כל התוכן והצבעים מרוכזים ב-`src/data/` וב-`src/index.css`.
אין צורך לגעת בקומפוננטות כדי לשנות טקסט, צבע, תמונה או מספר טלפון.

---

## ‼️ רשימת ה-TODO - מה ממתין לחומרים מרוזיטל

| מה | איפה מחליפים |
|---|---|
| ~~מספר טלפון~~ ✔ התקבל | `src/data/site.ts` → `site.phone` (לאמת שהוואטסאפ באותו מספר) |
| סלוגן וכותרת ה-Hero | `src/data/site.ts` → `tagline`, `heroTitle`, `heroSubtitle` |
| טקסט אודות + סיפור אישי | `src/data/site.ts` → `about` |
| רקע מקצועי / הכשרות | `src/data/site.ts` → `about.credentials` (ריק = לא מוצג) |
| טקסטים של שלושת התחומים | `src/data/services.ts` |
| כותרות ותיאורי SEO | `src/data/services.ts` → `seo` בכל תחום |
| צבעי המותג | `src/index.css` → בלוק `:root` (כולל `--hero-*` ל-Hero הכהה) |
| צבע ייחודי לכל תחום | `src/data/services.ts` → `theme` |
| תמונות | `public/images/` - לשמור באותם שמות קבצים |
| סרטון ב-Hero (אופציונלי) | `public/videos/` + השדה `heroVideo` ב-`src/data/services.ts` |
| הלוגו | קבצי `public/logo-*.png` - פירוט בראש `src/components/Logo.tsx` |
| דומיין | `src/data/site.ts`, `index.html`, `public/robots.txt`, `public/sitemap.xml` |
| חיבור הטופס לשליחה אמיתית | `.env` → `VITE_FORM_ENDPOINT` (פירוט ב-`src/lib/leads.ts`) |
| תמונת שיתוף לרשתות | כרגע משתמש בלוגו המקורי. להוסיף `public/og-image.jpg` (1200×630) ולעדכן ב-`index.html` וב-`src/components/Seo.tsx` |

**לא הומצא שום מידע בשם הלקוחה** - אין באתר טענות על ותק, הכשרות, מחירים,
משכי מפגש או גדלי קבוצה. הטקסטים הזמניים הם ניסוח שיווקי כללי בלבד.

### התמונות הזמניות

ב-`public/images/` יש 17 תמונות SVG זמניות עם התווית "תמונה זמנית".
כשמגיעות התמונות האמיתיות: לשמור אותן באותם שמות (עדיף `.webp`),
ולעדכן את הסיומות ב-`src/data/services.ts` וב-`src/data/site.ts`.
יחסי הגובה-רוחב שהעיצוב מצפה להם:

- `*-hero` - 4:3
- `*-banner` - 16:7 (תמונת הרוחב באזור "למי זה מתאים")
- `*-card` - 4:3
- תמונות גלריה - 1:1
- `hero-main` - 1:1
- `rozital` - 7:8 (פורטרט, עמוד אודות)
- `rozital-hero.jpg` - 1:1 (הפורטרט בדף הבית. מומלץ 1200x1200 ומעלה)

---

## מה כבר מיושם

- **מבנה:** 6 עמודים - בית, שלושה דפי שירות, אודות, צור קשר (+ עמוד 404).
- **מיתוג:** שפה עיצובית אחידה, עם צבע accent ייחודי לכל תחום שמתחלף אוטומטית.
- **אנימציות:** scroll reveal בעוצמה שונה לפי אופי התחום - רגוע בהרצאות,
  קופצני יותר ביוגה צחוק ובבת מצווה. תמיכה מלאה ב-`prefers-reduced-motion`.
- **המרות:** וואטסאפ צף בדסקטופ, סרגל וואטסאפ+חיוג קבוע במובייל,
  CTA בכל דף שירות, טופס בשלושת דפי השירות ובעמוד צור קשר.
- **טופס:** ולידציה בעברית, מצבי טעינה/הצלחה/שגיאה, מלכודת ספאם,
  והודעת הצלחה "תודה, רוזיטל תחזור אלייך בהקדם :)".
- **SEO:** title + description ייחודיים לכל עמוד, canonical, Open Graph,
  JSON-LD, sitemap, robots, HTML סמנטי, alt לכל תמונה.
- **נגישות:** ניווט מקלדת מלא, focus states, דילוג לתוכן, ARIA לתפריט וללייטבוקס,
  היררכיית כותרות תקינה.
- **ביצועים:** אפס ספריות אנימציה חיצוניות, lazy loading, פונטים עם preconnect.

---

## פריסה (Deploy)

האתר הוא SPA, ולכן השרת צריך להחזיר את `index.html` לכל נתיב:

- **Netlify** - מטופל ע"י `public/_redirects`
- **Vercel** - מטופל ע"י `vercel.json`
- **אחסון אחר** - להגדיר rewrite של `/*` ל-`/index.html`

---

## הלוגו

הלוגו שהתקבל היה JPEG עם רקע לבן. הרקע הוסר והלוגו פורק לשכבות שקופות:

| קובץ | מה זה |
|---|---|
| `public/logo-mark.png` | הנורה + הידיים |
| `public/logo-name.png` | "רוזיטל בן אור חדד" |
| `public/logo-tagline.png` | שורת הסלוגן בכתב יד |
| `public/logo-wordmark.png` | השם + הסלוגן יחד |
| `public/logo-full.png` | הלוגו המלא |
| `public/logo-original.jpg` | הקובץ המקורי, לשמירה |
| `public/favicon.png`, `public/apple-touch-icon.png` | אייקוני דפדפן |

אם יתקבל קובץ לוגו באיכות גבוהה יותר - לשמור אותו כ-`public/logo-original.jpg`
ולהריץ מחדש:

```bash
node scripts/extract-logo.mjs public/logo-original.jpg public
```

```bash
node scripts/make-favicons.mjs
```

---

נבנה ועוצב באהבה על ידי אוסנת בניסטי.
