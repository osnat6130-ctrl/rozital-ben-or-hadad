import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "pop" | "side" | "calm";

type RevealProps = {
  children: ReactNode;
  /** סוג האנימציה - נקבע לפי אופי התחום (calm = רגוע, pop = שמח) */
  variant?: RevealVariant;
  /** השהיה במילישניות, ליצירת אפקט מדורג */
  delay?: number;
  className?: string;
  as?: ElementType;
};

/**
 * חושף אלמנט בגלילה באמצעות IntersectionObserver.
 * ללא ספריות אנימציה חיצוניות - קל מאוד לביצועים.
 * המצב "reduced motion" מטופל ב-index.css.
 */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // אם המשתמש ביקש תנועה מופחתת - מציגים מיד
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
