import type { ReactNode } from "react";
import Reveal from "./Reveal";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "start";
  className?: string;
  /** רמת הכותרת ב-HTML - לשמירה על היררכיה נכונה */
  as?: "h2" | "h3";
};

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  as: Heading = "h2",
}: Props) {
  return (
    <Reveal
      className={cn(
        "mx-auto max-w-2xl",
        align === "center" ? "text-center" : "mx-0 text-right",
        className,
      )}
    >
      {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
      <Heading className="text-3xl sm:text-4xl md:text-[2.6rem]">{title}</Heading>
      {subtitle && (
        <p className="mt-4 text-lg leading-relaxed text-muted">{subtitle}</p>
      )}
    </Reveal>
  );
}
