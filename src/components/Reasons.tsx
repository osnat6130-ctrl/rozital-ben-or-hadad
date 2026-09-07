import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { iconMap } from "./Icons";
import { home, reasons } from "@/data/site";
import { cms } from "@/cms/paths";

export default function Reasons() {
  return (
    <section className="section bg-brand-soft" aria-labelledby="reasons-title">
      <div className="container">
        <SectionTitle
          title={
            <span id="reasons-title">
              <span {...cms("site.home.reasonsTitle")}>{home.reasonsTitle}</span>{" "}
              <span {...cms("site.home.reasonsTitleHighlight")} className="underline-brush">
                {home.reasonsTitleHighlight}
              </span>
            </span>
          }
        />

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {reasons.map((reason, i) => {
            const Icon = iconMap[reason.icon];
            return (
              <Reveal as="li" key={i} delay={i * 120}>
                <div className="card h-full p-8 text-center transition-transform duration-500 md:hover:-translate-y-1.5">
                  <span className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/25 text-brand-dark">
                    <Icon className="h-8 w-8" />
                  </span>
                  <h3 {...cms(`site.reasons.${i}.title`)} className="text-xl">
                    {reason.title}
                  </h3>
                  <p {...cms(`site.reasons.${i}.text`)} className="mt-3 leading-relaxed text-muted">
                    {reason.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
