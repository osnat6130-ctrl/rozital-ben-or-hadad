import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { MenuIcon, PhoneIcon } from "./Icons";
import { navItems, site, telLink } from "@/data/site";
import { cn } from "@/lib/utils";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  /* ה-Hero של דף הבית כהה, ולכן בראש הדף ה-Header שקוף עם טקסט בהיר
     ויושב על גבי התמונה. ברגע שגוללים הוא הופך לפס בהיר רגיל. */
  const overDarkHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // סגירת התפריט במעבר בין עמודים
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2 focus:text-white"
      >
        דילוג לתוכן הראשי
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          overDarkHero
            ? "bg-transparent"
            : scrolled
              ? "bg-surface/95 shadow-soft backdrop-blur-md"
              : "bg-surface/80 backdrop-blur-md",
        )}
      >
        <div className="container flex h-[72px] items-center justify-between gap-4 md:h-20">
          <Link to="/" aria-label={`${site.name} - לדף הבית`} className="shrink-0">
            <Logo invert={overDarkHero} />
          </Link>

          <nav aria-label="ניווט ראשי" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "relative block rounded-full px-4 py-2 font-display text-[0.97rem] font-bold transition-colors duration-200",
                        overDarkHero
                          ? isActive
                            ? "text-gold"
                            : "text-hero-ink/80 hover:text-gold"
                          : isActive
                            ? "text-brand"
                            : "text-ink/75 hover:text-brand",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        <span
                          className={cn(
                            "absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-gold transition-all duration-300",
                            isActive ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={telLink}
              className={cn(
                "btn hidden !px-5 !py-2.5 !text-base shadow-soft hover:shadow-lift md:hover:-translate-y-0.5 sm:inline-flex",
                overDarkHero
                  ? "bg-gold text-hero hover:brightness-105"
                  : "bg-accent text-white hover:brightness-110",
              )}
              aria-label={`חיוג לרוזיטל: ${site.phone.display}`}
            >
              <PhoneIcon className="h-5 w-5" />
              <span dir="ltr">{site.phone.display}</span>
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden",
                overDarkHero
                  ? "bg-hero-ink/12 text-hero-ink hover:bg-gold hover:text-hero"
                  : "bg-brand-soft text-brand-dark hover:bg-brand hover:text-white",
              )}
              aria-label="פתיחת תפריט"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
