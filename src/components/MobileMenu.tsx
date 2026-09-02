import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import { CloseIcon, PhoneIcon, WhatsappIcon } from "./Icons";
import { navItems, site, telLink, whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onClose: () => void };

export default function MobileMenu({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // נעילת גלילת הרקע + סגירה ב-Escape
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* רקע כהה */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-brand-dark/45 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        id="mobile-menu"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="תפריט ניווט"
        className={cn(
          "absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-surface shadow-lift transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירת תפריט"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand-dark transition-colors hover:bg-brand hover:text-white"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <nav aria-label="ניווט במובייל" className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="flex flex-col gap-1">
            {navItems.map((item, i) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-2xl px-4 py-3.5 font-display text-lg font-bold transition-all duration-300",
                      open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                      isActive
                        ? "bg-brand-soft text-brand-dark"
                        : "text-ink/80 hover:bg-brand-soft/60 hover:text-brand-dark",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3 border-t border-line px-5 pb-7 pt-5">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full"
          >
            <WhatsappIcon className="h-5 w-5" />
            שליחת הודעה בוואטסאפ
          </a>
          <a href={telLink} className="btn-outline w-full">
            <PhoneIcon className="h-5 w-5" />
            {site.phone.display}
          </a>
        </div>
      </div>
    </div>
  );
}
