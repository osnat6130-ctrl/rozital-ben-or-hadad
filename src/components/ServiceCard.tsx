import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import ServiceTheme from "./ServiceTheme";
import { ArrowIcon } from "./Icons";
import type { Service } from "@/data/services";
import { asset } from "@/lib/utils";

type Props = { service: Service; index?: number };

export default function ServiceCard({ service, index = 0 }: Props) {
  return (
    <Reveal
      variant={service.motion === "calm" ? "calm" : "pop"}
      delay={index * 120}
      className="h-full"
    >
      <ServiceTheme theme={service.theme} className="h-full">
        <Link
          to={service.path}
          className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-line/70 transition-all duration-500 hover:shadow-lift md:hover:-translate-y-2"
        >
          {/* פס צבע התחום */}
          <span className="absolute inset-x-0 top-0 z-10 h-1.5 bg-accent" />

          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={asset(service.cardImage)}
              alt={service.cardTitle}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              width={640}
              height={480}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-accent-dark/45 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
          </div>

          <div className="flex flex-1 flex-col p-6 sm:p-7">
            <h3 className="font-display text-lg font-extrabold text-accent-dark sm:text-xl">
              {service.cardTitle}
            </h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted">{service.cardText}</p>

            <span className="mt-6 inline-flex items-center gap-2 font-display text-base font-bold text-accent">
              לפרטים נוספים
              <ArrowIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1.5" />
            </span>
          </div>
        </Link>
      </ServiceTheme>
    </Reveal>
  );
}
