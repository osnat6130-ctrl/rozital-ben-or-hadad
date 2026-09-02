import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { iconMap } from "./Icons";
import { reasons } from "@/data/site";

export default function Reasons() {
  return (
    <section className="section bg-brand-soft" aria-labelledby="reasons-title">
      <div className="container">
        <SectionTitle
          title={
            <span id="reasons-title">
              שלוש סיבות שכולן מספרות עליהן <span className="underline-brush">אחר כך</span>
            </span>
          }
        />

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {reasons.map((reason, i) => {
            const Icon = iconMap[reason.icon];
            return (
              <Reveal as="li" key={reason.title} delay={i * 120}>
                <div className="card h-full p-8 text-center transition-transform duration-500 md:hover:-translate-y-1.5">
                  <span className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/25 text-brand-dark">
                    <Icon className="h-8 w-8" />
                  </span>
                  <h3 className="text-xl">{reason.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{reason.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
