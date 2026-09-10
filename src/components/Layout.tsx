import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingActions from "./FloatingActions";
import AccessibilityWidget from "./AccessibilityWidget";
import CmsGate from "@/cms/gate";
import { useCmsVersion } from "@/cms/store";
import { cn } from "@/lib/utils";

/** גלילה לראש העמוד בכל מעבר בין דפים (למעט עוגנים) */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}

export default function Layout() {
  const { pathname } = useLocation();

  /* מאזין לשינויי התוכן של מצב העריכה. בלי זה, ערך שמופיע ביותר ממקום
     אחד (מספר הטלפון, שם לשונית) מתעדכן רק במקום שנלחץ - כי העריכה
     משנה את ה-DOM ישירות, ושאר המופעים ממשיכים להציג את הערך הישן עד
     לרענון. לגולשת רגילה זה מנוי למשתנה שלא משתנה לעולם. */
  useCmsVersion();

  /* ב-Hero הכהה של דף הבית ה-Header שקוף ויושב על גבי התמונה,
     ולכן שם אין ריווח עליון - ה-Hero עצמו מספק אותו. */
  const headerOverlaysHero = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />

      {/* pt - מפצה על ה-header הקבוע */}
      <main
        id="main"
        className={cn("flex-1", !headerOverlaysHero && "pt-[72px] lg:pt-20")}
      >
        <Outlet />
      </main>

      <Footer />
      <FloatingActions />
      <AccessibilityWidget />
      {/* מצב העריכה - נטען רק למי שנכנסה דרך /admin */}
      <CmsGate />
    </div>
  );
}
