import type { CSSProperties, ReactNode } from "react";
import type { Service } from "@/data/services";
import { cn } from "@/lib/utils";

/**
 * עוטף אזור/עמוד ומחליף את צבע ה-accent לגוון של התחום.
 * כל הקומפוננטות משתמשות ב-accent, ולכן הן "מתלבשות" אוטומטית
 * על הצבע הנכון - בלי לשכפל קוד לכל תחום.
 */
export default function ServiceTheme({
  theme,
  children,
  className,
  as: Tag = "div",
}: {
  theme: Service["theme"];
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  const style = {
    "--accent": theme.accent,
    "--accent-dark": theme.accentDark,
    "--accent-soft": theme.accentSoft,
  } as CSSProperties;

  return (
    <Tag style={style} className={cn(className)}>
      {children}
    </Tag>
  );
}
