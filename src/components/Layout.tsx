import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FloatingActions from "./FloatingActions";
import AccessibilityWidget from "./AccessibilityWidget";
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

  /* ב-Hero הכהה של דף הבית ה-Header שקוף ויושב על גבי התמונה,
     ולכן שם אין ריווח עליון - ה-Hero עצמו מספק אותו. */
  const headerOverlaysHero = pathname === "/";

  return (
    /* pb - מפצה על סרגל הפעולות הקבוע במובייל, כדי שלא יסתיר את הפוטר */
    <div className="flex min-h-screen flex-col pb-[72px] lg:pb-0">
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
    </div>
  );
}
