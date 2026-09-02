import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { ArrowIcon } from "./Icons";
import { about } from "@/data/site";
import { asset } from "@/lib/utils";

export default function AboutPreview() {
  return (
    <section className="section" aria-labelledby="about-preview-title">
      <div className="container grid items-center gap-10 md:grid-cols-2 md:gap-14">
        {/* תמונה */}
        <Reveal variant="side" className="order-2 md:order-1">
          <div className="relative mx-auto max-w-sm md:max-w-none">
            <span
              aria-hidden
              className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold/40 blur-xl"
            />
            <span
              aria-hidden
              className="absolute -bottom-5 -left-5 h-32 w-32 rounded-3xl bg-brand/10"
            />
            <img
              src={asset(about.image)}
              alt={about.imageAlt}
              loading="lazy"
              decoding="async"
              width={560}
              height={640}
              className="relative aspect-[7/8] w-full rounded-3xl object-cover shadow-card"
            />
          </div>
        </Reveal>

        {/* טקסט */}
        <div className="order-1 md:order-2">
          <Reveal>
            <h2 id="about-preview-title" className="text-3xl sm:text-4xl">
              {about.previewTitle}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{about.previewText}</p>
          </Reveal>

          <Reveal delay={120}>
            <Link to="/about" className="btn-outline mt-8">
              קצת יותר עליי
              <ArrowIcon className="h-5 w-5" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
